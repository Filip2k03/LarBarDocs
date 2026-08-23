package storage

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/minio/minio-go/v7"
	"io"
	"path/filepath"
	"strings"
	"time"
)

var (
	ErrUploadNotFound = errors.New("upload not found")
	ErrUploadInvalid  = errors.New("uploaded object does not match declaration")
)

type Service struct {
	db     *pgxpool.Pool
	client *minio.Client
	bucket string
}
type PresignRequest struct {
	MimeType       string `json:"mime_type"`
	SizeBytes      int64  `json:"size_bytes"`
	ChecksumSHA256 string `json:"checksum_sha256"`
	DocumentType   string `json:"document_type"`
}
type PresignResult struct {
	UploadID  uuid.UUID `json:"upload_id"`
	ObjectKey string    `json:"object_key"`
	UploadURL string    `json:"upload_url"`
	ExpiresAt time.Time `json:"expires_at"`
}

func NewService(db *pgxpool.Pool, client *minio.Client, bucket string) *Service {
	return &Service{db: db, client: client, bucket: bucket}
}
func (s *Service) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return err
	}
	if !exists {
		return s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{})
	}
	return nil
}
func (s *Service) Presign(ctx context.Context, userID uuid.UUID, request PresignRequest) (PresignResult, error) {
	if request.SizeBytes <= 0 || request.SizeBytes > 15<<20 {
		return PresignResult{}, errors.New("file size must be between 1 byte and 15 MiB")
	}
	allowed := map[string]bool{"image/jpeg": true, "image/png": true, "application/pdf": true}
	if !allowed[request.MimeType] || len(request.ChecksumSHA256) != 64 {
		return PresignResult{}, errors.New("unsupported file type or checksum")
	}
	if _, err := hex.DecodeString(request.ChecksumSHA256); err != nil {
		return PresignResult{}, errors.New("checksum must be lowercase SHA-256 hex")
	}
	id := uuid.New()
	extension := map[string]string{"image/jpeg": ".jpg", "image/png": ".png", "application/pdf": ".pdf"}[request.MimeType]
	key := fmt.Sprintf("driver-documents/%s/%s%s", userID, id, extension)
	expires := time.Now().UTC().Add(15 * time.Minute)
	u, err := s.client.PresignedPutObject(ctx, s.bucket, key, 15*time.Minute)
	if err != nil {
		return PresignResult{}, err
	}
	_, err = s.db.Exec(ctx, `INSERT INTO uploads(id,owner_user_id,object_key,mime_type,size_bytes,checksum_sha256,document_type) VALUES($1,$2,$3,$4,$5,$6,$7)`, id, userID, key, request.MimeType, request.SizeBytes, strings.ToLower(request.ChecksumSHA256), request.DocumentType)
	if err != nil {
		return PresignResult{}, err
	}
	return PresignResult{UploadID: id, ObjectKey: key, UploadURL: u.String(), ExpiresAt: expires}, nil
}
func (s *Service) Complete(ctx context.Context, userID, uploadID uuid.UUID) (string, error) {
	var key, mime, checksum, status, docType string
	var expectedSize int64
	err := s.db.QueryRow(ctx, `SELECT object_key,mime_type,size_bytes,checksum_sha256,status,document_type FROM uploads WHERE id=$1 AND owner_user_id=$2 FOR UPDATE`, uploadID, userID).Scan(&key, &mime, &expectedSize, &checksum, &status, &docType)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrUploadNotFound
	}
	if err != nil {
		return "", err
	}
	if status == "uploaded" {
		return key, nil
	}
	stat, err := s.client.StatObject(ctx, s.bucket, key, minio.StatObjectOptions{})
	if err != nil {
		return "", err
	}
	if stat.Size != expectedSize || stat.ContentType != mime && stat.ContentType != "application/octet-stream" {
		return "", ErrUploadInvalid
	}
	object, err := s.client.GetObject(ctx, s.bucket, key, minio.GetObjectOptions{})
	if err != nil {
		return "", err
	}
	defer object.Close()
	hasher := sha256.New()
	if _, err = io.Copy(hasher, io.LimitReader(object, expectedSize+1)); err != nil {
		return "", err
	}
	if hex.EncodeToString(hasher.Sum(nil)) != checksum {
		return "", ErrUploadInvalid
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	_, err = tx.Exec(ctx, `UPDATE uploads SET status='uploaded',completed_at=now() WHERE id=$1;INSERT INTO driver_documents(application_id,upload_id,type) SELECT id,$1,$2 FROM driver_applications WHERE user_id=$3 ORDER BY created_at DESC LIMIT 1 ON CONFLICT DO NOTHING`, uploadID, docType, userID)
	if err != nil {
		return "", err
	}
	if err = tx.Commit(ctx); err != nil {
		return "", err
	}
	return filepath.Clean(key), nil
}

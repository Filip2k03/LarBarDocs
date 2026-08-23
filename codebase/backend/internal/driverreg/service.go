package driverreg

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

var (
	ErrApplicationNotFound = errors.New("driver application not found")
	ErrApplicationState    = errors.New("driver application state invalid")
	ErrDocumentsRequired   = errors.New("required driver documents missing")
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Application struct {
	ID             uuid.UUID                  `json:"id"`
	UserID         uuid.UUID                  `json:"user_id"`
	Status         string                     `json:"status"`
	LegalName      string                     `json:"legal_name"`
	DateOfBirth    *time.Time                 `json:"date_of_birth,omitempty"`
	SubmittedAt    *time.Time                 `json:"submitted_at,omitempty"`
	ReviewedAt     *time.Time                 `json:"reviewed_at,omitempty"`
	DecisionReason *string                    `json:"decision_reason,omitempty"`
	CreatedAt      time.Time                  `json:"created_at"`
	UpdatedAt      time.Time                  `json:"updated_at"`
	Steps          map[string]json.RawMessage `json:"steps,omitempty"`
}

func (s *Service) GetOrCreate(ctx context.Context, userID uuid.UUID) (Application, error) {
	var a Application
	err := s.db.QueryRow(ctx, `INSERT INTO driver_applications(user_id) VALUES($1) ON CONFLICT DO NOTHING RETURNING id,user_id,status,legal_name,date_of_birth,submitted_at,reviewed_at,decision_reason,created_at,updated_at`, userID).Scan(&a.ID, &a.UserID, &a.Status, &a.LegalName, &a.DateOfBirth, &a.SubmittedAt, &a.ReviewedAt, &a.DecisionReason, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		err = s.db.QueryRow(ctx, `SELECT id,user_id,status,legal_name,date_of_birth,submitted_at,reviewed_at,decision_reason,created_at,updated_at FROM driver_applications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`, userID).Scan(&a.ID, &a.UserID, &a.Status, &a.LegalName, &a.DateOfBirth, &a.SubmittedAt, &a.ReviewedAt, &a.DecisionReason, &a.CreatedAt, &a.UpdatedAt)
	}
	if err != nil {
		return Application{}, err
	}
	a.Steps = map[string]json.RawMessage{}
	rows, err := s.db.Query(ctx, `SELECT step,data FROM driver_application_steps WHERE application_id=$1`, a.ID)
	if err != nil {
		return Application{}, err
	}
	defer rows.Close()
	for rows.Next() {
		var name string
		var data json.RawMessage
		if err = rows.Scan(&name, &data); err != nil {
			return Application{}, err
		}
		a.Steps[name] = data
	}
	return a, rows.Err()
}
func (s *Service) SaveStep(ctx context.Context, userID uuid.UUID, step string, data json.RawMessage, complete bool) (Application, error) {
	allowed := map[string]bool{"personal": true, "identity": true, "driver_license": true, "vehicle": true, "vehicle_photos": true, "documents": true, "bank": true, "agreement": true}
	if !allowed[step] || !json.Valid(data) {
		return Application{}, errors.New("invalid application step")
	}
	a, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return Application{}, err
	}
	if a.Status != "draft" && a.Status != "documents_requested" {
		return Application{}, ErrApplicationState
	}
	var completedAt any
	if complete {
		completedAt = time.Now().UTC()
	}
	_, err = s.db.Exec(ctx, `INSERT INTO driver_application_steps(application_id,step,data,completed_at) VALUES($1,$2,$3,$4) ON CONFLICT(application_id,step) DO UPDATE SET data=excluded.data,completed_at=excluded.completed_at,updated_at=now()`, a.ID, step, data, completedAt)
	if err != nil {
		return Application{}, err
	}
	if step == "personal" {
		var personal struct {
			LegalName   string `json:"legal_name"`
			DateOfBirth string `json:"date_of_birth"`
		}
		if json.Unmarshal(data, &personal) == nil && personal.LegalName != "" {
			var dob *time.Time
			if parsed, parseErr := time.Parse("2006-01-02", personal.DateOfBirth); parseErr == nil {
				dob = &parsed
			}
			_, _ = s.db.Exec(ctx, `UPDATE driver_applications SET legal_name=$1,date_of_birth=$2,updated_at=now() WHERE id=$3`, personal.LegalName, dob, a.ID)
		}
	}
	return s.GetOrCreate(ctx, userID)
}
func (s *Service) Submit(ctx context.Context, userID uuid.UUID) (Application, error) {
	a, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return Application{}, err
	}
	if a.Status != "draft" && a.Status != "documents_requested" {
		return Application{}, ErrApplicationState
	}
	required := []string{"personal", "identity", "driver_license", "vehicle", "vehicle_photos", "documents", "agreement"}
	var completed int
	err = s.db.QueryRow(ctx, `SELECT count(*) FROM driver_application_steps WHERE application_id=$1 AND completed_at IS NOT NULL AND step=ANY($2)`, a.ID, required).Scan(&completed)
	if err != nil {
		return Application{}, err
	}
	if completed != len(required) {
		return Application{}, ErrDocumentsRequired
	}
	requiredDocuments := []string{"profile_photo", "nrc", "driver_license", "vehicle_registration", "vehicle_front", "vehicle_rear"}
	var documents int
	err = s.db.QueryRow(ctx, `SELECT count(DISTINCT type) FROM driver_documents WHERE application_id=$1 AND status IN ('pending','verified') AND type=ANY($2)`, a.ID, requiredDocuments).Scan(&documents)
	if err != nil {
		return Application{}, err
	}
	if documents != len(requiredDocuments) {
		return Application{}, ErrDocumentsRequired
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return Application{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err = tx.Exec(ctx, `UPDATE driver_applications SET status='submitted',submitted_at=now(),updated_at=now() WHERE id=$1`, a.ID); err != nil {
		return Application{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('notification.driver_application_submitted',jsonb_build_object('application_id',$1::text))`, a.ID); err != nil {
		return Application{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Application{}, err
	}
	return s.GetOrCreate(ctx, userID)
}
func (s *Service) List(ctx context.Context, status string, limit int) ([]Application, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	rows, err := s.db.Query(ctx, `SELECT id,user_id,status,legal_name,date_of_birth,submitted_at,reviewed_at,decision_reason,created_at,updated_at FROM driver_applications WHERE ($1='' OR status=$1) ORDER BY created_at DESC LIMIT $2`, status, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Application
	for rows.Next() {
		var a Application
		if err = rows.Scan(&a.ID, &a.UserID, &a.Status, &a.LegalName, &a.DateOfBirth, &a.SubmittedAt, &a.ReviewedAt, &a.DecisionReason, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}

func (s *Service) Detail(ctx context.Context, applicationID uuid.UUID) (map[string]any, error) {
	var application Application
	err := s.db.QueryRow(ctx, `SELECT id,user_id,status,legal_name,date_of_birth,submitted_at,reviewed_at,decision_reason,created_at,updated_at FROM driver_applications WHERE id=$1`, applicationID).Scan(&application.ID, &application.UserID, &application.Status, &application.LegalName, &application.DateOfBirth, &application.SubmittedAt, &application.ReviewedAt, &application.DecisionReason, &application.CreatedAt, &application.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrApplicationNotFound
	}
	if err != nil {
		return nil, err
	}
	rows, err := s.db.Query(ctx, `SELECT step,data,completed_at,updated_at FROM driver_application_steps WHERE application_id=$1 ORDER BY step`, applicationID)
	if err != nil {
		return nil, err
	}
	steps := []map[string]any{}
	for rows.Next() {
		var step string
		var data json.RawMessage
		var completedAt *time.Time
		var updatedAt time.Time
		if err = rows.Scan(&step, &data, &completedAt, &updatedAt); err != nil {
			rows.Close()
			return nil, err
		}
		steps = append(steps, map[string]any{"step": step, "data": data, "completed_at": completedAt, "updated_at": updatedAt})
	}
	rows.Close()
	if err = rows.Err(); err != nil {
		return nil, err
	}
	rows, err = s.db.Query(ctx, `SELECT dd.id,dd.type,dd.status,dd.expires_on,dd.rejection_reason,dd.verified_at,u.id,u.mime_type,u.size_bytes,u.object_key FROM driver_documents dd JOIN uploads u ON u.id=dd.upload_id WHERE dd.application_id=$1 ORDER BY dd.created_at`, applicationID)
	if err != nil {
		return nil, err
	}
	documents := []map[string]any{}
	for rows.Next() {
		var id, uploadID uuid.UUID
		var docType, status, mime, objectKey string
		var expiresOn *time.Time
		var rejectionReason *string
		var verifiedAt *time.Time
		var size int64
		if err = rows.Scan(&id, &docType, &status, &expiresOn, &rejectionReason, &verifiedAt, &uploadID, &mime, &size, &objectKey); err != nil {
			rows.Close()
			return nil, err
		}
		documents = append(documents, map[string]any{"id": id, "upload_id": uploadID, "type": docType, "status": status, "expires_on": expiresOn, "rejection_reason": rejectionReason, "verified_at": verifiedAt, "mime_type": mime, "size_bytes": size, "object_key": objectKey})
	}
	rows.Close()
	return map[string]any{"application": application, "steps": steps, "documents": documents}, rows.Err()
}
func (s *Service) RequestDocuments(ctx context.Context, adminID, applicationID uuid.UUID, reason string, types []string, requestID string) error {
	if reason == "" || len(types) == 0 {
		return errors.New("reason and document types required")
	}
	return s.decision(ctx, adminID, applicationID, "documents_requested", reason, requestID, map[string]any{"document_types": types})
}
func (s *Service) Reject(ctx context.Context, adminID, applicationID uuid.UUID, reason, requestID string) error {
	if reason == "" {
		return errors.New("rejection reason required")
	}
	return s.decision(ctx, adminID, applicationID, "rejected", reason, requestID, nil)
}

func (s *Service) VerifyDocument(ctx context.Context, adminID, applicationID, documentID uuid.UUID, verified bool, reason, requestID string) error {
	status := "verified"
	if !verified {
		status = "rejected"
		if reason == "" {
			return errors.New("document rejection reason required")
		}
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	tag, err := tx.Exec(ctx, `UPDATE driver_documents SET status=$1,rejection_reason=CASE WHEN $1='rejected' THEN $2 ELSE NULL END,verified_by=$3,verified_at=now() WHERE id=$4 AND application_id=$5 AND status='pending'`, status, reason, adminID, documentID, applicationID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return ErrApplicationState
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id) VALUES($1,'admin',$2,'driver_document',$3::text,jsonb_build_object('status',$4,'reason',$5,'application_id',$6::text),$7)`, adminID, "driver.document."+status, documentID, status, reason, applicationID, requestID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Service) Approve(ctx context.Context, adminID, applicationID uuid.UUID, reason, requestID string) error {
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.Serializable})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var applicantID uuid.UUID
	var status string
	var reviewer *uuid.UUID
	var legalName string
	err = tx.QueryRow(ctx, `SELECT user_id,status,reviewed_by,legal_name FROM driver_applications WHERE id=$1 FOR UPDATE`, applicationID).Scan(&applicantID, &status, &reviewer, &legalName)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrApplicationNotFound
	}
	if err != nil {
		return err
	}
	if applicantID == adminID || reviewer != nil && *reviewer == adminID {
		return errors.New("registrar cannot approve own or previously reviewed case")
	}
	if status != "submitted" && status != "under_review" && status != "verification" {
		return ErrApplicationState
	}
	requiredDocuments := []string{"profile_photo", "nrc", "driver_license", "vehicle_registration", "vehicle_front", "vehicle_rear"}
	var verified, rejected, expired int
	err = tx.QueryRow(ctx, `SELECT count(DISTINCT type) FILTER(WHERE status='verified' AND type=ANY($2)),count(*) FILTER(WHERE status IN ('pending','rejected','expired')),count(*) FILTER(WHERE expires_on<CURRENT_DATE) FROM driver_documents WHERE application_id=$1`, applicationID, requiredDocuments).Scan(&verified, &rejected, &expired)
	if err != nil {
		return err
	}
	if verified != len(requiredDocuments) || rejected > 0 || expired > 0 {
		return ErrDocumentsRequired
	}
	driverID := uuid.New()
	driverNumber := "LBR-" + time.Now().UTC().Format("060102") + "-" + applicationID.String()[:6]
	_, err = tx.Exec(ctx, `UPDATE driver_applications SET status='approved',reviewed_by=$1,reviewed_at=now(),decision_reason=$2,updated_at=now() WHERE id=$3`, adminID, reason, applicationID)
	if err != nil {
		return fmt.Errorf("approve driver: %w", err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO drivers(id,user_id,driver_number,status,approved_at) VALUES($1,$2,$3,'approved',now())`, driverID, applicantID, driverNumber); err != nil {
		return fmt.Errorf("create driver: %w", err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO user_roles(user_id,role_id,granted_by) SELECT $1,id,$2 FROM roles WHERE name='driver' ON CONFLICT DO NOTHING`, applicantID, adminID); err != nil {
		return fmt.Errorf("grant driver role: %w", err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id) VALUES($1,'admin','driver.approve','driver_application',$2::text,jsonb_build_object('status','approved','driver_id',$3::text),$4)`, adminID, applicationID, driverID, requestID); err != nil {
		return fmt.Errorf("audit driver approval: %w", err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('notification.driver_approved',jsonb_build_object('application_id',$1::text,'user_id',$2::text))`, applicationID, applicantID); err != nil {
		return fmt.Errorf("queue driver approval notification: %w", err)
	}
	return tx.Commit(ctx)
}
func (s *Service) decision(ctx context.Context, adminID, applicationID uuid.UUID, status, reason, requestID string, metadata map[string]any) error {
	encoded, _ := json.Marshal(metadata)
	tag, err := s.db.Exec(ctx, `WITH changed AS(UPDATE driver_applications SET status=$1,reviewed_by=$2,reviewed_at=now(),decision_reason=$3,updated_at=now() WHERE id=$4 AND status IN ('submitted','under_review','verification','documents_requested') AND user_id<>$2 RETURNING id,user_id) INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id) SELECT $2,'admin','driver.'||$1,'driver_application',id::text,jsonb_build_object('status',$1,'reason',$3,'metadata',$5::jsonb),$6 FROM changed`, status, adminID, reason, applicationID, encoded, requestID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrApplicationState
	}
	return nil
}

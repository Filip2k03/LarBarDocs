package driverreg

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

var (
	ErrApplicationNotFound = errors.New("driver application not found")
	ErrApplicationState    = errors.New("driver application state invalid")
	ErrDocumentsRequired   = errors.New("required driver documents missing")
	ErrCaseAccess          = errors.New("driver registration case access denied")
	ErrCaseConflict        = errors.New("applicant already has a registration case")
	ErrRegistrationCenter  = errors.New("active registration center assignment required")
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Application struct {
	ID              uuid.UUID                  `json:"id"`
	UserID          uuid.UUID                  `json:"user_id"`
	Status          string                     `json:"status"`
	LegalName       string                     `json:"legal_name"`
	DateOfBirth     *time.Time                 `json:"date_of_birth,omitempty"`
	SubmittedAt     *time.Time                 `json:"submitted_at,omitempty"`
	ReviewedAt      *time.Time                 `json:"reviewed_at,omitempty"`
	DecisionReason  *string                    `json:"decision_reason,omitempty"`
	CreatedAt       time.Time                  `json:"created_at"`
	UpdatedAt       time.Time                  `json:"updated_at"`
	Steps           map[string]json.RawMessage `json:"steps,omitempty"`
	ApplicantUserID uuid.UUID                  `json:"applicant_user_id,omitempty"`
	ActorUserID     uuid.UUID                  `json:"actor_user_id,omitempty"`
	SourceMode      string                     `json:"source_mode,omitempty"`
	Revision        int64                      `json:"revision,omitempty"`
}

type RegistrationCase struct {
	ID                   uuid.UUID `json:"id"`
	ApplicationID        uuid.UUID `json:"application_id"`
	ApplicantUserID      uuid.UUID `json:"applicant_user_id"`
	ActorUserID          uuid.UUID `json:"actor_user_id"`
	ApplicantName        string    `json:"applicant_name"`
	ApplicantPhoneMasked string    `json:"applicant_phone_masked"`
	Status               string    `json:"status"`
	UpdatedAt            time.Time `json:"updated_at"`
	SourceMode           string    `json:"source_mode"`
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
	allowed := map[string]bool{"consent": true, "personal": true, "nrc": true, "driving_licence": true, "face_liveness": true, "vehicle": true, "vehicle_documents": true, "payout": true, "agreement": true, "identity": true, "driver_license": true, "vehicle_photos": true, "documents": true, "bank": true}
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
func (s *Service) Submit(ctx context.Context, userID uuid.UUID, idempotencyKey string) (Application, error) {
	idempotencyKey = strings.TrimSpace(idempotencyKey)
	if len(idempotencyKey) < 8 || len(idempotencyKey) > 255 {
		return Application{}, errors.New("valid idempotency key required")
	}
	a, err := s.GetOrCreate(ctx, userID)
	if err != nil {
		return Application{}, err
	}
	if a.Status == "submitted" {
		var storedKey string
		if err = s.db.QueryRow(ctx, `SELECT coalesce(submission_idempotency_key,'') FROM driver_applications WHERE id=$1`, a.ID).Scan(&storedKey); err != nil {
			return Application{}, err
		}
		if storedKey == idempotencyKey {
			return a, nil
		}
	}
	if a.Status != "draft" && a.Status != "documents_requested" {
		return Application{}, ErrApplicationState
	}
	required := []string{"consent", "personal", "nrc", "driving_licence", "vehicle", "vehicle_documents", "agreement"}
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
	tag, err := tx.Exec(ctx, `UPDATE driver_applications SET status='submitted',submitted_at=now(),submission_idempotency_key=$2,updated_at=now() WHERE id=$1 AND status IN ('draft','documents_requested')`, a.ID, idempotencyKey)
	if err != nil {
		return Application{}, err
	}
	if tag.RowsAffected() != 1 {
		return Application{}, ErrApplicationState
	}
	if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('notification.driver_application_submitted',jsonb_build_object('application_id',$1::text))`, a.ID); err != nil {
		return Application{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Application{}, err
	}
	return s.GetOrCreate(ctx, userID)
}

func (s *Service) CreateStaffCase(ctx context.Context, actorID uuid.UUID, applicantName, applicantPhone string, requestedCenter *uuid.UUID, requestID string) (RegistrationCase, error) {
	applicantName = strings.TrimSpace(applicantName)
	if applicantName == "" || len(applicantName) > 160 {
		return RegistrationCase{}, errors.New("applicant name is required")
	}
	phone, err := auth.NormalizePhone(applicantPhone)
	if err != nil {
		return RegistrationCase{}, err
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return RegistrationCase{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var centerID *uuid.UUID
	var centerActive bool
	err = tx.QueryRow(ctx, `SELECT sc.registration_center_id,coalesce(rc.active,false) FROM staff_credentials sc LEFT JOIN registration_centers rc ON rc.id=sc.registration_center_id WHERE sc.user_id=$1`, actorID).Scan(&centerID, &centerActive)
	if errors.Is(err, pgx.ErrNoRows) || centerID == nil || !centerActive {
		return RegistrationCase{}, ErrRegistrationCenter
	}
	if err != nil {
		return RegistrationCase{}, err
	}
	if requestedCenter != nil && *requestedCenter != *centerID {
		return RegistrationCase{}, ErrCaseAccess
	}
	var applicantID uuid.UUID
	_, err = tx.Exec(ctx, `INSERT INTO users(phone,display_name) VALUES($1,$2) ON CONFLICT(phone) DO NOTHING`, phone, applicantName)
	if err != nil {
		return RegistrationCase{}, err
	}
	if err = tx.QueryRow(ctx, `SELECT id FROM users WHERE phone=$1`, phone).Scan(&applicantID); err != nil {
		return RegistrationCase{}, err
	}
	if applicantID == actorID {
		return RegistrationCase{}, ErrCaseConflict
	}
	if _, err = tx.Exec(ctx, `INSERT INTO user_roles(user_id,role_id,granted_by) SELECT $1,id,$2 FROM roles WHERE name='driver_applicant' ON CONFLICT DO NOTHING`, applicantID, actorID); err != nil {
		return RegistrationCase{}, err
	}
	var applicationID uuid.UUID
	err = tx.QueryRow(ctx, `INSERT INTO driver_applications(user_id,legal_name,created_by,assigned_to,registration_center_id,source_mode)
		VALUES($1,$2,$3,$3,$4,'staff_assisted') ON CONFLICT(user_id) DO NOTHING RETURNING id`, applicantID, applicantName, actorID, centerID).Scan(&applicationID)
	if errors.Is(err, pgx.ErrNoRows) {
		var owner *uuid.UUID
		var source string
		if queryErr := tx.QueryRow(ctx, `SELECT id,created_by,source_mode FROM driver_applications WHERE user_id=$1`, applicantID).Scan(&applicationID, &owner, &source); queryErr != nil {
			return RegistrationCase{}, queryErr
		}
		if owner == nil || *owner != actorID || source != "staff_assisted" {
			return RegistrationCase{}, ErrCaseConflict
		}
	} else if err != nil {
		return RegistrationCase{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id)
		VALUES($1,'staff','driver_registration.case_created','driver_application',$2,jsonb_build_object('applicant_user_id',$3::text,'registration_center_id',$4::text,'source_mode','staff_assisted'),$5)`, actorID, applicationID.String(), applicantID, centerID, requestID); err != nil {
		return RegistrationCase{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return RegistrationCase{}, err
	}
	return s.caseSummary(ctx, actorID, applicationID, false)
}

func (s *Service) StaffCases(ctx context.Context, actorID uuid.UUID, canManage bool) ([]RegistrationCase, error) {
	rows, err := s.db.Query(ctx, `SELECT da.id,da.user_id,coalesce(da.created_by,da.assigned_to),da.legal_name,coalesce(u.phone,''),da.status,da.updated_at,da.source_mode
		FROM driver_applications da JOIN users u ON u.id=da.user_id JOIN staff_credentials sc ON sc.user_id=$1
		WHERE da.source_mode='staff_assisted' AND (da.created_by=$1 OR da.assigned_to=$1 OR ($2 AND da.registration_center_id=sc.registration_center_id))
		ORDER BY da.updated_at DESC LIMIT 200`, actorID, canManage)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var cases []RegistrationCase
	for rows.Next() {
		var item RegistrationCase
		var phone string
		if err = rows.Scan(&item.ID, &item.ApplicantUserID, &item.ActorUserID, &item.ApplicantName, &phone, &item.Status, &item.UpdatedAt, &item.SourceMode); err != nil {
			return nil, err
		}
		item.ApplicationID = item.ID
		item.ApplicantPhoneMasked = maskPhone(phone)
		cases = append(cases, item)
	}
	return cases, rows.Err()
}

func (s *Service) StaffApplication(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool) (Application, error) {
	applicantID, createdBy, err := s.caseAccess(ctx, actorID, applicationID, canManage)
	if err != nil {
		return Application{}, err
	}
	application, err := s.GetOrCreate(ctx, applicantID)
	if err != nil {
		return Application{}, err
	}
	application.ApplicantUserID = applicantID
	application.ActorUserID = createdBy
	application.SourceMode = "staff_assisted"
	if err = s.db.QueryRow(ctx, `SELECT revision FROM driver_applications WHERE id=$1`, applicationID).Scan(&application.Revision); err != nil {
		return Application{}, err
	}
	return application, nil
}

func (s *Service) SaveStaffStep(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool, step string, data json.RawMessage, complete bool, requestID string) (Application, error) {
	allowed := map[string]bool{"consent": true, "personal": true, "nrc": true, "driving_licence": true, "face_liveness": true, "vehicle": true, "vehicle_documents": true, "payout": true, "agreement": true}
	if !allowed[step] || !json.Valid(data) {
		return Application{}, errors.New("invalid application step")
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Application{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var applicantID uuid.UUID
	var status string
	err = tx.QueryRow(ctx, `SELECT da.user_id,da.status FROM driver_applications da JOIN staff_credentials sc ON sc.user_id=$1
		WHERE da.id=$2 AND da.source_mode='staff_assisted' AND (da.created_by=$1 OR da.assigned_to=$1 OR ($3 AND da.registration_center_id=sc.registration_center_id)) FOR UPDATE`, actorID, applicationID, canManage).Scan(&applicantID, &status)
	if errors.Is(err, pgx.ErrNoRows) {
		return Application{}, ErrCaseAccess
	}
	if err != nil {
		return Application{}, err
	}
	if status != "draft" && status != "documents_requested" {
		return Application{}, ErrApplicationState
	}
	var completedAt any
	if complete {
		completedAt = time.Now().UTC()
	}
	if _, err = tx.Exec(ctx, `INSERT INTO driver_application_steps(application_id,step,data,completed_at) VALUES($1,$2,$3,$4)
		ON CONFLICT(application_id,step) DO UPDATE SET data=excluded.data,completed_at=excluded.completed_at,updated_at=now()`, applicationID, step, data, completedAt); err != nil {
		return Application{}, err
	}
	if step == "personal" {
		var personal struct {
			LegalName   string `json:"legal_name"`
			DateOfBirth string `json:"date_of_birth"`
		}
		if json.Unmarshal(data, &personal) == nil && strings.TrimSpace(personal.LegalName) != "" {
			var dob *time.Time
			if parsed, parseErr := time.Parse("2006-01-02", personal.DateOfBirth); parseErr == nil {
				dob = &parsed
			}
			if _, err = tx.Exec(ctx, `UPDATE driver_applications SET legal_name=$1,date_of_birth=$2 WHERE id=$3`, strings.TrimSpace(personal.LegalName), dob, applicationID); err != nil {
				return Application{}, err
			}
		}
	}
	var revision int64
	if err = tx.QueryRow(ctx, `UPDATE driver_applications SET revision=revision+1,updated_at=now() WHERE id=$1 RETURNING revision`, applicationID).Scan(&revision); err != nil {
		return Application{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id)
		VALUES($1,'staff','driver_registration.step_saved','driver_application',$2,jsonb_build_object('applicant_user_id',$3::text,'step',$4,'complete',$5,'revision',$6),$7)`, actorID, applicationID.String(), applicantID, step, complete, revision, requestID); err != nil {
		return Application{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Application{}, err
	}
	return s.StaffApplication(ctx, actorID, applicationID, canManage)
}

func (s *Service) SubmitStaffCase(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool, idempotencyKey, requestID string) (Application, error) {
	idempotencyKey = strings.TrimSpace(idempotencyKey)
	if len(idempotencyKey) < 8 || len(idempotencyKey) > 255 {
		return Application{}, errors.New("valid idempotency key required")
	}
	tx, err := s.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Application{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var applicantID uuid.UUID
	var status, storedKey string
	err = tx.QueryRow(ctx, `SELECT da.user_id,da.status,coalesce(da.submission_idempotency_key,'') FROM driver_applications da JOIN staff_credentials sc ON sc.user_id=$1
		WHERE da.id=$2 AND da.source_mode='staff_assisted' AND (da.created_by=$1 OR da.assigned_to=$1 OR ($3 AND da.registration_center_id=sc.registration_center_id)) FOR UPDATE`, actorID, applicationID, canManage).Scan(&applicantID, &status, &storedKey)
	if errors.Is(err, pgx.ErrNoRows) {
		return Application{}, ErrCaseAccess
	}
	if err != nil {
		return Application{}, err
	}
	if status == "submitted" && storedKey == idempotencyKey {
		if err = tx.Commit(ctx); err != nil {
			return Application{}, err
		}
		return s.StaffApplication(ctx, actorID, applicationID, canManage)
	}
	if status != "draft" && status != "documents_requested" {
		return Application{}, ErrApplicationState
	}
	required := []string{"consent", "personal", "nrc", "driving_licence", "vehicle", "vehicle_documents", "agreement"}
	var completed int
	if err = tx.QueryRow(ctx, `SELECT count(*) FROM driver_application_steps WHERE application_id=$1 AND completed_at IS NOT NULL AND step=ANY($2)`, applicationID, required).Scan(&completed); err != nil {
		return Application{}, err
	}
	if completed != len(required) {
		return Application{}, ErrDocumentsRequired
	}
	requiredDocuments := []string{"profile_photo", "nrc", "driver_license", "vehicle_registration", "vehicle_front", "vehicle_rear"}
	var documents int
	if err = tx.QueryRow(ctx, `SELECT count(DISTINCT type) FROM driver_documents WHERE application_id=$1 AND status IN ('pending','verified') AND type=ANY($2)`, applicationID, requiredDocuments).Scan(&documents); err != nil {
		return Application{}, err
	}
	if documents != len(requiredDocuments) {
		return Application{}, ErrDocumentsRequired
	}
	if _, err = tx.Exec(ctx, `UPDATE driver_applications SET status='submitted',submitted_at=now(),submission_idempotency_key=$2,revision=revision+1,updated_at=now() WHERE id=$1`, applicationID, idempotencyKey); err != nil {
		return Application{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO jobs(type,payload) VALUES('notification.driver_application_submitted',jsonb_build_object('application_id',$1::text))`, applicationID); err != nil {
		return Application{}, err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_logs(actor_id,actor_type,action,resource_type,resource_id,after_data,request_id)
		VALUES($1,'staff','driver_registration.submitted','driver_application',$2,jsonb_build_object('applicant_user_id',$3::text,'source_mode','staff_assisted'),$4)`, actorID, applicationID.String(), applicantID, requestID); err != nil {
		return Application{}, err
	}
	if err = tx.Commit(ctx); err != nil {
		return Application{}, err
	}
	return s.StaffApplication(ctx, actorID, applicationID, canManage)
}

func (s *Service) CanAccessCase(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool) error {
	_, _, err := s.caseAccess(ctx, actorID, applicationID, canManage)
	return err
}

func (s *Service) caseAccess(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool) (uuid.UUID, uuid.UUID, error) {
	var applicantID, createdBy uuid.UUID
	err := s.db.QueryRow(ctx, `SELECT da.user_id,da.created_by FROM driver_applications da JOIN staff_credentials sc ON sc.user_id=$1
		WHERE da.id=$2 AND da.source_mode='staff_assisted' AND (da.created_by=$1 OR da.assigned_to=$1 OR ($3 AND da.registration_center_id=sc.registration_center_id))`, actorID, applicationID, canManage).Scan(&applicantID, &createdBy)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, uuid.Nil, ErrCaseAccess
	}
	return applicantID, createdBy, err
}

func (s *Service) caseSummary(ctx context.Context, actorID, applicationID uuid.UUID, canManage bool) (RegistrationCase, error) {
	var item RegistrationCase
	var phone string
	err := s.db.QueryRow(ctx, `SELECT da.id,da.id,da.user_id,da.created_by,da.legal_name,coalesce(u.phone,''),da.status,da.updated_at,da.source_mode
		FROM driver_applications da JOIN users u ON u.id=da.user_id JOIN staff_credentials sc ON sc.user_id=$1
		WHERE da.id=$2 AND da.source_mode='staff_assisted' AND (da.created_by=$1 OR da.assigned_to=$1 OR ($3 AND da.registration_center_id=sc.registration_center_id))`, actorID, applicationID, canManage).Scan(&item.ID, &item.ApplicationID, &item.ApplicantUserID, &item.ActorUserID, &item.ApplicantName, &phone, &item.Status, &item.UpdatedAt, &item.SourceMode)
	if errors.Is(err, pgx.ErrNoRows) {
		return RegistrationCase{}, ErrCaseAccess
	}
	item.ApplicantPhoneMasked = maskPhone(phone)
	return item, err
}

func maskPhone(phone string) string {
	if len(phone) <= 6 {
		return "******"
	}
	return phone[:4] + strings.Repeat("*", len(phone)-7) + phone[len(phone)-3:]
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

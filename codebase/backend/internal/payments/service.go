package payments

import (
	"context"
	"encoding/json"
	"errors"

	platformpayments "github.com/Filip2k03/labar-backend/internal/platform/payments"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db       *pgxpool.Pool
	provider platformpayments.Provider
}

type Method struct {
	ID       uuid.UUID `json:"id"`
	Type     string    `json:"type"`
	Provider string    `json:"provider"`
	Status   string    `json:"status"`
}

func (s *Service) RegisterMethod(ctx context.Context, userID uuid.UUID, methodType, providerReference string) (Method, error) {
	switch methodType {
	case "kbzpay", "wavepay", "ayapay":
	default:
		return Method{}, errors.New("unsupported payment method")
	}
	if providerReference == "" {
		return Method{}, errors.New("provider-issued payment method reference required")
	}
	var method Method
	err := s.db.QueryRow(ctx, `INSERT INTO payment_methods(user_id,type,provider,provider_reference) VALUES($1,$2,$2,$3) RETURNING id,type,provider,status`, userID, methodType, providerReference).Scan(&method.ID, &method.Type, &method.Provider, &method.Status)
	return method, err
}

func (s *Service) Methods(ctx context.Context, userID uuid.UUID) ([]Method, error) {
	rows, err := s.db.Query(ctx, `SELECT id,type,provider,status FROM payment_methods WHERE user_id=$1 AND status='active' ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []Method
	for rows.Next() {
		var method Method
		if err = rows.Scan(&method.ID, &method.Type, &method.Provider, &method.Status); err != nil {
			return nil, err
		}
		result = append(result, method)
	}
	return result, rows.Err()
}

func (s *Service) DeleteMethod(ctx context.Context, userID, methodID uuid.UUID) error {
	tag, err := s.db.Exec(ctx, `UPDATE payment_methods SET status='inactive' WHERE id=$1 AND user_id=$2 AND status='active'`, methodID, userID)
	if err == nil && tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return err
}

func NewService(db *pgxpool.Pool, provider platformpayments.Provider) *Service {
	return &Service{db: db, provider: provider}
}

func (s *Service) Capture(ctx context.Context, paymentID uuid.UUID) error {
	if s.provider == nil {
		return errors.New("payment provider not configured")
	}
	var providerName, methodReference, status string
	var amount int64
	err := s.db.QueryRow(ctx, `SELECT p.provider,p.amount_mmk,p.status,pm.provider_reference FROM payments p JOIN rides r ON r.id=p.ride_id JOIN payment_methods pm ON pm.id=r.payment_method_id WHERE p.id=$1 AND p.method<>'cash'`, paymentID).Scan(&providerName, &amount, &status, &methodReference)
	if errors.Is(err, pgx.ErrNoRows) {
		return errors.New("payment not available for capture")
	}
	if err != nil {
		return err
	}
	if status == "paid" {
		return nil
	}
	charge := platformpayments.Charge{PaymentID: paymentID.String(), Provider: providerName, ProviderMethodID: methodReference, AmountMMK: amount, IdempotencyKey: "capture-" + paymentID.String()}
	requestBody, _ := json.Marshal(charge)
	reference, captureErr := s.provider.Capture(ctx, charge)
	if captureErr != nil {
		_, _ = s.db.Exec(ctx, `INSERT INTO payment_attempts(payment_id,request,status,response) VALUES($1,$2::jsonb,'failed',jsonb_build_object('error','provider capture failed'))`, paymentID, string(requestBody))
		_, _ = s.db.Exec(ctx, `UPDATE payments SET status='failed',updated_at=now() WHERE id=$1 AND status<>'paid'`, paymentID)
		return captureErr
	}
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err = tx.Exec(ctx, `UPDATE payments SET status='paid',provider_reference=$2,updated_at=now() WHERE id=$1 AND status IN ('pending','failed')`, paymentID, reference); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO payment_attempts(payment_id,request,response,status) VALUES($1,$2::jsonb,jsonb_build_object('reference',$3),'paid')`, paymentID, string(requestBody), reference); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

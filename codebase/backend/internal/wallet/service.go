package wallet

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type Summary struct {
	ID         uuid.UUID `json:"id"`
	Currency   string    `json:"currency"`
	BalanceMMK int64     `json:"balance_mmk"`
	Version    int64     `json:"version"`
}

type Transaction struct {
	ID              uuid.UUID  `json:"id"`
	Type            string     `json:"type"`
	AmountMMK       int64      `json:"amount_mmk"`
	Direction       int16      `json:"direction"`
	ReferenceType   string     `json:"reference_type"`
	ReferenceID     *uuid.UUID `json:"reference_id,omitempty"`
	BalanceAfterMMK int64      `json:"balance_after_mmk"`
	CreatedAt       time.Time  `json:"created_at"`
}

func (s *Service) Summary(ctx context.Context, userID uuid.UUID) (Summary, error) {
	var result Summary
	err := s.db.QueryRow(ctx, `SELECT id,currency,cached_balance_mmk,version FROM wallets WHERE user_id=$1`, userID).Scan(&result.ID, &result.Currency, &result.BalanceMMK, &result.Version)
	return result, err
}

func (s *Service) Transactions(ctx context.Context, userID uuid.UUID, limit int) ([]Transaction, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	rows, err := s.db.Query(ctx, `SELECT wt.id,wt.type,wt.amount_mmk,wt.direction,wt.reference_type,wt.reference_id,wt.balance_after_mmk,wt.created_at FROM wallet_transactions wt JOIN wallets w ON w.id=wt.wallet_id WHERE w.user_id=$1 ORDER BY wt.created_at DESC,wt.id DESC LIMIT $2`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []Transaction
	for rows.Next() {
		var item Transaction
		if err = rows.Scan(&item.ID, &item.Type, &item.AmountMMK, &item.Direction, &item.ReferenceType, &item.ReferenceID, &item.BalanceAfterMMK, &item.CreatedAt); err != nil {
			return nil, err
		}
		result = append(result, item)
	}
	return result, rows.Err()
}

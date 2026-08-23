package support

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Service struct{ db *pgxpool.Pool }

func NewService(db *pgxpool.Pool) *Service { return &Service{db: db} }

type CreateRequest struct {
	RideID      *uuid.UUID `json:"ride_id,omitempty"`
	Type        string     `json:"type"`
	Priority    string     `json:"priority"`
	Subject     string     `json:"subject"`
	Description string     `json:"description"`
	Contact     string     `json:"contact,omitempty"`
}
type Ticket struct {
	ID          uuid.UUID  `json:"id"`
	UserID      *uuid.UUID `json:"user_id,omitempty"`
	RideID      *uuid.UUID `json:"ride_id,omitempty"`
	Type        string     `json:"type"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	Subject     string     `json:"subject"`
	Description string     `json:"description"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (s *Service) Create(ctx context.Context, userID *uuid.UUID, r CreateRequest) (Ticket, error) {
	if r.Subject == "" || r.Description == "" {
		return Ticket{}, errors.New("subject and description required")
	}
	if r.Priority == "" {
		r.Priority = "normal"
	}
	id := uuid.New()
	var t Ticket
	err := s.db.QueryRow(ctx, `INSERT INTO support_tickets(id,user_id,ride_id,type,priority,subject,description,contact_ciphertext) VALUES($1,$2,$3,$4,$5,$6,$7,CASE WHEN $8='' THEN NULL ELSE pgp_sym_encrypt($8,current_setting('app.encryption_key',true)) END) RETURNING id,user_id,ride_id,type,status,priority,subject,description,created_at,updated_at`, id, userID, r.RideID, r.Type, r.Priority, r.Subject, r.Description, r.Contact).Scan(&t.ID, &t.UserID, &t.RideID, &t.Type, &t.Status, &t.Priority, &t.Subject, &t.Description, &t.CreatedAt, &t.UpdatedAt)
	return t, err
}
func (s *Service) List(ctx context.Context, userID uuid.UUID) ([]Ticket, error) {
	rows, err := s.db.Query(ctx, `SELECT id,user_id,ride_id,type,status,priority,subject,description,created_at,updated_at FROM support_tickets WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Ticket
	for rows.Next() {
		var t Ticket
		if err = rows.Scan(&t.ID, &t.UserID, &t.RideID, &t.Type, &t.Status, &t.Priority, &t.Subject, &t.Description, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}
func (s *Service) AddMessage(ctx context.Context, userID, ticketID uuid.UUID, body string, staff bool) error {
	if body == "" {
		return errors.New("message body required")
	}
	tag, err := s.db.Exec(ctx, `INSERT INTO support_messages(ticket_id,author_id,body,internal) SELECT $1,$2,$3,false WHERE EXISTS(SELECT 1 FROM support_tickets WHERE id=$1 AND (user_id=$2 OR $4))`, ticketID, userID, body, staff)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/Filip2k03/labar-backend/internal/auth"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	var staffID, phone, displayName, role, centerCode, centerName string
	flag.StringVar(&staffID, "staff-id", "", "unique staff identifier")
	flag.StringVar(&phone, "phone", "", "staff phone in Myanmar or E.164 format")
	flag.StringVar(&displayName, "display-name", "", "staff display name")
	flag.StringVar(&role, "role", "", "marketer, driver_registrar, or registration_manager")
	flag.StringVar(&centerCode, "center-code", "", "registration-center code")
	flag.StringVar(&centerName, "center-name", "", "registration-center name when creating it")
	flag.Parse()

	if !allowedRole(role) || strings.TrimSpace(staffID) == "" || strings.TrimSpace(displayName) == "" || strings.TrimSpace(centerCode) == "" {
		exit("staff-id, display-name, center-code, and a valid role are required")
	}
	normalizedPhone, err := auth.NormalizePhone(phone)
	if err != nil {
		exit(err.Error())
	}
	password := os.Getenv("LABAR_STAFF_PASSWORD")
	hash, err := auth.HashStaffPassword(password)
	if err != nil {
		exit("LABAR_STAFF_PASSWORD: " + err.Error())
	}
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		exit("DATABASE_URL is required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		exit("connect database: " + err.Error())
	}
	defer db.Close()
	if err = provision(ctx, db, strings.TrimSpace(staffID), normalizedPhone, strings.TrimSpace(displayName), role, strings.TrimSpace(centerCode), strings.TrimSpace(centerName), hash); err != nil {
		exit(err.Error())
	}
	fmt.Printf("staff account %s provisioned with role %s\n", staffID, role)
}

func provision(ctx context.Context, db *pgxpool.Pool, staffID, phone, displayName, role, centerCode, centerName, passwordHash string) error {
	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	var centerID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT id FROM registration_centers WHERE code=$1 AND active`, centerCode).Scan(&centerID)
	if errors.Is(err, pgx.ErrNoRows) {
		if centerName == "" {
			return errors.New("registration center does not exist; center-name is required to create it")
		}
		err = tx.QueryRow(ctx, `INSERT INTO registration_centers(code,name) VALUES($1,$2) RETURNING id`, centerCode, centerName).Scan(&centerID)
	}
	if err != nil {
		return err
	}
	var userID uuid.UUID
	err = tx.QueryRow(ctx, `INSERT INTO users(phone,display_name) VALUES($1,$2)
		ON CONFLICT(phone) DO UPDATE SET display_name=excluded.display_name,updated_at=now() RETURNING id`, phone, displayName).Scan(&userID)
	if err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `DELETE FROM user_roles WHERE user_id=$1 AND role_id IN (SELECT id FROM roles WHERE name IN ('marketer','driver_registrar','registration_manager'))`, userID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO user_roles(user_id,role_id) SELECT $1,id FROM roles WHERE name=$2`, userID, role); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `INSERT INTO staff_credentials(user_id,staff_id,password_hash,registration_center_id)
		VALUES($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET staff_id=excluded.staff_id,password_hash=excluded.password_hash,registration_center_id=excluded.registration_center_id,failed_attempts=0,locked_until=NULL,password_changed_at=now(),updated_at=now()`, userID, staffID, passwordHash, centerID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func allowedRole(role string) bool {
	return role == "marketer" || role == "driver_registrar" || role == "registration_manager"
}

func exit(message string) {
	fmt.Fprintln(os.Stderr, message)
	os.Exit(1)
}

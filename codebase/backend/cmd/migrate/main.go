package main

import (
	"errors"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: go run ./cmd/migrate up|down")
		os.Exit(2)
	}
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		fmt.Fprintln(os.Stderr, "DATABASE_URL is required")
		os.Exit(2)
	}
	runner, err := migrate.New("file://migrations", databaseURL)
	if err != nil {
		fatal(err)
	}
	defer runner.Close()
	switch os.Args[1] {
	case "up":
		err = runner.Up()
	case "down":
		err = runner.Steps(-1)
	default:
		fmt.Fprintln(os.Stderr, "direction must be up or down")
		os.Exit(2)
	}
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		fatal(err)
	}
	fmt.Println("migration", os.Args[1], "complete")
}
func fatal(err error) { fmt.Fprintln(os.Stderr, err); os.Exit(1) }

.PHONY: dev api worker migrate-up migrate-down test test-race vet build staff-create docker
dev:
	docker compose up -d
api:
	go run ./cmd/api
worker:
	go run ./cmd/worker
migrate-up:
	go run ./cmd/migrate up
migrate-down:
	go run ./cmd/migrate down
test:
	go test ./...
test-race:
	go test -race ./...
vet:
	go vet ./...
build:
	go build ./...

staff-create:
	go run ./cmd/staff $(ARGS)
docker:
	docker build -t labar/backend:local .

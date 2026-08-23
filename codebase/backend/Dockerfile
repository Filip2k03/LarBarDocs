# Multi-Stage Lean Dockerfile for Go 1.22
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/labar-api ./cmd/api

# Minimal Distroless / Alpine Runtime Stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app
COPY --from=builder /app/labar-api /app/labar-api

EXPOSE 8080

CMD ["/app/labar-api"]

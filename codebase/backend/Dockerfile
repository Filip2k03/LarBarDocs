# Multi-stage Go 1.22 build
FROM golang:1.22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

ARG TARGETOS=linux
ARG TARGETARCH=amd64
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-w -s" -o /app/labar-api ./cmd/api

# Minimal runtime with an unprivileged process user
FROM alpine:3.19

RUN apk --no-cache add ca-certificates tzdata && addgroup -S labar && adduser -S -G labar labar

WORKDIR /app
COPY --from=builder /app/labar-api /app/labar-api
USER labar

EXPOSE 8080

ENTRYPOINT ["/app/labar-api"]

package realtime

import (
	"context"
	"encoding/json"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/coder/websocket"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	redisv9 "github.com/redis/go-redis/v9"
)

type Gateway struct {
	db          *pgxpool.Pool
	redis       *redisv9.Client
	connections atomic.Int64
}

func NewGateway(db *pgxpool.Pool, redis *redisv9.Client) *Gateway {
	return &Gateway{db: db, redis: redis}
}

type Event struct {
	EventID         uuid.UUID `json:"event_id"`
	Sequence        int64     `json:"sequence,omitempty"`
	Type            string    `json:"type"`
	Data            any       `json:"data,omitempty"`
	ServerTimestamp time.Time `json:"server_timestamp"`
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	connection, err := websocket.Accept(w, r, &websocket.AcceptOptions{OriginPatterns: []string{"localhost:*", "127.0.0.1:*", "*.labartaxi.com", "labartaxi.com", "*.labar.com.mm"}})
	if err != nil {
		return
	}
	defer connection.CloseNow()
	g.connections.Add(1)
	defer g.connections.Add(-1)
	connection.SetReadLimit(1 << 16)
	channels := []string{"user:" + userID.String()}
	rows, err := g.db.Query(r.Context(), `SELECT id FROM rides WHERE (passenger_id=$1 OR driver_id IN(SELECT id FROM drivers WHERE user_id=$1)) AND status IN ('searching','driver_offered','driver_assigned','driver_enroute','driver_arrived','pickup_confirmed','in_progress')`, userID)
	if err == nil {
		for rows.Next() {
			var id uuid.UUID
			if rows.Scan(&id) == nil {
				channels = append(channels, "ride:"+id.String())
			}
		}
		rows.Close()
	}
	subscriber := g.redis.Subscribe(r.Context(), channels...)
	defer subscriber.Close()
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()
	go func() {
		for {
			if _, _, readErr := connection.Read(ctx); readErr != nil {
				cancel()
				return
			}
		}
	}()
	heartbeat := time.NewTicker(25 * time.Second)
	defer heartbeat.Stop()
	messages := subscriber.Channel()
	for {
		select {
		case <-ctx.Done():
			_ = connection.Close(websocket.StatusNormalClosure, "connection closed")
			return
		case <-heartbeat.C:
			event := Event{EventID: uuid.New(), Type: "heartbeat", ServerTimestamp: time.Now().UTC()}
			payload, _ := json.Marshal(event)
			if err = connection.Write(ctx, websocket.MessageText, payload); err != nil {
				return
			}
		case message, ok := <-messages:
			if !ok {
				return
			}
			var data any
			if json.Unmarshal([]byte(message.Payload), &data) != nil {
				data = map[string]any{"payload": message.Payload}
			}
			event := Event{EventID: uuid.New(), Type: "domain.event", Data: data, ServerTimestamp: time.Now().UTC()}
			payload, _ := json.Marshal(event)
			if err = connection.Write(ctx, websocket.MessageText, payload); err != nil {
				return
			}
		}
	}
}
func (g *Gateway) Connections() int64 { return g.connections.Load() }

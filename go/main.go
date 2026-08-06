package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	_ "modernc.org/sqlite"
)

type user struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
}

type message struct {
	ID      int64  `json:"id"`
	UserID  int64  `json:"user_id"`
	Content string `json:"content"`
	Read    bool   `json:"read"`
}

type unreadMessage struct {
	ID      int64  `json:"id"`
	Content string `json:"content"`
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func databaseError(w http.ResponseWriter, err error) {
	log.Printf("database error: %v", err)
	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
}

func main() {
	if err := os.MkdirAll("db", 0o755); err != nil {
		log.Fatal(err)
	}

	db, err := sql.Open("sqlite", filepath.Join("db", "development.sqlite3"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	schema := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			read BOOLEAN NOT NULL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}
	for _, statement := range schema {
		if _, err := db.Exec(statement); err != nil {
			log.Fatal(err)
		}
	}

	router := chi.NewRouter()
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type", "Accept"},
		MaxAge:         86400,
	}))
	router.Get("/admin_api/users", func(w http.ResponseWriter, _ *http.Request) {
		rows, err := db.Query("SELECT id, email FROM users")
		if err != nil {
			databaseError(w, err)
			return
		}
		defer rows.Close()

		users := make([]user, 0)
		for rows.Next() {
			var current user
			if err := rows.Scan(&current.ID, &current.Email); err != nil {
				databaseError(w, err)
				return
			}
			users = append(users, current)
		}
		if err := rows.Err(); err != nil {
			databaseError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, users)
	})

	router.Post("/admin_api/messages", func(w http.ResponseWriter, r *http.Request) {
		var userID int64
		err := db.QueryRow("SELECT id FROM users WHERE email = ? LIMIT 1", r.FormValue("email")).Scan(&userID)
		if errors.Is(err, sql.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
			return
		}
		if err != nil {
			databaseError(w, err)
			return
		}

		content := r.FormValue("content")
		result, err := db.Exec("INSERT INTO messages (user_id, content, read) VALUES (?, ?, 0)", userID, content)
		if err != nil {
			databaseError(w, err)
			return
		}
		messageID, err := result.LastInsertId()
		if err != nil {
			databaseError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, map[string]message{
			"message": {ID: messageID, UserID: userID, Content: content, Read: false},
		})
	})

	router.Post("/customer_api/ping", func(w http.ResponseWriter, r *http.Request) {
		email := r.FormValue("email")
		var userID int64
		err := db.QueryRow("SELECT id FROM users WHERE email = ? LIMIT 1", email).Scan(&userID)
		if errors.Is(err, sql.ErrNoRows) {
			result, insertErr := db.Exec("INSERT INTO users (email) VALUES (?)", email)
			if insertErr != nil {
				databaseError(w, insertErr)
				return
			}
			userID, err = result.LastInsertId()
		}
		if err != nil {
			databaseError(w, err)
			return
		}

		rows, err := db.Query("SELECT id, content FROM messages WHERE user_id = ? AND read = 0", userID)
		if err != nil {
			databaseError(w, err)
			return
		}
		defer rows.Close()

		messages := make([]unreadMessage, 0)
		for rows.Next() {
			var current unreadMessage
			if err := rows.Scan(&current.ID, &current.Content); err != nil {
				databaseError(w, err)
				return
			}
			messages = append(messages, current)
		}
		if err := rows.Err(); err != nil {
			databaseError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, messages)
	})

	router.Post("/customer_api/read", func(w http.ResponseWriter, r *http.Request) {
		messageID, _ := strconv.ParseInt(r.FormValue("message_id"), 10, 64)
		if _, err := db.Exec("UPDATE messages SET read = 1 WHERE id = ?", messageID); err != nil {
			databaseError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, nil)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}
	log.Printf("Listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}

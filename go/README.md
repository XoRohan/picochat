# Go

Welcome to the Go backend! The server uses Chi and all code lives in `./go/main.go`.

## Prerequisites

Go 1.26 or newer.

## Setup

From the project root run `script/go/setup`

This will download dependencies and build the server.

## Starting the server

From the project root run `script/go/start`

The server listens on port 3001.

## Database

This project uses SQLite. The database file is created at `go/db/development.sqlite3` when the server starts.

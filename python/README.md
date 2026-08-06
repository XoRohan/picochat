# Python

Welcome to the Python backend! The server uses FastAPI and all code lives in `./python/main.py`.

## Prerequisites

Python 3.11 or newer.

## Setup

From the project root run `script/python/setup`

This will create a virtual environment and install dependencies.

## Starting the server

From the project root run `script/python/start`

The server listens on port 3001.

## Database

This project uses SQLite with [SQLAlchemy](https://www.sqlalchemy.org/). The database file is stored at `python/db/development.sqlite3`.

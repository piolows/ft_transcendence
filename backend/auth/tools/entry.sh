#/usr/bin/env sh

set -e

# Sqlite Database file and name for table
if [ ! -f "$DB_FILE" ]; then
	touch "$DB_FILE"
fi
if [ ! -f "$SESSIONS_DB" ]; then
	touch "$SESSIONS_DB"
fi

# Using heredoc to provide SQL input to sqlite
# NOTE: Everything after creating the table is TEMPORARY for TESTING purposes
sqlite3 "$DB_FILE" << SQL
CREATE TABLE IF NOT EXISTS $USERS_TABLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
	avatarURL TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS $GOOGLE_AUTH_TABLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
	googleID TEXT NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    avatarURL TEXT NOT NULL
);
SQL

npm i

exec npm run dev

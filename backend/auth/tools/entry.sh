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
    password TEXT,
	avatarURL TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
SQL

npm i

exec npm run dev

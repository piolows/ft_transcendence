#/usr/bin/env sh

set -e

apk add --no-cache sqlite

# Sqlite Database file and name for table
DB_FILE="/app/src/database/test.db"
TABLE_NAME="users";

# Using heredoc to provide SQL input to sqlite
# NOTE: Everything after creating the table is TEMPORARY for TESTING purposes
sqlite3 "$DB_FILE" << SQL
CREATE TABLE IF NOT EXISTS $TABLE_NAME (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM $TABLE_NAME;
INSERT INTO $TABLE_NAME (username, email) VALUES ('emad', 'dalimitisdasky@gmail.com');
INSERT INTO $TABLE_NAME (username, email) VALUES ('pierce', 'pdpdiet03@gmail.com');
SQL

npm i

npm run dev

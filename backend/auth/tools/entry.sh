#/usr/bin/env sh

set -e

# Sqlite Database file and name for table
if [ ! -f "$DB_FILE" ]; then
	touch "$DB_FILE"
fi

# Using heredoc to provide SQL input to sqlite
# NOTE: Everything after creating the table is TEMPORARY for TESTING purposes
sqlite3 "$DB_FILE" << SQL
CREATE TABLE IF NOT EXISTS $USERS_TABLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM $USERS_TABLE;
INSERT INTO $USERS_TABLE (username, email, password) VALUES ('emad', 'dalimitisdasky@gmail.com', 'etest');
INSERT INTO $USERS_TABLE (username, email, password) VALUES ('pierce', 'pdpdiet03@gmail.com', 'ptest');
SQL

npm i

npm run dev

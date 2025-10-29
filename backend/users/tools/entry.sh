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
    id INTEGER NOT NULL,
	username TEXT NOT NULL,
	email TEXT NOT NULL,
	avatarURL TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS $STATS_TABLE (
    user_id INTEGER NOT NULL,
	wins INTEGER NOT NULL,
	losses INTEGER NOT NULL,
	win_rate INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS $HISTORY_TABLE (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
	game TEXT NOT NULL,
	winner_id INTEGER NOT NULL,
	p1_score INTEGER NOT NULL,
	p2_score INTEGER NOT NULL,
	time INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS $FRIENDS_TABLE (
    user_id INTEGER NOT NULL,
	friend_id INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);
SQL

npm i

exec npm run dev

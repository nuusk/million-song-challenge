#!/usr/bin/env bash
 
# ,--.        ,--.  ,--.  ,--.        ,--.,--.               
# |  |,--,--, `--',-'  '-.`--' ,--,--.|  |`--',-----. ,---.  
# |  ||      \,--.'-.  .-',--.' ,-.  ||  |,--.`-.  / | .-. : 
# |  ||  ||  ||  |  |  |  |  |\ '-'  ||  ||  | /  `-.\   --. 
# `--'`--''--'`--'  `--'  `--' `--`--'`--'`--'`-----' `----' 
 
echo "# begin procedure create tables"

sqlite3 main.db \
"CREATE TABLE tracks (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL
);"
 
echo "~ tracks table created"
 
sqlite3 main.db \
"CREATE TABLE activities (
 user_id varchar(50) NOT NULL,
 song_id varchar(18) NOT NULL,
 timestamp integer NOT NULL
);"
 
echo "~ activities table created"

echo "# finish procedure create tables"
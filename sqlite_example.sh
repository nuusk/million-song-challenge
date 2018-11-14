#!/usr/bin/env bash
 
# ==================== SETUP ============================
 
echo "Starting SETUP..."
echo "Create TABLES..."
# CREATE TRACKS TABLE
sqlite3 example.db \
"CREATE TABLE tracks (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL,
 PRIMARY KEY (track_id)
);"
 
echo "TRACKS TABLE CREATED"
 
sqlite3 example.db \
"CREATE TABLE triplets (
 user_id varchar(50) NOT NULL,
 song_id varchar(18) NOT NULL,
 timestamp integer NOT NULL
);"
 
echo "TRIPLETS TABLE CREATED"
 
perl -pi -e 's/<SEP>/,/g' triplets_sample_20p.txt
perl -pi -e 's/<SEP>/,/g' unique_tracks.txt
 
echo "STUPID SEPARATOR DELETED"
 
echo "INSERTING DATA ..."
 
sqlite3 example.db "create temp table footmp(user_id,song_id,timestamp);"
printf '.separator ,\n.import triplets_sample_20p.txt footmp\n' | sqlite3 example.db
sqlite3 example.db "insert into triplets(user_id,song_id,timestamp) select * from footmp;"
 
echo "TRIPLETS DATA INSERTED"
 
sqlite3 example.db "create temp table bartmp(track_id,song_id,artist,title);"
printf '.separator ,\n.import unique_tracks.txt bartmp\n' | sqlite3 example.db
sqlite3 example.db "insert into tracks(track_id,song_id,artist,title) select * from bartmp;"
 
echo "TRACKS DATA INSERTED"
 
sqlite3 example.db "CREATE INDEX tracks_song_id ON tracks (song_id);"
echo "TRACKS SONG_ID INDEX CREATED"
 
sqlite3 example.db "CREATE INDEX triplets_user_id ON triplets (user_id);"
echo "TRIPLETS USER_ID INDEX CREATED"
 
sqlite3 example.db "CREATE INDEX triplets_track_id ON triplets (song_id);"
echo "TRIPLETS SONG_ID INDEX CREATED"
 
sqlite3 example.db "CREATE TABLE queen_table (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL
);"
 
sqlite3 example.db "insert into queen_table(track_id, song_id, artist, title) select tracks.track_id, tracks.song_id, tracks.artist, tracks.title from tracks join triplets on tracks.song_id = triplets.song_id where tracks.artist='Queen' group by tracks.song_id order by count(*) limit(3);"
 
echo "SETUP DONE"
 
# ================== TASKS ===================================
sqlite3 example.db "select tracks.title, tracks.artist, count(*) from triplets inner join tracks on triplets.song_id = tracks.song_id group by tracks.track_id order by count(*) desc limit(10);"
 
sqlite3 example.db "select triplets.user_id, count(distinct tracks.song_id) as uniq from tracks inner join triplets on triplets.song_id = tracks.song_id group by triplets.user_id order by uniq desc limit(5);"
 
sqlite3 example.db "select tracks.artist, count(*) as uniq from tracks inner join triplets on tracks.song_id = triplets.song_id group by tracks.artist order by uniq desc limit (1);"
 
sqlite3 example.db "select strftime('%m', datetime(triplets.timestamp, 'unixepoch')) as mon, count(*) from tracks inner join triplets on tracks.song_id = triplets.song_id group by mon order by mon asc;"
 
sqlite3 example.db "select triplets.user_id from triplets join (select count(*) as occ, tracks.song_id from tracks join triplets on triplets.song_id = tracks.song_id where tracks.artist = 'Queen' group by tracks.song_id order by occ desc limit(3)) as hits on triplets.song_id = hits.song_id group by triplets.user_id having count(distinct hits.song_id)=3 order by triplets.user_id limit(10);"
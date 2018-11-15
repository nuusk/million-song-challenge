#!/usr/bin/env bash
 
# Initialize
 
echo "# begin procedure create tables"

sqlite3 example.db \
"CREATE TABLE tracks (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL,
 PRIMARY KEY (song_id)
);"
 
echo "~ tracks table created"
 
sqlite3 example.db \
"CREATE TABLE activities (
 user_id varchar(50) NOT NULL,
 song_id varchar(18) NOT NULL,
 timestamp integer NOT NULL
);"
 
echo "activities TABLE CREATED"
 
perl -pi -e 's/<SEP>/,/g' triplets_sample_20p.txt
perl -pi -e 's/<SEP>/,/g' unique_tracks.txt
 
echo "~ replace delimiter <SEP> with ,"
 
echo "# begin procedure insert data"
 
sqlite3 example.db "create temp table footmp(user_id,song_id,timestamp);"
printf '.separator ,\n.import triplets_sample_20p.txt footmp\n' | sqlite3 example.db
sqlite3 example.db "insert into activities(user_id,song_id,timestamp) select * from footmp;"
 
echo "~ activities data inserted"
 
sqlite3 example.db "create temp table bartmp(track_id,song_id,artist,title);"
printf '.separator ,\n.import unique_tracks.txt bartmp\n' | sqlite3 example.db
sqlite3 example.db "insert into tracks(track_id,song_id,artist,title) select * from bartmp;"
 
echo "~ tracks data inserted"
 
sqlite3 example.db "CREATE INDEX tracks_song_id ON tracks (song_id);"
echo "~ tracks index created on song_id"
 
sqlite3 example.db "CREATE INDEX activities_user_id ON activities (user_id);"
echo "~ activities index created on user_id"
 
sqlite3 example.db "CREATE INDEX activities_track_id ON activities (song_id);"
echo "~ activities index created on track_id"
 
sqlite3 example.db "CREATE TABLE queen_table (
 track_id varchar(18) NOT NULL,
 song_id varchar(18) NOT NULL,
 artist varchar(256) DEFAULT NULL,
 title varchar(256) DEFAULT NULL
);"
 
sqlite3 example.db "insert into queen_table(track_id, song_id, artist, title) select tracks.track_id, tracks.song_id, tracks.artist, tracks.title from tracks join activities on tracks.song_id = activities.song_id where tracks.artist='Queen' group by tracks.song_id order by count(*) limit(3);"
 
echo "# finish procedure database setup"
 
# ================== TASKS ===================================
sqlite3 example.db "select tracks.title, tracks.artist, count(*) from activities inner join tracks on activities.song_id = tracks.song_id group by tracks.track_id order by count(*) desc limit(10);"
 
sqlite3 example.db "select activities.user_id, count(distinct tracks.song_id) as uniq from tracks inner join activities on activities.song_id = tracks.song_id group by activities.user_id order by uniq desc limit(5);"
 
sqlite3 example.db "select tracks.artist, count(*) as uniq from tracks inner join activities on tracks.song_id = activities.song_id group by tracks.artist order by uniq desc limit (1);"
 
sqlite3 example.db "select strftime('%m', datetime(activities.timestamp, 'unixepoch')) as mon, count(*) from tracks inner join activities on tracks.song_id = activities.song_id group by mon order by mon asc;"
 
sqlite3 example.db "select activities.user_id from activities join (select count(*) as occ, tracks.song_id from tracks join activities on activities.song_id = tracks.song_id where tracks.artist = 'Queen' group by tracks.song_id order by occ desc limit(3)) as hits on activities.song_id = hits.song_id group by activities.user_id having count(distinct hits.song_id)=3 order by activities.user_id limit(10);"
#!/usr/bin/env bash
                                          
#  ,-----.                                  
# '  .-.  '  ,--.,--. ,---.  ,---. ,--,--,  
# |  | |  |  |  ||  || .-. :| .-. :|      \ 
# '  '-'  '-.'  ''  '\   --.\   --.|  ||  | 
#  `-----'--' `----'  `----' `----'`--''--' 
                                          
#  ,---.                ,--.                         
# /  .-' ,--,--.,--,--, |  |-.  ,---.,--. ,--.,---.  
# |  `-,' ,-.  ||      \| .-. '| .-. |\  '  /(  .-'  
# |  .-'\ '-'  ||  ||  || `-' |' '-' ' \   ' .-'  `) 
# `--'   `--`--'`--''--' `---'  `---'.-'  /  `----'  
#                                    `---'                                                     


sqlite3 main.db \
"INSERT INTO queen_table(
  track_id, 
  song_id, 
  artist, 
  title
) SELECT 
  tracks.track_id, 
  tracks.song_id,
  tracks.artist,
  tracks.title 
FROM tracks
JOIN activities ON tracks.song_id = activities.song_id 
WHERE tracks.artist='Queen'
GROUP BY tracks.song_id 
ORDER BY count(*)
LIMIT(3)
;"

sqlite3 -separator ' ' main.db \
"SELECT
  activities.user_id
FROM activities 
JOIN (
  SELECT
    COUNT(*) AS occ,
    tracks.song_id
  FROM tracks
  JOIN
    activities ON activities.song_id = tracks.song_id
  WHERE tracks.artist = 'Queen'
  GROUP BY tracks.song_id
  ORDER BY occ DESC
  LIMIT(3)
  ) as hits 
ON activities.song_id = hits.song_id 
GROUP BY activities.user_id 
HAVING COUNT(distinct hits.song_id)=3
ORDER BY activities.user_id
LIMIT(10)
;"
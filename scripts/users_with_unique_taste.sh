#!/usr/bin/env bash

# ,--. ,--.        ,--.                       
# |  | |  |,--,--, `--' ,---. ,--.,--. ,---.  
# |  | |  ||      \,--.| .-. ||  ||  || .-. : 
# '  '-'  '|  ||  ||  |' '-' |'  ''  '\   --. 
#  `-----' `--''--'`--' `-|  | `----'  `----' 
#                         `--'                
#   ,--.                  ,--.          
# ,-'  '-. ,--,--. ,---.,-'  '-. ,---.  
# '-.  .-'' ,-.  |(  .-''-.  .-'| .-. : 
#   |  |  \ '-'  |.-'  `) |  |  \   --. 
#   `--'   `--`--'`----'  `--'   `----' 
                                      

sqlite3 main.db \
"SELECT
  activities.user_id,
  COUNT(distinct tracks.song_id) AS uniq
FROM tracks INNER JOIN activities on activities.song_id = tracks.song_id
GROUP BY activities.user_id
ORDER BY uniq desc limit(5)
;"
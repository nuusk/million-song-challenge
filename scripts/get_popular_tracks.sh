#!/usr/bin/env bash
                                                                                                                                                  
# ,------.                       ,--.                
# |  .--. ' ,---.  ,---. ,--.,--.|  | ,--,--.,--.--. 
# |  '--' || .-. || .-. ||  ||  ||  |' ,-.  ||  .--' 
# |  | --' ' '-' '| '-' ''  ''  '|  |\ '-'  ||  |    
# `--'      `---' |  |-'  `----' `--' `--`--'`--'    
#                 `--'                              

#         ,--.                       ,--.            
#       ,-'  '-.,--.--. ,--,--. ,---.|  |,-.  ,---.  
#       '-.  .-'|  .--'' ,-.  || .--'|     / (  .-'  
#         |  |  |  |   \ '-'  |\ `--.|  \  \ .-'  `) 
#         `--'  `--'    `--`--' `---'`--'`--'`----'  
                                             
sqlite3 -separator ' ' main.db \
"SELECT
  tracks.title, 
  tracks.artist, 
  count(*) 
  from activities 
INNER JOIN tracks ON activities.song_id = tracks.song_id
GROUP BY tracks.track_id ORDER BY
count(*) DESC
LIMIT(10)
;"
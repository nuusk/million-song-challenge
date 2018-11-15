#!/usr/bin/env bash

bash scripts/drop_tables.sh

bash scripts/initialize.sh
 
bash scripts/import.sh

bash scripts/index.sh

bash scripts/get_popular_tracks.sh
 
bash scripts/users_with_unique_taste.sh

bash scripts/get_monthly_activities.sh

bash scripts/get_popular_artist.sh

bash scripts/get_queen_fanboys.sh
FROM ubuntu:latest

# Install latest updates
RUN apt-get update
RUN apt-get upgrade -y

# Install your software
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install sqlite3

# Set working dir
WORKDIR .

# Copy dataset to working dir
COPY unique_tracks.txt .
COPY triplets_sample_20p.txt .
COPY tracks_test.txt .
COPY activities_test.txt .

# Copy all scripts (procedures)
RUN mkdir scripts
COPY scripts/*.sh scripts/

# Copy source code
COPY app.sh .

# Run the app
CMD bash app.sh
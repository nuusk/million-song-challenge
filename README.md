# Million song dataset challenge

http://www.cs.put.poznan.pl/kdembczynski/lectures/pmds/labs/03/lab-03.pdf
http://www.cs.put.poznan.pl/kdembczynski/lectures/pmds/labs/04/lab-04.pdf

## Getting started

Instructions for how to get started with the project on your local machine.

### Prerequisites

You will need docker in order to run it.
You can get it from the official website https://www.docker.com/get-started.

You will also need some data to import to the database. The files that I've been using are accessible through the laboratory website.

| File | Download link |
| ------------- | ------------- |
| Unique tracks  | [unique_tracks.zip](http://www.cs.put.poznan.pl/kdembczynski/lectures/data/unique_tracks.zip) |
| Listen activities (.zip)  | [triplets_sample_20p.zip](http://www.cs.put.poznan.pl/kdembczynski/lectures/data/triplets_sample_20p.zip) |

### Installing

Clone the repo.

```
git clone https://github.com/pietersweter/million-song-challenge.git
```

Compose containers and run

```
docker-compose up
```

## Built With

* [Docker](https://www.docker.com)
* [Node.js](https://nodejs.org/en/)
* [PostgreSQL](https://www.postgresql.org)
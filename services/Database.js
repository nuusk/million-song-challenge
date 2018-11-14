const { Client } = require('pg');
const fs = require('fs');
const copyFrom = require('pg-copy-streams').from;
const format = require('pg-format');
const replaceStream = require('replacestream');

require('dotenv').config();

const FILE_SEPARATOR = process.env.FILE_SEPATATOR || '<SEP>';
const REPLACED_FILE_SEPARATOR = process.env.REPLACED_FILE_SEPARATOR || ',';

const MODE = process.env.MODE || 'prod';

class Database {
  constructor() {
    this.client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    this.ACTIVITIES_NUM = 0;
  }

  connect() {
    return this.client.connect().then(err => {
      if (!err) {
        if (MODE !== 'prod') console.log('Successfully connected to db...\n');
      }
    });
  }

  wrapTask(task) {
    return new Promise((resolve, reject) => {
      if (MODE !== 'prod') {
        console.time(task.name);
        console.log(`# Begin ${task.name} procedure`);
      }
      task.bind(this)()
        .then(() => {
          if (MODE !== 'prod') {
            console.log(`# Task ${task.name} finished`);
            console.timeEnd(task.name);
            console.log('\n');
          }
          resolve();
        })
        .catch(reject);
    }) 
  }

  async main() {
    console.time('main');
    const tasks = [
      this.initializeTables,
      this.copyFromFiles,
      this.createSchema,
      // this.indexTables,
      // this.getMostPopularTracks,
      // this.getUsersWithMostUniqueTracksListened,
      // this.getMostPopularArtist,
      // this.getMonthlyListenActivities,
      // this.getQueenFanboys,
      // this.getTracks,
      // this.getActivitiesTmp,
      // this.getActivities,
      this.quit
    ];

    await (async function() {
      for (let i = 0; i < tasks.length; i++) {
        await this.wrapTask(tasks[i]);
      }
    }.bind(this))();

    console.timeEnd('main');
  }

  reindexTables() {
    const reindexTracks = this.client.query(
      `reindex tracks`
    ).then(res => {
      if (MODE !== 'prod') console.log('[index] tracks table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    const reindexActivities = this.client.query(
      `reindex listen_activities`
    ).then(res => {
      if (MODE !== 'prod') console.log('[index] listen_activities table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([reindexTracks, reindexActivities]);
  }

  indexTables() {
    const indexTracks = this.client.query(
      `CREATE INDEX track_index ON tracks(track_id, artist_name, track_name)`
    ).then(res => {
      if (MODE !== 'prod') console.log('[index] tracks table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    const indexActivities = this.client.query(
      `CREATE INDEX activity_index ON listen_activities(track_id, user_id, activity_date)`
    ).then(res => {
      if (MODE !== 'prod') console.log('[index] listen_activities table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([indexTracks, indexActivities]);
  }

  initializeTables() {
    const dropTracks = this.client.query(
      `DROP TABLE IF EXISTS tracks`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully deleted tracks table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropActivities = this.client.query(
      `DROP TABLE IF EXISTS listen_activities`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully deleted listen_activities table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropActivitiesTmp = this.client.query(
      `DROP TABLE IF EXISTS listen_activities_tmp`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully deleted listen_activities_tmp table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropDates = this.client.query(
      `DROP TABLE IF EXISTS dates`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully deleted dates table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropUsers = this.client.query(
      `DROP TABLE IF EXISTS users`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully deleted users table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createTracks = this.client.query(
      `CREATE TABLE IF NOT EXISTS tracks (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        track_id TEXT,
        artist_name TEXT,
        track_name TEXT
      )`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully created tracks table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createActivitiesTmp = this.client.query(
      ` CREATE TABLE IF NOT EXISTS listen_activities_tmp (
        user_id TEXT,
        track_id TEXT,
        activity_date NUMERIC
      )`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully created listen_activities_tmp table.');
    }).catch(err => {
      console.error(e.stack);
    });
    
    const createActivities = this.client.query(
      ` CREATE TABLE IF NOT EXISTS listen_activities (
        user_id INT,
        track_id INT,
        date_id INT
      )`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully created listen_activities table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createDates = this.client.query(
      ` CREATE TABLE IF NOT EXISTS dates (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        year NUMERIC,
        month NUMERIC,
        day NUMERIC
      )`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully created dates table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createUsers = this.client.query(
      ` CREATE TABLE IF NOT EXISTS users (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id TEXT
      )`
    ).then(res => {
      if (MODE !== 'prod') console.log('[init] Successfully created users table.');
    }).catch(err => {
      console.error(e.stack);
    });

    return Promise.all([
      dropTracks,
      dropActivities,
      dropActivitiesTmp,
      dropDates,
      dropUsers,
      createTracks,
      createActivities,
      createActivitiesTmp,
      createDates,
      createUsers
    ]);
  }

  enableIndexes() {
    const enableIndexActivities = this.client.query(
      `UPDATE pg_index
      SET indisready=true
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='listen_activities'
      )`
    ).then(() => {
      if (MODE !== 'prod') console.log('[index] Indexes on listen_activities table have been enabled.');
    }).catch(err => {
      console.error(err);
    });

    const enableIndexTracks = this.client.query(
      `UPDATE pg_index
      SET indisready=true
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='tracks'
      )`
    ).then(() => {
      if (MODE !== 'prod') console.log('[index] Indexes on tracks table have been enabled.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([enableIndexActivities, enableIndexTracks]);
  }

  disableIndexes() {
    const disableIndexActivities = this.client.query(
      `UPDATE pg_index
      SET indisready=false
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='listen_activities'
      )`
    ).then(() => {
      if (MODE !== 'prod') console.log('[index] Indexes on listen_activities table have been disabled.');
    }).catch(err => {
      console.error(err);
    });

    const disableIndexTracks = this.client.query(
      `UPDATE pg_index
      SET indisready=false
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='tracks'
      )`
    ).then(() => {
      if (MODE !== 'prod') console.log('[index] Indexes on tracks table have been disabled.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([disableIndexActivities, disableIndexTracks]);
  }

  createSchema() {
    const BATCH_SIZE = 10;
    const ITERATION_NUM = 4;

    const clientPromise = new Promise((resolve, reject) => {
      this.client.query('BEGIN', (err) => {
        if (err) reject(err);

        // INSERT INTO listen_activities(user_id, track_id)
          // SELECT user_id::int, track_id
          // FROM listen_activities_tmp


        for (let i = 0; i < ITERATION_NUM; i++) {
          this.client.query(`
            SELECT 
              user_id,
              track_id,
              TO_CHAR(TO_TIMESTAMP(activity_date), 'YYYY') AS year,
              TO_CHAR(TO_TIMESTAMP(activity_date), 'fmMM') AS month,
              TO_CHAR(TO_TIMESTAMP(activity_date), 'fmDD') AS day
            FROM listen_activities_tmp
            LIMIT ${BATCH_SIZE}
            OFFSET ${i*BATCH_SIZE}
          `, (err, res) => {
            if (err) reject(err);

            console.log(`\n\n~~ iteration [${i}] ~`);

            if (res) {
              console.table(res.rows);

              const insertDateValues = res.rows.map(row => {
                return [
                  row.year,
                  row.month,
                  row.day
                ]
              });
              // res.rows.forEach(row => {
              //   console.log(row.date);
              // });

              // console.log(insertDateValues);
      
              const insertDateText = (`
                INSERT INTO dates(year, month, day)
                VALUES %L
                RETURNING year, month, day
              `);
              // const insertDateValues = [
              //   [1995, 7, 3],
              //   [1995, 7, 2],
              //   [1995, 7, 1]
              // ]
              this.client.query(format(insertDateText, insertDateValues), (err, res) => {
                if (err) reject(err);

                if (res) {
                  console.table(res.rows);
                }
        
              //   this.client.query('COMMIT', (err) => {
              //     if (err) {
              //       console.error('Error committing transaction', err.stack)
              //     }
              //     resolve();
              //   })
              })

            }
          })
        }
      })
    });

    return clientPromise;
  }

  copyFromFiles() {
    const files = [
      `${__dirname}/../listenActivities2.txt`, 
      `${__dirname}/../tracks2.txt`,
      `${__dirname}/../test.txt`
    ];
    
    const activityPromise = new Promise((resolve, reject) => {

      const stream = this.client.query(copyFrom(`copy listen_activities_tmp (user_id, track_id, activity_date) FROM STDIN WITH DELIMITER '${REPLACED_FILE_SEPARATOR}'`));
      const activityStream = fs.createReadStream(files[0]);
      
      activityStream.on('error', reject);
      stream.on('end', resolve);
      stream.on('error', reject);
      activityStream
        .pipe(replaceStream(FILE_SEPARATOR, REPLACED_FILE_SEPARATOR))
        .pipe(stream);
    });

    const trackPromise = new Promise((resolve, reject) => {
      const stream = this.client.query(copyFrom(`COPY tracks (track_id, artist_name, track_name) FROM STDIN WITH DELIMITER '${REPLACED_FILE_SEPARATOR}'`));
      const trackStream = fs.createReadStream(files[1]);

      trackStream.on('error', reject);
      stream.on('end', resolve);
      stream.on('error', reject);
      trackStream
        .pipe(replaceStream(/^[^(<SEP>)]*(<SEP>)/gm, ''))     // Remove first column (it is not used anyway)
        .pipe(replaceStream(FILE_SEPARATOR, REPLACED_FILE_SEPARATOR))
        .pipe(stream);
    });

    return Promise.all([trackPromise, activityPromise]);
  }

  async getTracks() {
    const results = await this.client.query(
      `SELECT * FROM tracks`
    );

    console.table(results.rows);
  }

  async getActivities() {
    const results = await this.client.query(
      `SELECT * FROM listen_activities`
    );

    console.table(results.rows);
  }

  async getActivitiesTmp() {
    const results = await this.client.query(
      `SELECT * FROM listen_activities_tmp`
    );

    console.table(results.rows);
  }

  async getMostPopularTracks() {
    const results = await this.client.query(
      ` SELECT track_name, artist_name, COUNT(*) as popularity_counter
        FROM tracks JOIN listen_activities USING(track_id)
        GROUP BY (artist_name, track_name)
        ORDER BY popularity_counter DESC
        FETCH FIRST 10 ROWS ONLY
      `
    );
    
    if (MODE !== 'prod') {
      console.table(results.rows);
    } else {
      for (let i = 0; i < results.rowCount; i++) {
        console.log(`${results.rows[i].track_name} ${results.rows[i].artist_name} ${results.rows[i].popularity_counter}`);
      }
    }
  }

  async getUsersWithMostUniqueTracksListened() {
    const results = await this.client.query(
      ` SELECT user_id, COUNT(DISTINCT track_id) as unique_tracks_counter
        FROM tracks JOIN listen_activities USING(track_id)
        GROUP BY user_id
        ORDER BY unique_tracks_counter DESC
        FETCH FIRST 10 ROWS ONLY
      `
    );

    if (MODE !== 'prod') {
      console.table(results.rows);
    } else {
      for (let i = 0; i < results.rowCount; i++) {
        console.log(`${results.rows[i].user_id} ${results.rows[i].unique_tracks_counter}`);
      }
    }
  }

  async getMostPopularArtist() {
    const results = await this.client.query(
      ` SELECT artist_name, COUNT(*) as listen_counter
        FROM tracks JOIN listen_activities USING(track_id)
        GROUP BY artist_name
        FETCH FIRST 1 ROWS ONLY
      `
    );

    if (MODE !== 'prod') {
      console.table(results.rows);
    } else {
      console.log(`${results.rows[0].artist_name} ${results.rows[0].listen_counter}`);
    }
  };

  async getMonthlyListenActivities() {
    const results = await this.client.query(
      ` SELECT TO_CHAR(TO_TIMESTAMP(activity_date), 'fmMM') AS month, COUNT(*)
        FROM tracks JOIN listen_activities USING(track_id) GROUP BY month ORDER BY month ASC`
    );

    if (MODE !=='prod') {
      console.table(results.rows);
    } else {
      for (let i = 0; i < results.rowCount; i++) {
        console.log(`${results.rows[i].month} ${results.rows[i].count}`);
      }
    }
  }

  async getQueenFanboys() {
    const results = await this.client.query(
      ` SELECT COUNT(DISTINCT hits.track_id), activities.user_id FROM
        listen_activities AS activities
        JOIN (
          SELECT COUNT(*) AS listen_counter, track_id
          FROM tracks JOIN listen_activities
          USING(track_id)
          WHERE lower(artist_name) = 'queen'
          GROUP BY track_id
          ORDER BY listen_counter DESC
          FETCH FIRST 3 ROWS ONLY
        ) as hits
        ON activities.track_id = hits.track_id
        GROUP BY user_id
        HAVING COUNT(DISTINCT hits.track_id) = 3
        ORDER BY user_id DESC
      `
    );

    if (MODE !== 'prod') {
      console.table(results.rows);
    } else {
      for (let i = 0; i < results.rowCount; i++) {
        console.log(results.rows[i].user_id);
      }
    }
  }

  quit() {
    return this.client.end();
  }
}

module.exports = Database;

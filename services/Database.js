const { Pool, Client } = require('pg');
const fs = require('fs');
const copyFrom = require('pg-copy-streams').from;
const replaceStream = require('replacestream');

require('dotenv').config();
const FILE_SEPARATOR = '<SEP>'
const REPLACED_FILE_SEPARATOR = ',';

// const datasourcesConfigFilePath = path.join(__dirname,'..','..','server','datasources.json');
// const datasources = JSON.parse(fs.readFileSync(datasourcesConfigFilePath, 'utf8'));

const { toDoubleQuotes, formatDate } = require('../scripts/utilities');

class Database {
  constructor() {
    this.client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });
    // this.pool.connect().then(() => {
    //   console.log('Successfully connected to db...');
    //   this.main();
    // })

    // this.client.connect().then(() => {
    //   console.log('Successfully connected to db...');
    //   this.main();
    // });
  }

  connect() {
    return this.client.connect().then(() => {
      console.log('Successfully connected to db...\n');
    });
  }

  async main() {
    await this.initializeTables();
    console.log('# Tables have been initialized.');

    // console.log('# Begin disable indexes procedure.')
    // await this.disableIndexes();
    // console.log('# Indexes have been disabled.');

    console.log('# Begin fill database procedure.')
    await this.fillDatabase();
    console.log('# Fill database ended without failure.');

    // console.log('# Begin enable indexes procedure.')
    // await this.enableIndexes();
    // console.log('# Indexes have been enabled.');

    // console.log('# Begin reindex procedure.')
    // await this.reindexTables();
    // console.log('# Tables have been reindexed.');

    console.log('# Begin Index procedure.')
    await this.indexTables();
    console.log('# Tables have been indexed.');

    // console.log('# Prepare to list results.');
    // await this.getTracks();
    // await this.getActivities();
    // console.log('# Listing finished.');

    console.log('\n<Task 1> Prepare to list Most popular tracks.');
    await this.getMostPopularTracks();
    console.log('# Task 1 finished.\n');

    console.log('\n<Task 2> Prepare to list Most active users.');
    await this.getUsersWithMostUniqueTracksListened();
    console.log('# Task 2 finished.\n');

    console.log('# Proceed to finish operation.');
    this.quit();
    console.log('# You should not have seen this message, captain.');

    // await this.getMostPopularTracks();
  }

  reindexTables() {

    const reindexTracks = this.client.query(
      `reindex tracks`
    ).then(res => {
      console.log('[index] tracks table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    const reindexActivities = this.client.query(
      `reindex listen_activities`
    ).then(res => {
      console.log('[index] listen_activities table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([reindexTracks, reindexActivities]);
  }

  indexTables() {

    const indexTracks = this.client.query(
      `CREATE INDEX track_index ON tracks(track_id, artist_name, track_name)`
    ).then(res => {
      console.log('[index] tracks table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    const indexActivities = this.client.query(
      `CREATE INDEX activity_index ON listen_activities(track_id, user_id, activity_date)`
    ).then(res => {
      console.log('[index] listen_activities table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([indexTracks, indexActivities]);
  }

  initializeTables() {

    const dropTracks = this.client.query(
      `drop table if exists tracks`
    ).then(res => {
      console.log('[init] Successfully deleted tracks table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropActivities = this.client.query(
      `drop table if exists listen_activities`
    ).then(res => {
      console.log('[init] Successfully deleted listen_activities table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createTracks = this.client.query(
      'CREATE TABLE IF NOT EXISTS tracks (recording_id TEXT, track_id TEXT, artist_name TEXT, track_name TEXT)'
    ).then(res => {
      console.log('[init] Successfully created tracks table.');
    }).catch(err => {
      console.error(e.stack);
    });
    
    const createActivities = this.client.query(
      'CREATE TABLE IF NOT EXISTS listen_activities (user_id TEXT, track_id TEXT, activity_date NUMERIC)'
    ).then(res => {
      console.log('[init] Successfully created listen_activities table.');
    }).catch(err => {
      console.error(e.stack);
    });

    return Promise.all([
      dropTracks,
      dropActivities,
      createTracks,
      createActivities
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
      console.log('[index] Indexes on listen_activities table have been enabled.');
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
      console.log('[index] Indexes on tracks table have been enabled.');
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
      console.log('[index] Indexes on listen_activities table have been disabled.');
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
      console.log('[index] Indexes on tracks table have been disabled.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([disableIndexActivities, disableIndexTracks]);
  }

  fillDatabase() {

    const files = [
      `${__dirname}/../listenActivities.txt`, 
      `${__dirname}/../tracks.txt`,
      `${__dirname}/../test.txt`
    ];
    
    const activityPromise = new Promise((resolve, reject) => {

      const stream = this.client.query(copyFrom(`copy listen_activities (user_id, track_id, activity_date) FROM STDIN WITH DELIMITER '${REPLACED_FILE_SEPARATOR}'`));
      const activityStream = fs.createReadStream(files[0]);
      
      activityStream.on('error', reject);
      stream.on('end', resolve);
      stream.on('error', reject);
      activityStream
        .pipe(replaceStream(FILE_SEPARATOR, REPLACED_FILE_SEPARATOR))
        .pipe(stream);
    });

    const trackPromise = new Promise((resolve, reject) => {
      const stream = this.client.query(copyFrom(`COPY tracks (recording_id, track_id, artist_name, track_name) FROM STDIN WITH DELIMITER '${REPLACED_FILE_SEPARATOR}'`));
      const trackStream = fs.createReadStream(files[1]);

      trackStream.on('error', reject);
      stream.on('end', resolve);
      stream.on('error', reject);
      trackStream
        .pipe(replaceStream(FILE_SEPARATOR, REPLACED_FILE_SEPARATOR))
        .pipe(stream);
    });

    return Promise.all([trackPromise, activityPromise]);
  }

  async getTracks() {
  const tracks = await this.client.query({
    rowMode: 'array',
    text: 'SELECT * FROM tracks'
  });

  tracks.rows.forEach(track => {
    console.log(track);
  });
  }

  async getActivities() {
  const activities = await this.client.query({
    rowMode: 'array',
    text: 'SELECT * FROM listen_activities'
  });

  activities.rows.forEach(activity => {
    console.log(activity);
  });
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
    
    console.table(results.rows);
  }

  async getUsersWithMostUniqueTracksListened() {
    const results = await this.client.query(
      ` SELECT user_id, COUNT(DISTINCT track_id) as unique_tracks_counter
        FROM tracks JOIN listen_activities USING(track_id)
        GROUP BY user_id
        ORDER BY unique_tracks_counter DESC
        FETCH FIRST 5 ROWS ONLY
      `
    );

    console.table(results.rows);
  }

  quit() {
    this.pool.end();
  }
}

module.exports = Database;

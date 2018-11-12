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

    this.client.connect().then(() => {
      console.log('Successfully connected to db...');
      this.main();
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

    console.log('# Prepare to list results.');
    // await this.getTracks();
    await this.getActivities();
    console.log('# Listing finished.');

    console.log('# Proceed to finish operation.');
    this.quit();
    console.log('# You should not have seen this message, captain.');

    // await this.getMostPopularTracks();
  }

  reindexTables() {

    const reindexTracks = this.client.query(
      `reindex TRACKS`
    ).then(res => {
      console.log('[index] TRACKS table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    const reindexActivities = this.client.query(
      `reindex LISTEN_ACTIVITIES`
    ).then(res => {
      console.log('[index] LISTEN_ACTIVITIES table has been reindexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([reindexTracks, reindexActivities]);
  }

  indexTables() {

    const indexTracks = this.client.query(
      `CREATE INDEX track_index ON tracks(track_id, artist_name, track_name)`
    ).then(res => {
      console.log('[index] TRACKS table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    const indexActivities = this.client.query(
      `CREATE INDEX activity_index ON listen_activities(track_id, user_id, activity_date)`
    ).then(res => {
      console.log('[index] LISTEN_ACTIVITIES table has been indexed.');
    }).catch(err => {
      console.error(err);
    });

    return Promise.all([indexTracks, indexActivities]);
  }

  initializeTables() {

    const dropTracks = this.client.query(
      `drop table if exists TRACKS`
    ).then(res => {
      console.log('[init] Successfully deleted TRACKS table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const dropActivities = this.client.query(
      `drop table if exists LISTEN_ACTIVITIES`
    ).then(res => {
      console.log('[init] Successfully deleted LISTEN_ACTIVITIES table.');
    }).catch(err => {
      console.error(e.stack);
    });

    const createTracks = this.client.query(
      'create table if not exists TRACKS (RECORDING_ID TEXT, TRACK_ID TEXT, ARTIST_NAME TEXT, TRACK_NAME TEXT)'
    ).then(res => {
      console.log('[init] Successfully created TRACKS table.');
    }).catch(err => {
      console.error(e.stack);
    });
    
    const createActivities = this.client.query(
      'create table if not exists LISTEN_ACTIVITIES (TRACK_ID TEXT, USER_ID TEXT, ACTIVITY_DATE NUMERIC)'
    ).then(res => {
      console.log('[init] Successfully created LISTEN_ACTIVITIES table.');
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
        WHERE relname='LISTEN_ACTIVITIES'
      )`
    ).then(() => {
      console.log('[index] Indexes on LISTEN_ACTIVITIES table have been enabled.');
    }).catch(err => {
      console.error(err);
    });

    const enableIndexTracks = this.client.query(
      `UPDATE pg_index
      SET indisready=true
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='TRACKS'
      )`
    ).then(() => {
      console.log('[index] Indexes on TRACKS table have been enabled.');
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
        WHERE relname='LISTEN_ACTIVITIES'
      )`
    ).then(() => {
      console.log('[index] Indexes on LISTEN_ACTIVITIES table have been disabled.');
    }).catch(err => {
      console.error(err);
    });

    const disableIndexTracks = this.client.query(
      `UPDATE pg_index
      SET indisready=false
      WHERE indrelid = (
        SELECT oid
        FROM pg_class
        WHERE relname='TRACKS'
      )`
    ).then(() => {
      console.log('[index] Indexes on TRACKS table have been disabled.');
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

      const stream = this.client.query(copyFrom(`copy LISTEN_ACTIVITIES (TRACK_ID, USER_ID, ACTIVITY_DATE) from stdin with delimiter '${REPLACED_FILE_SEPARATOR}'`));
      const activityStream = fs.createReadStream(files[0]);
      
      activityStream.on('error', reject);
      stream.on('end', resolve);
      stream.on('error', reject);
      activityStream
        .pipe(replaceStream(FILE_SEPARATOR, REPLACED_FILE_SEPARATOR))
        .pipe(stream);
    });

    const trackPromise = new Promise((resolve, reject) => {
      const stream = this.client.query(copyFrom(`COPY tracks FROM STDIN WITH DELIMITER '${REPLACED_FILE_SEPARATOR}'`));
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
      text: 'select * from TRACKS'
    });

    tracks.rows.forEach(track => {
      console.log(track);
    });
   }

   async getActivities() {
    const activities = await this.client.query({
      rowMode: 'array',
      text: 'select * from LISTEN_ACTIVITIES'
    });

    activities.rows.forEach(activity => {
      console.log(activity);
    });
   }

  async getMostPopularTracks() {
    const tracks = await this.client.query(
      'select * from LISTEN_ACTIVITIES'
      // 'select TRACK_NAME, ARTIST_NAME, count(*) as occ from TRACKS join LISTEN_ACTIVITIES using(TRACK_ID) group by (ARTIST_NAME, TRACK_NAME) order by occ desc fetch first 10 rows only'
    );
    
    //console.log(tracks);

    tracks.rows.forEach(track => {
      //console.log(track);
      // //console.log(`${track.track_name} ${track.artist_name} ${track.track_name}`);
    });
  }

  async addTrack(track) {

    await this.client.query(
      `insert into TRACKS ( \
        TRACK_ID, RECORDING_ID, ARTIST_NAME, TRACK_NAME \
      ) values ( \
        '${track.trackID}', '${track.recordingID}', '${toDoubleQuotes(track.artistName)}', '${toDoubleQuotes(track.trackName)}' \
      )`
    );
  }

  async addListenActivity(listenActivity) {
  
    await this.client.query(
      `insert into LISTEN_ACTIVITIES ( \
        TRACK_ID, USER_ID, ACTIVITY_DATE \
      ) values ( \
        '${listenActivity.trackID}', '${listenActivity.userID}', '${formatDate(listenActivity.date)}'::date \
      )`
    );

  }

  findTracks() {
    return new Promise((resolve, reject) => {
      Track.find({})
        .then((tracks) => {
          resolve(tracks);
        });
    });
  }

  quit() {
    this.pool.end();
  }
}

module.exports = Database;

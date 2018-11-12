const pg = require('pg');

const DB_PASSWORD = 'NIEpodam123';
const DB_USER = 'poe';
const DB_NAME = 'million-song';

const Database = require('./services/Database');
const db = new Database();
const Database = require('./services/Database');
const db = new Database();

db.connect()
  .then(() => {
    db.main();
  });
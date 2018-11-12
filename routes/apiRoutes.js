const Database = require('../services/Database');
const db = new Database();

const FANCY_TIMER = 1000;

module.exports = (app) => {

  app.get('/tracks', (req, res) => {
    db.findTracks()
      .then(tracks => {
        res.send(tracks);
      });
  });

  app.get('/info', (req, res) => {
    res.send("<h2>DOCKER FTW</h2>");
  })
};
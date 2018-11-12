const mongoose = require('mongoose');
const { Schema } = mongoose;

const TrackSchema = Schema({
  trakcID: String,
  recordingID: String,
  artistName: String,
  trackName: String
});

const Track = mongoose.model('tracks', TrackSchema);

module.exports = Track;

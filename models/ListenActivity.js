const mongoose = require('mongoose');
const { Schema } = mongoose;

const ListenActivitySchema = Schema({
  userID: String,
  trackID: String,
  date: Date
});

const ListenActivity = mongoose.model('listenActivities', ListenActivitySchema);

module.exports = ListenActivity;

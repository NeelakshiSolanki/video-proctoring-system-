const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventLog = new Schema({
  candidate: String,
  start: Date,
  end: Date,
  duration_seconds: Number,
  events: Array,
  videoFilename: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventLog', EventLog);

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
const CATEGORIES = require('./categories');

var eventSchema = new Schema({

const EventModel = mongoose.model('event', eventSchema);
module.exports = EventModel;
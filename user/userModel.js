var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({	'username' : { type: String, required: true},	'password' : { type: String, required: true},	'email' : { type: String, required: true},	'role' : { type: String, default: 'Particular'},	'validated' : { type: Boolean, default: false},	'description' : String});

module.exports = mongoose.model('user', userSchema);

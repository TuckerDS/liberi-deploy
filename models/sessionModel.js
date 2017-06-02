var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	'_id' : String,
	'session' : { type: Object},
	'expire' : {type: Date},
});

module.exports = mongoose.model('session', userSchema);

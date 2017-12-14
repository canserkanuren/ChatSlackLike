var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = mongoose.model('User');

var MessageSchema = new Schema({
    content : String,
    date : Date,
    user : { type : mongoose.Schema.Types.ObjectId, ref : "User"},
    channel : { type : mongoose.Schema.Types.ObjectId, ref : "Channel"}
});

var User = mongoose.model('Message', MessageSchema);

module.exports = User;
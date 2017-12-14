var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Message = mongoose.model('Message');

var ChannelSchema = new Schema({
    id: String,
    name: String,
    user : { type : mongoose.Schema.Types.ObjectId, ref : "User"}
});

var Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;
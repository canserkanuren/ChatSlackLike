var express = require('express');
var router = express.Router();
var isAuth = require('../../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var md = require('marked');
var Message = mongoose.model('Message');

router.get('/:id', isAuth, (req, res, next) => {
  let user = req.app.get('connectedUsers').find((obj) => {
    return obj.user == req.user.username;
  }); 

  if(!user){
    req.app.get('connectedUsers').push({user: req.user.username, channel_id: req.params.id});
  }
  
  req.app.get('socketio').emit('new-user', req.user.username);
  
  Message.find({channel : req.params.id}).sort({'date' : 'asc'}).populate('user').populate('channel').exec((err, items) => {
    res.render('chat/list', { messages: items, user_id: req.user._id, channel_id : req.params.id, md: md, connectedUsers: req.app.get('connectedUsers')});
  });
});

router.post('/:id/addMessage', isAuth, (req, res, next) => {
  var message = req.body;
  message.date = new Date();
  message.user = req.user;
  message.channel = req.params.id;

  Message.create(message, (err, item) => {
    req.app.get('socketio').emit('new-message', message);
    res.redirect('/channel/' + req.params.id);
  });
});

router.get('/:id/delete/:idMessage', isAuth, (req, res, next) => {
  Message.findById(req.params.idMessage, (err, item)  => {
    if(item.user.toString() == req.user._id.toString()) {
      Message.findByIdAndRemove(req.params.idMessage, (err, item) => {
        if(err){
          return res.send("Error");
        }
        res.redirect('/channel/' + req.params.id);
      });
    }
    else {
      req.app.get('socketio').emit('delete-not-authorized');
    }
  });
});

module.exports = router;
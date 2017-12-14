var express = require('express');
var router = express.Router();
var isAuth = require('../../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var md = require('marked');
var Message = mongoose.model('Message');

router.get('/:id', isAuth, function(req, res, next) {
  Message.find({channel : req.params.id}).sort({'date' : 'asc'}).populate('user').populate('channel').exec(function(err, items)
  {
    res.render('chat/list', { messages: items, user_id: req.user._id, channel_id : req.params.id, md: md});
    
  });
});

router.post('/:id/addMessage', isAuth, function(req, res) {
  var message = req.body;
  message.date = new Date();
  message.user = req.user;
  message.channel = req.params.id;

  Message.create(message, function(err, item){
    req.app.get('socketio').emit('new-message', message);
    res.redirect('/channel/' + req.params.id);
  });
});

router.get('/:id/delete/:idMessage', isAuth, function(req, res){
  Message.findById(req.params.idMessage, function(err, item) {
    if(item.user.toString() == req.user._id.toString())
      Message.findByIdAndRemove(req.params.idMessage, function(err, item) {
        if(err)
          return res.send("Error");
        
          res.redirect('/channel/' + req.params.id);
      });
    else
      alert('You cannot delete this message : it is not yours.');
      res.redirect('/channel/' + req.params.id);
  });
});

module.exports = router;
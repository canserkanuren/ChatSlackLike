var express = require('express');
var router = express.Router();
var isAuth = require('../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var Message = mongoose.model('Message');

router.get('/', isAuth, function(req, res, next) {
  Message.find().sort({'date' : 'asc'}).populate('user').exec(function(err, items)
  {
    res.render('chat/list', { messages: items, user_id: req.user._id });
  });
});

router.post('/new', isAuth, function(req, res) {
  var message = req.body;
  message.date = new Date();
  message.user = req.user

  Message.create(message, function(err, item){
    req.app.get('socketio').emit('new-message', message);
    res.redirect('/');
  });
});

router.get('/delete/:id', isAuth, function(req, res){
  Message.findById(req.params.id, function(err, item) {
    if(item.user.toString() == req.user._id.toString())
      Message.findByIdAndRemove(req.params.id, function(err, item) {
        if(err)
          return res.send("Error");
        
          res.redirect('/');
      });
    else
      res.redirect('/');
  });
});

module.exports = router;

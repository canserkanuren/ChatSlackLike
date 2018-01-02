var express = require('express');
var router = express.Router();
var isAuth = require('../../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var md = require('marked');
var nodeEmoji = require('node-emoji');
var Message = mongoose.model('Message');
var User = mongoose.model('User');

router.get('/:id', isAuth, (req, res, next) => {
  let isAdminOfThisChannel = false;
  let isCensoredInThisChannel = false;
  let isBannedFromThisChannel = false;

  let user = req.app.get('connectedUsers').find((obj) => {
    return obj.user == req.user.username;
  }); 
  let channel = req.app.get('connectedUsers').find((obj) => {
    return obj.channel_id == req.params.id;
  }); 

  if(!user){
    req.app.get('connectedUsers').push({user: req.user.username, user_id: req.user._id, channel_id: req.params.id});
  } else if (!channel) {
    let index = req.app.get('connectedUsers').indexOf(req.user.username);
    req.app.get('connectedUsers').splice(index, 1);
    req.app.get('connectedUsers').push({user: req.user.username, user_id: req.user._id, channel_id: req.params.id});
  }
  req.app.get('socketio').emit('new-user', req.user.username);
  console.log(req.app.get('connectedUsers'));

  User.findById(req.user._id, (err, item) => {
    let user = item;
    let isAdmin = user.isAdmin.find((obj) => {
      return obj.channel_id == req.params.id;
    })
    console.log(isAdmin);
    if(isAdmin) {
      isAdminOfThisChannel = true;
    }

    let isCensored = user.isCensored.channels.find((obj) => {
      return obj.channel_id == req.params.id;
    })
    if(isCensored) {
      isCensoredInThisChannel = true;
    }

    let isBanned = user.isBanned.channels.find((obj) => {
      return obj.channel_id == req.params.id;
    })
    if(isBanned) {
      res.redirect('/');
    } else {
      console.log(isAdminOfThisChannel);
      Message.find({channel : req.params.id}).sort({'date' : 'asc'}).populate('user').populate('channel').exec((err, items) => {
        res.render('chat/list', 
        { messages: items, 
          user_id: req.user._id, 
          channel_id : req.params.id, md: md, 
          connectedUsers: req.app.get('connectedUsers'), 
          emoji: nodeEmoji, 
          isAdminOfThisChannel: isAdminOfThisChannel,
          isSuperAdmin: req.user.isSuperAdmin,
          isCensoredInThisChannel: isCensoredInThisChannel
        });
      });
    }
  });
});

router.post('/:id/addMessage', isAuth, (req, res, next) => {
  var message = req.body;
  message.date = new Date();
  message.user = req.user;
  message.channel = req.params.id;
  message.isDeleted = false;
  message.isCensored = false;

  Message.create(message, (err, item) => {
    req.app.get('socketio').emit('new-message', message);
    res.redirect('/channel/' + req.params.id);
  });
});

router.post('/:id/addEmojiToMessage/:idMessage', isAuth, (req, res, next) => {
  let emoji = req.body.emojiForMessage;
  console.log('logging the emoji to add', emoji);
  Message.findByIdAndUpdate(req.params.idMessage, { "$push": { emoji: emoji } }, {new:true, upsert:true}, (err, messages) => {
    if(err){
      throw err;
    } else {
      res.redirect('/channel/'+ req.params.id);
    }
  });
});

router.get('/:id/delete/:idMessage', isAuth, (req, res, next) => {
  Message.findByIdAndRemove(req.params.idMessage, (err, item) => {
    if(err){
      return res.send("Error");
    }
    res.redirect('/channel/' + req.params.id);
  });
});

router.get('/:id/admin/delete/:idMessage', isAuth, (req, res, next) => {
  Message.findById(req.params.idMessage, (err, item) => {
    let message = item;
    message.isDeleted = true;
    Message.findByIdAndUpdate(req.params.idMessage, message, (err, item) => {
      if(err) {
        throw err;
      }
      res.redirect('/channel/' + req.params.id);
    })
  })
});

router.get('/:id/admin/censor/:idMessage', isAuth, (req, res, next) => {
  Message.findById(req.params.idMessage, (err, item) => {
    let message = item;
    message.isCensored = true;
    Message.findByIdAndUpdate(req.params.idMessage, message, (err, item) => {
      if(err) {
        throw err;
      }
      res.redirect('/channel/' + req.params.id);
    })
  })
});



module.exports = router;
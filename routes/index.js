var express = require('express');
var router = express.Router();
var isAuth = require('../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');

router.get('/', isAuth, (req, res, next) => {
  User.findById(req.user._id, (err, item) => {
    let user = item;
    let index = req.app.get('connectedUsers').indexOf(req.user.username);
    if(index) {
      req.app.get('connectedUsers').splice(index, 1);
    } 
    req.app.get('connectedUsers').push({user: req.user.username, user_id: req.user._id, channel_id: ""});
    Channel.find().sort({'date' : 'asc'}).populate('user').populate('channel').exec(function(err, items)
    {
      res.render('channel/list', { channels: items, actualUserId: req.user._id, userConnected: user});
    });
  })
  
});

router.get('/create', isAuth, (req, res, next) => {
  res.render('channel/create');
})

router.post('/create', isAuth, (req, res, next) => {
  let channel = new Channel();
  channel.name = req.body.channelName;
  channel.createdBy = req.user._id;
  Channel.create(channel, (err, item) => {
    let channel = item;
    if(err) {
      throw err;
    }
    User.findById(req.user._id, (err, item) => {
      let user = item;
      user.isAdmin.push({channel_id: channel._id});
      User.findByIdAndUpdate(req.user._id, user, (err, item) => {
        if(err) {
          throw err;
        }
      });
    })
    req.app.get('socketio').emit('new-channel', channel);
    res.redirect('/');
  })
});

router.get('/delete/:id', isAuth, (req, res, next) => {
  Channel.findById(req.params.id, (err, item) => {
    Channel.findByIdAndRemove(req.params.id, (err, item) => {
      if(err)
        return res.send("Error");
      
        res.redirect('/');
    });
  });
});

module.exports = router;

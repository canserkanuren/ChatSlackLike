var express = require('express');
var router = express.Router();
var isAuth = require('../tools/auth-tools').isAuth;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');

router.get('/', isAuth, (req, res, next) => {
  Channel.find().sort({'date' : 'asc'}).populate('user').populate('channel').exec(function(err, items)
  {
    res.render('channel/list', { channels: items });
  });
});

router.get('/create', isAuth, (req, res, next) => {
  res.render('channel/create');
})

router.post('/create', isAuth, (req, res, next) => {
  let channel = new Channel();
  console.log(req.body.channelName);
  channel.name = req.body.channelName;
  Channel.create(channel, (err, item) => {
    if(err) {
      throw err;
    }
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

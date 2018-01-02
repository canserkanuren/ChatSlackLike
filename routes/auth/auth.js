var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var passport = require('passport');
require('../../passport/local_login')(passport);
require('../../passport/local_signup')(passport);
require('../../passport/facebook')(passport);
require('../../passport/twitter')(passport);
require('../../passport/google')(passport);

router.get('/login', function(req, res) {
  res.render('auth/login');
});

router.get('/facebook', passport.authenticate('facebook', {
    scope : ['public_profile', 'email']
}));

router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect : '/auth/createUsername',
    failureRedirect : '/auth/login'
}));

router.get('/twitter/callback', passport.authenticate('twitter', {
    successRedirect : '/',
    failureRedirect : '/auth/login'
}));

router.get('/twitter', passport.authenticate('twitter', {
    scope : ['public_profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/auth/login'
}));

router.get('/google', passport.authenticate('google', {
    scope : ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

router.post('/login', passport.authenticate('login', {
    successRedirect : '/',
    failureRedirect :'/auth/login'
}));

router.get('/signup', function(req, res){
    res.render('auth/signup');
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect : '/',
    failureRedirect :'/auth/signup'
}));

router.get('/logout', function(req, res) {
    let index = req.app.get('connectedUsers').indexOf(req.user.username);
    req.app.get('connectedUsers').splice(index, 1);
    req.logout();
    res.redirect('/');
});

router.get('/createUsername', (req, res) => {
    User.findOne({'facebook.id' : req.user.facebook.id}, (err, user) => {
        if(user.username == ""){
            res.render('auth/createUsername', {user : req.user});
        } else {
            res.redirect('/');
        }
    });
});

router.post('/addUsername/:userId', (req, res) => {
    User.findOne({ 'facebook.id' :  req.params.userId}, function(err, user){
        if(err)
            return done(err);
        
            if(user) {
                user.username = req.body.content;
                user.save((err) => {
                    if(err){
                        throw err;
                    }

                    res.redirect("/");
                });
            } else {
                return res.send("No user was found.");
            }
    })
});

module.exports = router;
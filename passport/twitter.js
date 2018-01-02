var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/user');
var config = require('../config/auth');

module.exports =  function(passport) {
    passport.use('twitter', new TwitterStrategy({
        consumerKey : config.twitter.consumerKey,
        consumerSecret : config.twitter.consumerSecret,
        callbackURL : config.twitter.callback,
    },
    function(token, refreshToken, profile, done) {
        loginOrSignUp = function() {
            User.findOne({ 'twitter.id' : profile.id }, function(err, user){
                if(err)
                    return done(err);
                
                    if(user) {
                        return done(null, user);
                    } else {
                        var nUser = new User();
                        
                        nUser.twitter.id = profile.id;
                        nUser.twitter.token = token;
                        nUser.username = profile.username;
                        nUser.isAdmin = [];
                        nUser.isSuperAdmin = false;
                        nUser.isCensored.channels = [];
                        nUser.isBanned.channels = [];

                        nUser.save(function(err) {
                            if(err)
                                throw err;

                            return done(null, nUser);
                        })
                    }
            })
        }
        process.nextTick(loginOrSignUp);
    }))
}
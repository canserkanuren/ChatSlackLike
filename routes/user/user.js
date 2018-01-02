var express = require('express');
var router = express.Router();
var User = require('../../models/user');
var isAuth = require('../../tools/auth-tools').isAuth;

router.get('/:id/:idChannel', isAuth, (req, res, next) => {
    let isAdminOfThisChannel = false;
    User.findById(req.params.id, (err, item) => {
        if(err) {
            throw err;
        } else {
            let user = item;
            let isAdmin = user.isAdmin.find((obj) => {
                return obj.channel_id == req.params.idChannel;
            });
            console.log(isAdmin);
            if(isAdmin) {
                isAdminOfThisChannel = true;
            }
            console.log(isAdminOfThisChannel);
            res.render('user/show', {user: user, channel_id: req.params.idChannel, isAdminOfThisChannel: isAdminOfThisChannel});
        }
    })
});

router.post('/:id/admin/:idChannel', isAuth, (req, res, next) => {
    User.findById(req.params.id, (err, item) => {
        let user = item;
        let isAdminOfThisChannel = false;
        let inputIsAdmin = (req.body.inputIsAdmin) ? true : false;
        let admin = user.isAdmin.find((obj) => {
            return obj.channel_id == req.params.idChannel;
        });
        if(admin) {
            isAdminOfThisChannel = true;
        }
        console.log(isAdminOfThisChannel);
        console.log(req.body.inputIsAdmin);
        if(!isAdminOfThisChannel && inputIsAdmin) {
            console.log('cas 1');
            user.isAdmin.push({channel_id: req.params.idChannel});
        } else if(isAdminOfThisChannel && !inputIsAdmin) {
            console.log('we do nothing over here!')
        } else {
            console.log('cas 2');
            let index = user.isAdmin.indexOf(req.params.idChannel);
            user.isAdmin.splice(index, 1);
        }
        user.isSuperAdmin = req.body.inputIsSuperAdmin;

        user.save((err, item) => {
            if(err){
                throw err;
            }
        });

        res.redirect('/channel/' + req.params.idChannel);
    })
});

router.get('/:id/admin/censor/:idChannel', isAuth, (req, res, next) => {
    User.findById(req.params.id, (err, item) => {
        let user = item;
        user.isCensored.channels.push({channel_id: req.params.idChannel});
        User.findByIdAndUpdate(req.params.id, user, (err, items) => {
            if(err) {
                throw err;
            }
            res.redirect('/channel/' + req.params.idChannel);
        });
    })
});

router.get('/:id/admin/ban/:idChannel', isAuth, (req, res, next) => {
    User.findById(req.params.id, (err, item) => {
        let user = item;
        user.isBanned.channels.push({channel_id: req.params.idChannel});
        User.findByIdAndUpdate(req.params.id, user, (err, items) => {
            if(err) {
                throw err;
            }
            res.redirect('/');
        });
    });
});

module.exports = router;
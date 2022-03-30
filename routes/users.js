const mongoose = require('mongoose');
const router = require('express').Router();   
const User = require('../models/userModel');
const utils = require('../lib/utils');

// Validate an existing user and issue a JWT
router.post('/login', function(req, res, next){
    User.findOne({ username: req.body.username })
        .then((user) => {
            if(user){
                const isValid = utils.validatePassword(req.body.password, user.hash, user.salt);
            
                if (isValid) {

                    const tokenObject = utils.issueJWT(user);

                    res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });

                }
            }
            res.status(401).json({ success: false, msg: "Could not find matching username/password" });
        })
        .catch((err) => {
            next(err);
        });
});

// Register a new user
router.post('/register', function(req, res, next){
    const saltHash = utils.genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt
    });

    try {
    
        newUser.save()
            .then((user) => {
                res.json({ success: true, user: { username: user.username }});
            });

    } catch (err) {
        
        res.json({ success: false, msg: err });
    
    }

});

module.exports = router;
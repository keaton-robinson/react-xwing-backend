const router = require('express').Router();   
const User = require('../models/userModel');
const utils = require('../lib/utils');
const {body, validationResult} = require('express-validator');

// Validate an existing user and issue a JWT
router.post('/login', function(req, res, next){
	User.findOne({ username: req.body.username })
		.then((user) => {
			if(user){
				const isValid = utils.validatePassword(req.body.password, user.hash, user.salt);
				if (isValid) {
					const tokenObject = utils.issueJWT(user);
					return res.status(200).json({ success: true, user: { username: req.body.username, token: tokenObject.token, expiresIn: tokenObject.expires }});
				}
			}
			res.status(401).json({ success: false, message: 'Could not find matching username/password' });
		})
		.catch((err) => {
			next(err);
		});
});

const registrationValidationChecks = [
	body('username')
		.exists().withMessage('Username is required')
		.isLength({ min: 6, max: 30}).withMessage('Username must be 6 to 30 characters')
		.trim()
		.escape(),
	body('password')
		.exists().withMessage('Password is required')
		.isLength({min: 6, max: 50}).withMessage('Password must be 6 to 50 characters')
];

// Register a new user
router.post('/register', registrationValidationChecks, function(req, res, next){    
	
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return next({ statusCode: 400, message: errors.errors[0].msg });
	}

	const saltHash = utils.genPassword(req.body.password);

	const salt = saltHash.salt;
	const hash = saltHash.hash;

	
	const newUser = new User({
		username: req.body.username,
		hash: hash,
		salt: salt
	});

	newUser.save()
		.then((user) => {
			res.json({ success: true, user: { username: user.username }});
		})
		.catch((err) => {
			next(err);
		});
});

module.exports = router;
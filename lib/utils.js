const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");

// eslint-disable-next-line no-undef
const PRIV_KEY = process.env.PRIVATE_KEY; 
// eslint-disable-next-line no-undef
const PUB_KEY = process.env.PUBLIC_KEY;

if(!PRIV_KEY){
	throw new Error("Could not find encryption private key. Authentication will not work.");
}

if(!PUB_KEY){
	throw new Error("Could not find encryption public key. Authentication will not work.");
}

function validatePassword(password, hash, salt) {
	var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
	return hash === hashVerify;
}

function genPassword(password) {
	var salt = crypto.randomBytes(32).toString("hex");
	var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    
	return {
		salt: salt,
		hash: genHash
	};
}

function issueJWT(user) {
	const _id = user._id;

	const expiresInTime = "1d";

	const payload = {
		sub: _id,
		iat: Math.floor(Date.now()/1000)
	};

	const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresInTime, algorithm: "RS256" });

	return {
		token: "Bearer " + signedToken,
		expires: expiresInTime
	};
}

function loginRequired(req, res, next) {
	if(req.headers.authorization) {
		const tokenParts = req.headers.authorization.split(" ");
		if (tokenParts[0] === "Bearer" && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
			try {
				const verification = jsonwebtoken.verify(tokenParts[1], PUB_KEY, { algorithms: ["RS256"], maxAge: "5d" });
				req.jwt = verification;
				return next();
			} catch(err) {
				return res.status(401).json({ success: false, message: "You are not authorized to perform this operation" });
			}
		} 
	}
	res.status(401).json({ success: false, message: "You are not authorized to perform this operation" });
}

module.exports.validatePassword = validatePassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.loginRequired = loginRequired;
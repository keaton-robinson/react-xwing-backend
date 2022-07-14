const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		minLength: [6, "Username must be 6 characters or more"],
		maxLength: [30, "Username must be 30 characters or less"],
		unique: true
	},
	hash: {
		type: String, 
		required: true
	},
	salt: {
		type: String,
		required: true
	}
});

UserSchema.path("username").validate(async (value) => {
	const usernameCount = await mongoose.models.User.countDocuments({username: value });
	return !usernameCount;
}, "Username already exists");

module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");

const squadSchema = new mongoose.Schema({
	userId: {
		required: true,
		type: mongoose.Schema.Types.ObjectId
	},
	faction: {
		required: true,
		type: String
	},
	name: {
		required: true,
		type: String,
	},
	points: {
		required: true,
		type: Number
	},
	dateSaved: {
		required: true,
		type: Date
	},
	pilots: {
		required: true,
		type: Array
	}
});

module.exports = mongoose.model("Squad", squadSchema);
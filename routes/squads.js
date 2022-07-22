const express = require("express");
const utils = require("../lib/utils");
const loginRequired = utils.loginRequired;
const Squad = require("../models/squadModel");

const router = express.Router();

router.use(loginRequired);

//Post Method a new squad and assign it to the authenticated user
router.post("/", async (req, res, next) => {
	const data = new Squad({
		userId: req.jwt.sub,
		faction: req.body.faction,
		name: req.body.name,
		points: req.body.points, //silly to have the front end send the points value...wouldn"t do this in a real application
		dateSaved: new Date(),
		pilots: req.body.pilots
	});

	try {
		const savedData = await data.save();
		res.status(200).json({success: true, savedSquad: savedData});
	} catch(error){
		next(error);
	}
});

//Get all squads from specified faction belonging to authenticated user
router.get("/:faction", async (req, res, next) => {
	try{
		const foundSquads = await Squad.find({faction: req.params.faction, userId: req.jwt.sub });
		res.status(200).json({success: true, squads: foundSquads});
	}
	catch(error){
		next(error);
	}
});

//Get squad by id belonging to authenticated user
router.get("/:id", async (req, res, next) => {
	try {
		const foundSquad = await Squad.findOne({_id: req.params.id, userId: req.jwt.sub});
		res.json({success: true, squad: foundSquad});
	}
	catch(error){
		next(error);
	}
});


//Update squad by id that belongs to authenticated user
router.patch("/:id", async (req, res, next) => {
	try {
		const id = req.params.id;
		const userId = req.jwt.sub;
		const updatedData = req.body;
		const options = { new: true };
		const savedData = await Squad.findOneAndUpdate({ _id: id, userId: userId }, updatedData, options);
		res.status(200).json({success:true, savedSquad: savedData});
	}
	catch (error) {
		next(error);
	}
});

// Delete squad by id that belongs to authenticated user
router.delete("/:id", async (req, res,next) => {
	try {
		const id = req.params.id;
		const userId = req.jwt.sub;
		const data = await Squad.findOneAndDelete({_id: id, userId: userId});
		res.json({ success: true, message: `${data.name} has been deleted...`});
	}
	catch (error) {
		next(error);
	}
});

module.exports = router;
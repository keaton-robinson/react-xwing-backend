const express = require('express');
const utils = require('../lib/utils');
const authMiddleware = utils.authMiddleware;
const Squad = require('../models/squadModel');

const router = express.Router()

router.use(authMiddleware);

//Post Method
// todo: figure out a better way to get userid 
router.post('/', async (req, res) => {
    const data = new Squad({
        userId: req.verification.sub,
        faction: req.body.faction,
        name: req.body.name,
        points: req.body.points, //silly to have the front end send the points value...wouldn't do this in a real application
        dateSaved: new Date(),
        pilots: req.body.pilots
    });

    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave);
    } catch(error){
        res.status(400).json({message: error.message});
    }
})

//Get all Method
// todo: should only get all squads for authenticated user and chosen faction
router.get('/:faction', async (req, res) => {
    try{
        const data = await Squad.find({faction: req.params.faction, userId: req.jwt.sub });
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get by ID Method
// todo: should only be able to show a squad for the authenticated user
router.get('/:id', async (req, res) => {
    try {
        const data = await Squad.findOne({_id: req.params.id, userId: req.jwt.sub})  ;
        res.json(data);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})


//Update by ID Method
// todo: should only allow updating a squad that belongs to authenticated user
router.patch('/:id', async (req, res) => {
    
    
    // const data = new Squad({
    //     name: req.body.name,
    //     points: req.body.points, //silly to have the front end send the points value...wouldn't do this in a real application
    //     dateSaved: new Date(),
    //     pilots: req.body.pilots
    // });
    
    try {
        const id = req.params.id;
        const userId = req.jwt.sub;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Squad.findOneAndUpdate(
            { _id: id, userId: userId }, updatedData, options
        )

        res.status(200).json(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Delete by ID Method
// todo: should only allow deleting a squad that belongs to authenticated user
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.jwt.sub;
        const data = await Squad.findOneAndDelete({id: id, userId: userId});
        res.json({ message: `${data.name} has been deleted...`})
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;
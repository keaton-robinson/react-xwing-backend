const express = require('express');
const Squad = require('../models/squadModel');

const router = express.Router()

//Post Method
// todo: figure out a better way to get userid 
router.post('/squads', async (req, res) => {
    const data = new Squad({
        userId: 1,
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
router.get('/squads/:faction', async (req, res) => {
    try{
        const data = await Squad.find({"faction": req.params.faction});
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get by ID Method
// todo: should only be able to show a squad for the authenticated user
router.get('/squads/:id', async (req, res) => {
    try {
        const data = await Squad.findById(req.params.id);
        res.json(data);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})


//Update by ID Method
// todo: should only allow updating a squad that belongs to authenticated user
router.patch('/squads/:id', async (req, res) => {
    
    
    // const data = new Squad({
    //     name: req.body.name,
    //     points: req.body.points, //silly to have the front end send the points value...wouldn't do this in a real application
    //     dateSaved: new Date(),
    //     pilots: req.body.pilots
    // });
    
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Squad.findByIdAndUpdate(
            id, updatedData, options
        )

        res.status(200).json(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Delete by ID Method
// todo: should only allow deleting a squad that belongs to authenticated user
router.delete('/squads/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Squad.findByIdAndDelete(id)
        res.json({ message: `${data.name} has been deleted...`})
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;
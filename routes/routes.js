const express = require('express');
const Squad = require('../models/squadModel');

const router = express.Router()

//Post Method
// todo: figure out a better way to get userid 
router.post('/squads', async (req, res) => {
    const data = new Squad({
        userId: req.body.userId,
        faction: req.body.faction,
        name: req.body.name, 
        date_saved: new Date(),
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
router.get('/squads', async (req, res) => {
    try{
        const data = await Squad.find();
        res.json(data)
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
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await Squad.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Delete by ID Method
// todo: should only allow deleting a squad that belongs to authenticated user
router.delete('/squads/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Squad.findByIdAndDelete(id)
        res.send(`Document with ${data.name} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

module.exports = router;
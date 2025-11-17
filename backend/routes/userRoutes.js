const express = require('express');
const User = require('../models/user');
const router = express.Router();

//Get all users
router.get('/', async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});
//Get users by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});
//Create new user
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and Email are required" });
    const newUser = await User.create({ name, email });
    res.status(201).json(newUser);
});
//Update user by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { name, email } },
        { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
});
//Delete user by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
});

module.exports = router;
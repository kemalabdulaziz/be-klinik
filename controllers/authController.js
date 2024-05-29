const { validationResult } = require('express-validator');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
        const user = await User.findUserByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await User.createUser(email, password, role);
        const token = generateToken(newUser.insertId, role);

        res.status(201).json({ token, role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findUserByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user.id, user.role);
            res.json({ token, role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};

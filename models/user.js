const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (email, password, role) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role]
    );
    return result;
};

const findUserByEmail = async (email) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

module.exports = {
    createUser,
    findUserByEmail
};

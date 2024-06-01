const { validationResult } = require("express-validator");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const registerUser = async (req, res) => {
  const { id_user, name, email, /*gender*/ phone, spesialist, password, confirm_password, experience, address, role } = req.body;
  const defaultRole = "patient";
  const gender = "male"; //sementara

  if (!name || !phone || !email || /*gender||*/ !password || !confirm_password) {
    return res.status(400).json({ error: "Semua kolom harus diisi" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Password dan Konfirmasi Password tidak sesuai" });
  }

  const userRole = role || defaultRole;

  const hashedPassword = bcrypt.hashSync(password, 8);
  const query = "INSERT INTO auth (id_user, name, gender, email, role, phone, spesialist, password, experience, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await db.query(query, [id_user, name, gender, email, userRole, phone, spesialist, hashedPassword, experience, address]);
    console.log("Pengguna berhasil ditambahkan");
    res.status(201).json({ message: "Pengguna berhasil ditambahkan" });
  } catch (err) {
    console.error("Gagal menambahkan pengguna:", err);
    res.status(500).json({ error: "Kesalahan Internal Server" });
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
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};

const db = require("../config/db");
const bcrypt = require("bcryptjs");

//Create
const createDokter = async (req, res) => {
  const { str, nama, gender, email, noHP, spesialist, password, confirm_password, pengalaman } = req.body;

  if (!nama || !gender || !email || !noHP || !password || !confirm_password) {
    return res.status(400).json({ error: "Semua kolom harus diisi" });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Password dan Konfirmasi Password tidak sesuai" });
  }

  let hashedPassword;
  try {
    hashedPassword = bcrypt.hashSync(password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    return res.status(500).json({ error: "Kesalahan Internal Server" });
  }

  const query = `INSERT INTO dokter (str, nama, gender, email, noHP, spesialist, password, pengalaman) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(query, [str, nama, gender, email, noHP, spesialist, hashedPassword, pengalaman]);
    res.status(201).json({ message: "Dokter berhasil dibuat" });
  } catch (err) {
    console.error("Error creating dokter:", err);
    res.status(500).json({ error: "Kesalahan Internal Server" });
  }
};

// Read
const getDokter = async (req, res) => {
  const query = "SELECT nama,spesialist,str FROM dokter";
  try {
    const [results] = await db.query(query);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error reading dokter:", err);
    res.status(500).json({ error: "Kesalahan Internal Server" });
  }
};

// Update
const updateDokter = async (req, res) => {
  const { id } = req.params;
  const { str, nama, gender, email, noHP, spesialist, password, konfirmasiPassword, pengalaman } = req.body;

  // Jika password dan konfirmasi password tidak sesuai, kembalikan respons 400
  if (password !== konfirmasiPassword) {
    return res.status(400).json({ error: "Password dan Konfirmasi Password tidak sesuai" });
  }

  // Jika password tidak ada, hapus password dari data yang akan diupdate
  if (!password) {
    delete req.body.password;
  }

  // Jika tidak ada data yang ingin diubah, kembalikan respons 400
  if (!str && !nama && !gender && !email && !noHP && !spesialist && !pengalaman && !password) {
    return res.status(400).json({ error: "Tidak ada data yang ingin diperbarui" });
  }

  // Jika password tidak disertakan dan ada konfirmasiPassword, kembalikan respons 400
  if (!password && konfirmasiPassword) {
    return res.status(400).json({ error: "Konfirmasi Password tidak diperlukan jika tidak ada perubahan password" });
  }

  // Jika password disertakan dan tidak ada konfirmasiPassword, kembalikan respons 400
  if (password && !konfirmasiPassword) {
    return res.status(400).json({ error: "Konfirmasi Password diperlukan untuk perubahan password" });
  }

  // Hash password jika ada
  let hashedPassword;
  if (password) {
    try {
      hashedPassword = bcrypt.hashSync(password, 10);
    } catch (error) {
      console.error("Error hashing password:", error);
      return res.status(500).json({ error: "Kesalahan Internal Server" });
    }
  }

  // Persiapkan kueri dan nilai yang akan diupdate
  const values = [];
  const fields = [];

  if (str) {
    values.push(str);
    fields.push("str=?");
  }
  if (nama) {
    values.push(nama);
    fields.push("nama=?");
  }
  if (gender) {
    values.push(gender);
    fields.push("gender=?");
  }
  if (email) {
    values.push(email);
    fields.push("email=?");
  }
  if (noHP) {
    values.push(noHP);
    fields.push("noHP=?");
  }
  if (spesialist) {
    values.push(spesialist);
    fields.push("spesialist=?");
  }
  if (hashedPassword) {
    values.push(hashedPassword);
    fields.push("password=?");
  }
  if (pengalaman) {
    values.push(pengalaman);
    fields.push("pengalaman=?");
  }

  // Eksekusi kueri untuk melakukan update
  values.push(id);
  const query = `
    UPDATE dokter 
    SET ${fields.join(", ")}
    WHERE id_dokter=?
  `;

  try {
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Dokter tidak ditemukan" });
    }

    res.status(200).json({ message: "Dokter berhasil diperbarui" });
  } catch (err) {
    console.error("Error updating dokter:", err);
    res.status(500).json({ error: "Kesalahan Internal Server" });
  }
};

module.exports = {
  createDokter,
  getDokter,
  updateDokter,
};

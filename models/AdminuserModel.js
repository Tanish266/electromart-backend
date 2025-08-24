const db = require("../config/db");

const AdminUserModel = {
  getAllAdminUsers: () => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, phone, address, gender, birthDate FROM adminusers",
        (err, results) =>
          err ? reject(new Error("Database query error")) : resolve(results)
      );
    });
  },

  getAdminUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM adminusers WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [email],
        (err, results) =>
          err
            ? reject(new Error("Database query error"))
            : resolve(results[0] || null)
      );
    });
  },

  getAdminUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, phone, address, gender, birthDate FROM adminusers WHERE id = ? LIMIT 1",
        [id],
        (err, results) =>
          err
            ? reject(new Error("Database query error"))
            : resolve(results[0] || null)
      );
    });
  },

  createAdminUser: (
    name,
    email,
    hashedPassword,
    phone,
    address,
    gender,
    birthDate
  ) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO adminusers (name, email, password, phone, address, gender, birthDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phone, address, gender, birthDate],
        (err, result) =>
          err ? reject(new Error("Database insertion error")) : resolve(result)
      );
    });
  },
};

module.exports = AdminUserModel;

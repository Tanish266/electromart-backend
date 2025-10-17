const db = require("../config/db");

const UserModel = {
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, phone, address, gender, birthDate FROM users",
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
        [email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length ? results[0] : null);
        }
      );
    });
  },

  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, phone, address, gender, birthDate FROM users WHERE id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length ? results[0] : null);
        }
      );
    });
  },

  createUser: (
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
        "INSERT INTO users (name, email, password, phone, address, gender, birthDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, email, hashedPassword, phone, address, gender, birthDate],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  updateUser: (id, updates) => {
    return new Promise((resolve, reject) => {
      let query = "UPDATE users SET ";
      let values = [];
      let setClauses = [];

      for (const key in updates) {
        if (updates[key] !== undefined && key !== "id") {
          setClauses.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }

      if (setClauses.length === 0) {
        return reject(new Error("No fields to update"));
      }

      query += setClauses.join(", ") + " WHERE id = ?";
      values.push(id);

      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
};

module.exports = UserModel;

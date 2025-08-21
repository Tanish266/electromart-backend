const db = require("../config/db");

const AddressModel = {
  getAddressesByUserId: (id, callback) => {
    db.query(
      "SELECT id, fullname, mobilenumber, country, pincode, addressLine1, area, landmark, city, state FROM saveaddresses WHERE user_id = ?",
      [id],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return callback(err, null);
        }
        return callback(null, results.length > 0 ? results : []);
      }
    );
  },

  addAddress: (
    user_id,
    fullname,
    mobilenumber,
    country,
    pincode,
    addressLine1,
    area,
    landmark,
    city,
    state,
    callback
  ) => {
    db.query(
      `INSERT INTO saveaddresses (user_id, fullname, mobilenumber, country, pincode, addressLine1, area, landmark, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        fullname,
        mobilenumber,
        country,
        pincode,
        addressLine1,
        area,
        landmark,
        city,
        state,
      ],
      (err, result) => {
        if (err) {
          console.error("Error adding address:", err);
          return callback(err, null);
        }
        return callback(null, result);
      }
    );
  },

  deleteAddress: (id, callback) => {
    db.query("DELETE FROM saveaddresses WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting address:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },
};

module.exports = AddressModel;

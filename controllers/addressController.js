const AddressModel = require("../models/addressModel");

exports.getAddressesByUserId = async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  AddressModel.getAddressesByUserId(userId, (err, addresses) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (!addresses) {
      return res
        .status(404)
        .json({ error: "No addresses found for this user" });
    }

    res.json(addresses);
  });
};

exports.addAddress = async (req, res) => {
  console.log("Incoming request data:", req.body);

  const {
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
  } = req.body;

  if (
    !user_id ||
    !fullname ||
    !mobilenumber ||
    !country ||
    !pincode ||
    !addressLine1 ||
    !area ||
    !landmark ||
    !city ||
    !state
  ) {
    console.log("Validation failed: Missing fields");
    return res.status(400).json({ message: "All fields are required" });
  }
  console.log("Adding Address in database...");
  AddressModel.addAddress(
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
    (err, result) => {
      if (err) {
        console.error("Error adding address:", err);
        return res.status(500).json({ error: "Error adding address" });
      }
      console.log("Address added successfully:", result);
      res.status(201).json({
        message: "Address added successfully",
        addressId: result.insertId,
      });
    }
  );
};

exports.deleteAddress = (req, res) => {
  const addressId = req.params.id;
  console.log("Received delete request for ID:", addressId); // Debugging

  if (!addressId) {
    return res.status(400).json({ error: "Address ID is required" });
  }

  AddressModel.deleteAddress(addressId, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      console.log("No address found with ID:", addressId);
      return res.status(404).json({ error: "Address not found" });
    }

    console.log("Address deleted successfully:", addressId);
    res.json({ message: "Address deleted successfully" });
  });
};

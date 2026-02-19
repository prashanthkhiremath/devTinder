const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namasteNode:Pr%40049620290619@cluster0.y8w7m60.mongodb.net/devTinder",
  );
};

module.exports = connectDB;

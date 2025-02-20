const mongoose = require("mongoose");

// Lecture Schema
const lectureSchema = new mongoose.Schema({
  lectureNumber: { type: String, required: true },
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  pdfUrls: [{ type: String }],
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  moduleNumber: { type: String, required: true },
  title: { type: String, required: true },
  lectures: [lectureSchema],
});

// Course Schema
const courseSchema = new mongoose.Schema({
  thumbnail: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  modules: [moduleSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);

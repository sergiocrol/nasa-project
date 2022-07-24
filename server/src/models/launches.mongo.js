const mongoose = require("mongoose");

// We create a schema of the data that user needs to provide
const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    target: String,
  },
  customers: {
    target: [String],
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    dafault: true,
  },
});

// We map the schema to our collection. The first arg is the name of the model (IMPORTANT: it will be always the
// name of our object in singular, because MongoDB is gonna convert it to plural and lowercase it)
// so here we connect launchesSchema with "launches" collection.
module.exports = mongoose.model("Launch", launchesSchema);

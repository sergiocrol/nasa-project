const mongoose = require("mongoose");

require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

// This "on" is an "eventEmitter" that notifies us every time an action happens in our app
// Or "once in the case of "open" event, since we know it will only be triggered once".
// We can specify different accions to which MongoDB is gonna to react: open, error, close.
mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready");
});

// This can be placed everywhere in our file.
mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  try {
    await mongoose.connect(MONGO_URL);
  } catch (err) {
    console.log(err);
  }
}

async function mongoDisconnect() {
  try {
    await mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};

// This is an alternative to the most common way of setting up a server
// The benefit of this way is that we can organize the code better, separating our server code
// from the code related to Express
// Also, using http built-in module, allows us to respond not only to http requests, but also
// to other kind of requests (web-sockets, for example, for real-time communication).

// This would be the usual way to init our express server:
// const express = require("express");
// const app = express();
// app.listen();

const http = require("http");
const mongoose = require("mongoose");

const app = require("./app");

const { loadPlanetsData } = require("./models/planets.model");

const PORT = process.env.PORT || 8000;

const MONGO_URL =
  "mongodb+srv://nasa-api:mrxRjjR7TKgLlUD8@cluster0.4t1vttg.mongodb.net/nasa?retryWrites=true&w=majority";

const server = http.createServer(app);

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

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();

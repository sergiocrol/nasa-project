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

const app = require("./app");

const { mongoConnect } = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();

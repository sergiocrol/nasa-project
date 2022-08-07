const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const api = require("./routes/api");

const app = express();

// This middleware will be able to let us handle CORS that our server will allow
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
// This middleware is used for provide a logging system
app.use(morgan("combined"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// We've extracted out our routes to the api file, so we can version it.
// For that we import into api contant, and we use it through a middleware, where
// firt parameter would be '/v1', that is gonna prepend all the routes from our api.
app.use("/v1", api);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;

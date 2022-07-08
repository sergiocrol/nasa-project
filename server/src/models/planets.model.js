const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");

const habitablePlanets = [];

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  // read our file as Stream (line by line using Node's Event Emitter)
  // the .on(data, callback) is gonna call the callback with every line readed
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      // we povide to the pipe a readable stream (kepler_data.csv) that is passed as argument to parse
      // function. This parese func returns a readable parsed content that can be readed line by line .on()
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", (data) => {
        // We can use this received data (a line) as we want
        // This is gonna be saved as Buffers, that are collections of bytes. But we above's parse
        // function we have convert them into a readable content
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        // we can also chain different functions to capture differents events, like error or end
        console.log(err);
        reject();
      })
      .on("end", () => {
        console.log(`${habitablePlanets.length} habitable planets found!`);
        resolve();
      });
  });
}

function getAllPlanets() {
  return habitablePlanets;
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

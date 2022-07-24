const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

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
      .on("data", async (data) => {
        // We can use this received data (a line) as we want
        // This is gonna be saved as Buffers, that are collections of bytes. But we above's parse
        // function we have convert them into a readable content
        if (isHabitablePlanet(data)) {
          // insert + update = upsert -> If we just save the planets in our DB here, we'll duplicate
          // the content in the DB, since this loadPlanetsData function is called everytime the server
          // is started. That's why Mongoose give us this UPSERT feature, which is basically an insert
          // but only if the document doesn't already exist
          // await planets.create({
          //   keplerName: data.kepler_name,
          // });

          // With updateOne, we pass as thee first argument what we want to find, in this case we want to find planets
          // with certain name. In the second argument we pass with what we want to update the first document that matches
          // with the first search query. The third arg is Upsert, which one we say only update if the planet already does not exist
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        // we can also chain different functions to capture differents events, like error or end
        console.log(err);
        reject();
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  // if we pass an empty object, it means we want to get all documents of our collection
  // otherwise, we could filter by passing different properties of the object (keplerName, etc.)
  return await planets.find({}, { __v: 0, __id: 0 });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save the planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

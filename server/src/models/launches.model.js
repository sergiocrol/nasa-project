const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

async function getAllLaunches() {
  return await launchesDatabase.find({}, { __id: 0, __v: 0 });
}

// This saveLaunch function will follow the upsert approach. The document will be inserted only
// if it does not exists (the inserted document will be determined by the second argument). If it already
// exists, then we will update it.
async function saveLaunch(launch) {
  // In order to achieve referential integrity, we'd like to check first if the target planet of our new launch exists
  // to do that we can import our mongoose's planet model and findOne with the name of the launch target.
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  // If this planet does not exist we throw an error through the built-in error module of Nodejs
  // Be aware that we are not in the controller layer, where we send back the errors through res object
  if (!planet) {
    throw new Error("No matching planet found");
  }
  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  launches.set(
    latestFlightNumber,
    Object.assign(launch, {
      success: true,
      upcoming: true,
      customers: ["Zero To Mastery", "NASA"],
      flightNumber: latestFlightNumber,
    })
  );
}

function abortLaunchById(launchId) {
  const aborted = launches.get(launchId);
  aborted.upcoming = false;
  aborted.success = false;
  return aborted;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  abortLaunchById,
};

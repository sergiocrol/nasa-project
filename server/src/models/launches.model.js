const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: DEFAULT_FLIGHT_NUMBER,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

saveLaunch(launch);

async function existsLaunchWithId(launchId) {
  return await launchesDatabase.findOne({ flightNumber: launchId });
}

async function getAllLaunches() {
  return await launchesDatabase.find({}, { __id: 0, __v: 0 });
}

async function getLatestFlightNumber() {
  // We need to get the last flight number, with sort('flightNumber') function we order the flight numbers,
  // by default, in ascending, and with findOne() we take the first of them. But since we want the last flight
  // number, we're gonna sort them in DESCENDING order, which can be donne attaching minus symbol to the property name.
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
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
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Zero to Mastery", "NASA"],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  // With updateOne we find for a flight and update it through the second argument object.
  // We don't use upsert parameter in this case, because we don't want to create an object if it
  // doesn't exist. s
  const aborted = await launchesDatabase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};

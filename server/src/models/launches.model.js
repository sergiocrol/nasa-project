const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

// We create a function to get data from an external API (SpaceX API in this case)
// This is gonna be used to upload all launches made by SpaceX into our MongoDB
// as the same way we've done with launches provided by a local JSON file.
async function populateLaunches() {
  console.log("Downloading launches data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    // payloads is an array of payloads, and payload["customers"] is an array of customers for that payload
    // We use flatMap to get an unique array from one array of arrays
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });

    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };

    saveLaunch(launch);
  }
}

// In order to ONLY call to the API to get all the launches ONCE (since it is an expensive call because
// of the amount of data)
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("Launch data already loaded");
    return;
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { __id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
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
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    { upsert: true }
  );
}

async function scheduleNewLaunch(launch) {
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
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};

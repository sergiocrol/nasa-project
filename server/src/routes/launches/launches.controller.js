const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model");

function httpGetAllLaunches(req, res) {
  // Launches is a map, so we need to convert in something that the response can recognize, like an array
  return res.status(200).json(getAllLaunches());
}

function httpAddNewLaunch(req, res) {
  // Since we are using express.json middleware, requests body is going to be populated with the
  // info we pass already parsed
  const launch = req.body;

  // If one of the mandatory fields have not been passed.

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  // We check if launchDate is valid. In this case, if we pass a date as argument, even if we are not
  // seeing it, the function date.valueOf() is being runned. This function always returns a number if we have a valid
  // date, so if the date is valid, isNaN function is always false, and only if it is true we can say that it is not a valid date
  // Another way of validate dates is ---> launch.launchDate.toString() === "Invalid Date" <-- if the date is not a date, we couldn't
  // convert it into a string, so the returned string by js would be "Invalid Date".
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  addNewLaunch(launch);
  // It is a good practice to return in the response the created object
  // Also explicit the return
  return res.status(201).json(launch);
}

function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  // If launch does not exist
  if (!existsLaunchWithId(launchId)) {
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  const aborted = abortLaunchById(launchId);
  return res.status(200).json(aborted);
}
~
module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};

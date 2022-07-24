const { getAllPlanets } = require("../../models/planets.model");

async function httpGetAllPlanets(req, res) {
  // This return is not used by Express, the only reason we use it, is to avoid to
  // send more than one response (this will throw an error of headers). In this way, the code is going
  // to stop running once the response is returned
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets,
};

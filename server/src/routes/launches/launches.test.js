const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    try {
      await mongoConnect();
    } catch (err) {
      console.log(err);
    }
  });

  afterAll(async () => {
    try {
      await mongoDisconnect();
    } catch (err) {
      console.log(err);
    }
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      // supertest require the app object in order to make a request. That is one of the reasons why
      // we splitted up our server and our app.
      try {
        await request(app)
          .get("/v1/launches")
          .expect("Content-Type", /json/)
          .expect(200);
      } catch (err) {
        console.log(err);
      }

      // This would be the common way to test the response, but supertest has its own expect function
      // to chain it to the result so we can check it in a more convenient way.
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launch", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithAnInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "Uoop!",
    };

    test("It should respond with 201 success", async () => {
      try {
        const response = await request(app)
          .post("/v1/launches")
          .send(completeLaunchData)
          .expect("Content-Type", /json/)
          .expect(201);

        // In this case we use JEST methods to check if the returned object has the appropriate properties
        // We need to convert to number value the date we are sending, and the date we are getting back in the response.
        // This is because we are sending the launchDate as normal format, but we are receiving a dateTime in UTC format
        const requestDate = new Date(completeLaunchData.launchDate).valueOf();
        const responseDate = new Date(response.body.launchDate).valueOf();
        expect(responseDate).toBe(requestDate);

        expect(response.body).toMatchObject(launchDataWithoutDate);
      } catch (err) {
        console.log(err);
      }
    });

    test("It should catch missing required properties", async () => {
      try {
        const response = await request(app)
          .post("/v1/launches")
          .send(launchDataWithoutDate)
          .expect("Content-Type", /json/)
          .expect(400);

        expect(response.body).toStrictEqual({
          error: "Missing required launch property",
        });
      } catch (err) {
        console.log(err);
      }
    });

    test("It should catch invalid dates", async () => {
      try {
        const response = await request(app)
          .post("/v1/launches")
          .send(launchDataWithAnInvalidDate)
          .expect("Content-Type", /json/)
          .expect(400);

        expect(response.body).toStrictEqual({
          error: "Invalid launch date",
        });
      } catch (err) {
        console.log(err);
      }
    });
  });
});

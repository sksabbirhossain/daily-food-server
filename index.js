const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// database connection
const url = "mongodb://localhost:27017";
const clint = new MongoClient(url);
async function dbConnect() {
  try {
    await clint.connect();
    console.log("Database connection successfull");
  } catch (error) {
    console.log("something worng!!!");
  }
}
dbConnect();

// create collections
const services = clint.db("dailyFood").collection("services");
const reviews = clint.db("dailyFood").collection("reviews");

// route handle
app.get("/api/services", async (req, res) => {
  try {
    const query = {};
    const serviceData = services.find(query);
    const data = services.find(query).limit(3);
    const allServices = await serviceData.toArray();
    const homeData = await data.toArray();
    console.log(allServices);
    res.send({
      success: true,
      data: allServices,
      homeData: homeData,
    });
  } catch (err) {
    console.log(err, err.message);
    res.send({
      success: false,
      err: err.message,
    });
  }
});

//get service details
app.get("/api/service/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const details = await services.findOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      data: details,
    });
  } catch {
    res.send({
      success: false,
      message: "something went worng!",
    });
  }
});

// add services
app.post("/api/add-service", async (req, res) => {
  try {
    const createService = await services.insertOne(req.body);
    if (createService.acknowledged) {
      res.send({
        success: true,
        data: createService,
      });
    } else {
      res.send({
        success: false,
        err: "something worng try again",
      });
    }
  } catch (err) {
    console.log(err, err.message);
    res.send({
      success: false,
      err: err.message,
    });
  }
});

// add review
app.post("/api/add-review", async (req, res) => {
  try {
    const createReviews = await reviews.insertOne(req.body);
    if (createReviews.acknowledged) {
      res.send({
        success: true,
        data: createReviews,
      });
    } else {
      res.send({
        success: false,
        err: "something worng try again",
      });
    }
  } catch (err) {
    console.log(err, err.message);
    res.send({
      success: false,
      err: err.message,
    });
  }
});

// get review for service
app.get("/api/reviews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const review = await reviews.find({ service_id: id });
    const allReviews = await review.toArray();
    res.send({
      success: true,
      data: allReviews,
    });
  } catch {
    res.send({
      success: false,
      message: "something went worng!",
    });
  }
});

// get suer all reviews
app.get("/api/my-reviews/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const review = await reviews.find({ user_id: id });
    const allReviews = await review.toArray();
    res.send({
      success: true,
      data: allReviews,
    });
  } catch {
    res.send({
      success: false,
      message: "something went worng!",
    });
  }
});

// get review for update
app.get("/api/my-review/update/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const updateReview = await reviews.findOne({ _id: ObjectId(id) });
    res.send({
      success: true,
      data: updateReview,
    });
  } catch {
    res.send({
      success: false,
      message: "something went worng!",
    });
  }
});

// listening the server
app.listen("5000", () => {
  console.log("listen server on 5000 port");
});

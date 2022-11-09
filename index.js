const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());

// verifyfwt token
function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({
      message: "unauthorized access",
    });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({
        message: "unauthorized access",
      });
    }
    req.decoded = decoded;
    next();
  });
}

// database connection
const url = `mongodb+srv://${process.env.MONGODB_USER_NAME}:${process.env.MONGODB_PASSWORD}@cluster0.mkg7q0j.mongodb.net/?retryWrites=true&w=majority`;
const clint = new MongoClient(url);

async function dbConnect() {
  try {
    await clint.connect();
    console.log("Database connection successfull");
  } catch (error) {
    console.log("something worng!!!");
  }
}
dbConnect().catch(err=> console.log(err));

// create collections
const services = clint.db("dailyFood").collection("services");
const reviews = clint.db("dailyFood").collection("reviews");

// create jwt token by api
app.post("/api/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({
    token,
  });
});

// route handle
app.get("/api/services", async (req, res) => {
  try {
    const query = {};
    const serviceData = services.find(query);
    const data = services.find(query).limit(3);
    const allServices = await serviceData.toArray();
    const homeData = await data.toArray();
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
app.post("/api/add-service", verifyJwt, async (req, res) => {
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
    const review = await reviews
      .find({ service_id: id })
      .sort({ currentdata: -1 });
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
app.get("/api/my-review/update/:id", verifyJwt, async (req, res) => {
  const id = req.params.id;

  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    res.status(403).send({ message: "unauthorized access" });
  }

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

// update review
app.patch("/api/my-review/update/:id", verifyJwt, async (req, res) => {
  const id = req.params.id;

  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    res.status(403).send({ message: "unauthorized access" });
  }

  try {
    const updateReviews = await reviews.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );
    if (updateReviews.matchedCount) {
      res.send({
        success: true,
        message: "Review Update successfully",
      });
    } else {
      res.send({
        success: false,
        err: "something worng try again",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.send({
      success: false,
      err: err.message,
    });
  }
});

// delete review
app.delete("/api/my-review/delete/:id", verifyJwt, async (req, res) => {
  const id = req.params.id;

  const decoded = req.decoded;
  if (decoded.email !== req.query.email) {
    return res.status(403).send({ message: "unauthorized access" });
  }

  try {
    const result = await reviews.deleteOne({ _id: ObjectId(id) });
    if (result.deletedCount) {
      res.send({
        success: true,
        message: "Review Delete successfull",
      });
    } else {
      res.send({
        success: false,
        message: "something wromg try again",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      message: "something wromg try again",
    });
  }
});

// listening the server
app.listen("5000", () => {
  console.log("listen server on 5000 port");
});

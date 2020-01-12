const express = require("express"); //import express
const productsRouter = require("./src/products");
const reviewsRouter = require("./src/reviews");
const path = require("path");
const cors = require("cors");
const listendpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const server = express(); //express instance 

server.use(express.json()); // for post to work and converted to json

//server.use(cors(corsOptions));
server.use(cors());

//make the content of the images folder available for "download" under the name of /images
server.use("/images", express.static(path.join(__dirname, "images")));

// var whitelist = ['http://localhost:3000', http://localhost:3001']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }



mongoose
  .connect(process.env.LOCAL_DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(db => console.log("MongoDB Connected"))
  .catch(err => console.log("ERROR connecting to MongoDb", err));

const PORT = process.env.PORT || 4500;

// Route /products
server.use("/products", productsRouter);

// Route /reviews
server.use("/reviews", reviewsRouter);

server.get("/", (req, res) => {
  res.send("Helloooo " + new Date());
});

console.log(listendpoints(server));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

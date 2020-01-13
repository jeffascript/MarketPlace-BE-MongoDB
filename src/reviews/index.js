const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const reviewRouter = express.Router();
const uuid = require("uuid/v4");
const { check, validationResult, sanitizeBody } = require("express-validator");
const Reviews = require("../models/reviewsSchema");
const Products = require("../models/productsSchema");
const { ObjectId } = require("mongodb");

// const filePath = path.join(__dirname, "reviews.json")

// const readFile = async()=> {
//     const buffer = await fs.readFile(filePath);
//     return JSON.parse(buffer.toString())
// }

// const readFileProducts = async()=> {
//     const buffer = await fs.readFile( path.join(__dirname, "../products/products.json"));
//     return JSON.parse(buffer.toString())
// }

reviewRouter.get("/", async (req, res) => {
  //get all reviews
  //    res.send(await readFile())
  try {
    const allReviews = await Reviews.find();
    const rev = allReviews.map(m => {
      return {
        allReviews: m,
        SearchByID: `${req.protocol}://${req.get("host")}/reviews/${m._id}`,
        linkToReviewProduct: `${req.protocol}://${req.get("host")}/products/${
          m.reviewProductID
        }`,
        method: "GET"
      };
    });

    res.status(200).send(rev);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

reviewRouter.get("/:id", async (req, res) => {
  //get single review
  // const reviews = await readFile();
  // const review = reviews.find(prod => prod._id === req.params.id)
  // if (review)
  //     res.send(review)
  // else
  //     res.status(404).send("Not found")
  try {
    const review = await Reviews.findById(req.params.id);
    if (review) {
      res.status(200).send(review);
    } else {
      res.status(404).send(`Review with _id: "${req.params.id}" not found!`);
    }
  } catch (error) {
    res.send(error);
  }
});

reviewRouter.post(
  "/:productID",
  [
    check("comment")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Comment should be between 1 and 1000 chars"),
    check("rate")
      .exists()
      .withMessage("Ratings is between 1-5")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(404).send(errors);

    //Is there any product with the given elementId?
    // const products = await readFileProducts()
    // if (!products.find(x => x._id === req.body.elementId))
    //     return res.status(404).send("Element not found")

    const product = await Products.findById(req.params.productID);

    try {
      if (!product)
        res
          .status(500)
          .send(`There is no product  with id: ${req.params.productID}`);
      else {
        req.body._id = new ObjectId();

        //Initialised the ID and copied it into the products comment array for reference
        await Products.findByIdAndUpdate(req.params.productID, {
          $push: {
            comments: req.body._id
          }
        });

        const toAdd = {
          ...req.body,
          reviewProductID: req.params.productID,
          createdAt: new Date()
        };

        const newReview = await Reviews.create(toAdd);
        newReview.save();

        res
          .status(201)
          .send({ message: "Product was created Successfully", newReview });

        // const reviews = await readFile()
        // reviews.push(toAdd)
        // await fs.writeFile(filePath, JSON.stringify(reviews))
        // res.send(toAdd)
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

reviewRouter.put("/:id", async (req, res) => {
  //Is there any product with the given elementId?
  // const products = await readFileProducts()

  // if (req.body.elementId && !products.find(x => x._id === req.body.elementId))
  //     return res.status(404).send("Element not found")

  // const reviews = await readFile();
  // console.log(reviews)
  // const review = reviews.find(prod => prod._id === req.params.id)
  // if (review){
  //     delete req.body._id
  //     delete req.body.createdAt
  //     req.body.updateAt = new Date()
  //     const updatedVersion = Object.assign(review, req.body) //<= COPY ALL THE PROPS FROM req.body ON THE ACTUAL review!!
  //     const index = reviews.indexOf(review)
  //     reviews[index] = updatedVersion;
  //     await fs.writeFile(filePath, JSON.stringify(reviews))
  //     res.send(updatedVersion)
  // }
  // else
  //     res.status(404).send("Not found")

  // const product = await Products.findById(req.body._id,{
  //     "Products.comments.$":req.params.productID
  // });
  // console.log(product)

  delete req.body._id;
  delete req.body.updatedAt;

  try {
    const editReview = await Reviews.findByIdAndUpdate(req.params.id, {
      ...req.body,
      updatedAt: new Date()
    });

    if (editReview) {
      res.send({
        message: "Review Successfully Updated",
        viewUpdate: `${req.protocol}://${req.get("host")}/reviews${
          req.params.id
        }`
      });
    } else {
      res
        .status(500)
        .send("Reviews with _id: " + req.params.id + " not found !");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

reviewRouter.delete("/:id", async (req, res) => {
  // const reviews = await readFile();

  // const afterDelete = reviews.filter(x => x._id !== req.params.id)
  // if (reviews.length === afterDelete.length)
  //     return res.status(404).send("NOT FOUND")
  // else{
  //     await fs.writeFile(filePath, JSON.stringify(afterDelete))
  //     res.send("DELETED")
  // }

  const toBeDeletedReview = await Reviews.findByIdAndDelete(req.params.id);

  if (toBeDeletedReview)
    res.status(200).send({ message: " Successffully Deleted " });
  else
    res
      .status(404)
      .send(`Review with _id: "${req.params.id}" not found for deletion!`);
});

module.exports = reviewRouter;

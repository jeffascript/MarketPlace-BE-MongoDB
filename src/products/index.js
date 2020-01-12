const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const productRouter = express.Router();
const uuid = require("uuid/v4");
const multer = require("multer");
const { check, validationResult, sanitizeBody } = require("express-validator");
const { ObjectId } = require("mongodb");
const Products = require("../models/productsSchema");
const Reviews = require("../models/reviewsSchema");

// const filePath = path.join(__dirname, "products.json")

// const readFile = async()=> {
//     const buffer = await fs.readFile(filePath);
//     return JSON.parse(buffer.toString())
// }

// const readFileReviews = async()=> {
//     const buffer = await fs.readFile(path.join(__dirname, "../reviews/reviews.json"));
//     return JSON.parse(buffer.toString())
// }

//?category=...
productRouter.get("/", async (req, res) => {
  //get all products
  //    if (req.query.category)
  //         res.send(products.filter(product => product.category === req.query.category))
  //    else
  //         res.send(products)
  let coll = await Products.countDocuments();
  try {
    const query = req.query;
    if (!query) {
      const product = await Products.find();
      res.status(200).send(product);
    } else {
      const { limit, skip, sort } = query;
      delete query.limit;
      delete query.skip;
      delete query.sort;
      const products = await Products.find(query)
        .populate("comments", "_id")
        .sort({ [sort]: 1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));
      const allProducts = products.map(p => {
        return {
          oneProduct: p,
          searchById: `${req.protocol}://${req.get("host")}/products/${p._id}`,
          method: "GET"
        };
      });
      res.status(200).send({
        totalCount: coll,
        allProducts,
        searchquery: `${req.protocol}://${req.get(
          "host"
        )}/products?sort=-1||1&limit=NUMBER&start=NUMBER`
      });
    }

    // result: books.splice(start, limit),
    //     total: total,
    //     next: `http://localhost:4000/books?category=scifi&limit=${limit}&start=${parseInt(start)+parseInt(limit)}`
  } catch (error) {
    res.send(error);
  }
});

productRouter.get("/:id", async (req, res) => {
  //get single product
  const product = await Products.findById(req.params.id).populate("comments");
  // populate('field_to_populate', '-_id')
  // const product = products.find(prod => prod._id === req.params.id)
  if (product) res.send(product);
  else res.status(404).send("Not found");
});

// productRouter.get("/:id/reviews", async (req, res) =>{
//     const reviews = await readFileReviews();
//     res.send(reviews.filter(r => r.elementId === req.params.id))
// })

productRouter.post(
  "/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("Name should have at least 4 chars"),
    check("category")
      .exists()
      .withMessage("Category is missing"),
    check("description")
      .isLength({ min: 5, max: 1000 })
      .withMessage("Description must be between 50 and 1000 chars"),
    check("price")
      .isNumeric()
      .withMessage("Must be a number")
  ],
  sanitizeBody("price").toFloat(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(404).send(errors);

    const toAdd = {
      ...req.body,
      // comments: [],
      createdAt: new Date()
    };

    // const products = await readFile()
    // products.push(toAdd)
    // await fs.writeFile(filePath, JSON.stringify(products))
    // res.send(toAdd)

    try {
      const newProduct = await Products.create(toAdd);
      newProduct.save();
      res
        .status(201)
        .send({ message: "Product was created Successfully", newProduct });
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }

    // Alternatively:
    //try {
    //     const newStudent = new Student(req.body);
    //     const { _id } = await newStudent.save();
    //     res.send(_id);
    //   } catch (error) {
    //     res.send(error);
    //   }
  }
);

// const multerConfig = multer({})
// productRouter.post("/:id/upload", multerConfig.single("prodPic"), async (req, res)=>{
//     //we need to check if we have an existing product with the given id
//     const products = await readFile();
//     const product = products.find(prod => prod._id === req.params.id)
//     if (product)
//     {
//         const fileDest = path.join(__dirname,"../../images/", req.params.id + path.extname(req.file.originalname))
//         await fs.writeFile(fileDest, req.file.buffer)
//         product.updateAt = new Date();
//         product.imageUrl = "/images/" + req.params.id + path.extname(req.file.originalname);
//         await fs.writeFile(filePath, JSON.stringify(products))
//         res.send(product)
//     }
//     else
//         res.status(404).send("Not found")
// })

const multerConfig = multer({});
productRouter.post(
  "/total",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("Name should have at least 4 chars"),
    check("category")
      .exists()
      .withMessage("Category is missing"),
    check("description")
      .isLength({ min: 5, max: 1000 })
      .withMessage("Description must be between 5 and 1000 chars"),
    check("price")
      .isNumeric()
      .withMessage("Must be a number")
  ],
  sanitizeBody("price").toFloat(),
  multerConfig.single("productImg"),
  async (req, res) => {
    req.body._id = new ObjectId();
    //saving the file in the images folder
    const fileName = req.body._id + path.extname(req.file.originalname); //create a new filename like ASIN.ext
    const newImageLocation = path.join(__dirname, "../../images", fileName); //create the path to my images folder
    await fs.writeFile(newImageLocation, req.file.buffer); //write down the image on the folder

    req.body.imageUrl =
      req.protocol + "://" + req.get("host") + "/images/" + fileName; //update the book object
    //book.img = "http://localhost:4000/images/1231231230.jpg;
    // const books = await readBooks(); //get the list of books
    // books.push(req.body) //adding the books
    // await fs.writeFile(fileLocation, JSON.stringify(books))
    const toAdd = {
      ...req.body,
      createdAt: new Date()
    };

    try {
      const newProduct = await Products.create(toAdd);
      newProduct.save();
      res
        .status(201)
        .send({ message: "Product was created Successfully", newProduct });
    } catch (exx) {
      res.status(500).send(exx);
    }
  }
);

productRouter.put("/:id", async (req, res) => {
  // const products = await readFile();
  // console.log(products)
  // const product = products.find(prod => prod._id === req.params.id)
  // if (product){
  //     delete req.body._id
  //     delete req.body.createdAt
  //     req.body.updateAt = new Date()
  //     const updatedVersion = Object.assign(product, req.body) //<= COPY ALL THE PROPS FROM req.body ON THE ACTUAL PRODUCT!!
  //     const index = products.indexOf(product)
  //     products[index] = updatedVersion;
  //     await fs.writeFile(filePath, JSON.stringify(products))
  //     res.send(updatedVersion)
  // }
  // else
  //     res.status(404).send("Not found")

  // const filter = { _id: req.params.id };
  // const update = {...req.body, updatedAt: new Date()};

  // // `doc` is the document _before_ `update` was applied
  //  let doc = await Character.findOneAndUpdate(filter, update);

  delete req.body._id;
  delete req.body.updatedAt;

  const editProduct = await Products.findByIdAndUpdate(req.params.id, {
    ...req.body,
    updatedAt: new Date()
  });

  /**
     * Alternatively,
     
         const editProduct = await Products.findByIdAndUpdate(req.params.id,{
         $set:{
             ...req.body, updatedAt: new Date()
         }

     })
      
     */

  if (editProduct) {
    res.send({
      message: "Successfully Updated",
      viewUpdate: `${req.protocol}://${req.get("host")}/products/${
        req.params.id
      }`
    });
  } else {
    res.status(500).send("product with " + req.params.id + " not found !");
  }
});

productRouter.delete("/:id", async (req, res) => {
  // const products = await readFile();
  // const afterDelete = products.filter(x => x._id !== req.params.id)
  // if (products.length === afterDelete.length)
  //     return res.status(404).send("NOT FOUND")
  // else{
  //     await fs.writeFile(filePath, JSON.stringify(afterDelete))
  //     res.send("DELETED")
  // }

  const productForDelete = await Products.findOneAndDelete({
    _id: req.params.id
  });

  if (productForDelete)
    res.status(200).send({ message: " Successffully Deleted " });
  else
    res
      .status(404)
      .send(`product with _id: "${req.params.id}" not found for deletion!`);
});

module.exports = productRouter;

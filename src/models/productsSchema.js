const mongoose = require ("mongoose")
const validator = require("validator")

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    description:{
        type: String,
        required: true
    },

    brand:{
        type: String,
        required: true
    },

    imageUrl:{
        type: String,
        required: [true, "URL should be a valid url"],
        unique: true,
        //  validate(value) {
        //      if (!validator.isURL(value)) {
        //        throw new Error("URL is invalid!");
        //      }
        //    }
    },

    price:{
        type: Number,
        required: true
        
    },
    category:{
        type: String,
        required: true
    },

     comments:[{
         type: mongoose.Schema.Types.ObjectID, 
         ref:"reviews"
         
     }],



});


  productSchema.path('imageUrl').validate((val) => {
      urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
      return urlRegex.test(val);
  }, 'Invalid URL.');

productCollection = mongoose.model("products",productSchema )


module.exports = productCollection




// {
//     "name": "app test 1",  //REQUIRED
//     "description": "somthing longer", //REQUIRED
//     "brand": "nokia", //REQUIRED
//     "imageUrl": "https://drop.ndtv.com/TECH/product_database/images/2152017124957PM_635_nokia_3310.jpeg?downsize=*:420&output-quality=80", //REQUIRED
//     "price": 100, //REQUIRED
//     "category": "smartphones" 
//     "createdAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
//     "updatedAt": "2019-07-19T09:32:10.535Z", //SERVER GENERATED
// }



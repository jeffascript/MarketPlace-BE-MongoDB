const mongoose = require ("mongoose")




let min = [1, 'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'];
let max = [5, 'The value of path `{PATH}` ({VALUE}) exceeds the limit ({MAX}).'];




const reviewsSchema = new mongoose.Schema({
  
    comment:{
        type: String,
        required: true
    },

    rate:{
        type: Number,
        required: true,
        default: 1,
        min: min,
        max: max
    },

    reviewProductID:{
        type: mongoose.Schema.Types.ObjectID,
         required: [true, "review must belong to a Product"]
    }
   
    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    //     required: false
    //   },
    
    //   updatedAt: {
    //     type: Date,
    //     default: Date.now,
    //     required: false
    //   }

});


// {
//     "comment": "A good book but definitely I don't like many parts of the plot", //REQUIRED
//     "rate": 3, //REQUIRED, max 5
//     "createdAt": "2019-08-01T12:46:45.895Z" // SERVER GENERATED
// },

reviewsCollection = mongoose.model("reviews",reviewsSchema )


module.exports = reviewsCollection








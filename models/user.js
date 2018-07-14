var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name:String,
    regID:String,
    password:String,
    dept:String,
    desig:String,
     leaves:[
         {
          type: mongoose.Schema.Types.ObjectId,
          ref:"Leave"
         }]
});

module.exports = mongoose.model("User",UserSchema);
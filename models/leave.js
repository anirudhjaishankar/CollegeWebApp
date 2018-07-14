var mongoose =  require("mongoose");

var leaveSchema = new mongoose.Schema({
    nature:String,
    purpose:String,
    doa:{type : Date, default : Date.now},//date of application
    from: Date,
    to: Date,
    approved:{type:Number,default: 0}
});

module.exports = mongoose.model("Leave",leaveSchema); 
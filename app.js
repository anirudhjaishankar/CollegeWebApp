var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var User = require("./models/user.js");
var Leave = require("./models/leave.js");
// var passport = require("passport");
// var LocalStrategy = require("passport-local");
// var passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect("mongodb://localhost/college");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride("_method"));

// app.use(require("express-session")({
//     secret:"college",
//     resave:false,
//     saveUninitialized:false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

//Database schemas
// var leaveSchema = new mongoose.Schema({
//     nature:String,
//     purpose:String,
//     doa:{type : Date, default : Date.now},//date of application
//     from: Date,
//     to: Date,
//     approved:{type:Number,default: 0}
// });

// var Leave = mongoose.model("leave",leaveSchema); 

// var UserSchema = new mongoose.Schema({
//     username:String,
//     name:String,
//     regID:String,
//     password:String,
//     dept:String,
//     desig:String,
//     leaves:[leaveSchema]
// });

// UserSchema.plugin(passportLocalMongoose);

// var User = mongoose.model("User",UserSchema);


// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


//Login
//=====

//GET ROUTES
app.get("/",function(req,res){
    res.render("index.ejs");
});

//POST ROUTES
app.post("/",function(req,res){
    //Check who is logging in and redirect appropriately
    User.findOne({ 
        regID:      req.body.regID,
        password:   req.body.password,
        dept:       req.body.dept
    },function(err,user){
        if(err){
            console.log(err);
        }else{
            if(user == null){
            res.redirect("/");
        }else{
            if(user.desig == "HOD"){
        res.redirect("/"+user.dept+"/HOD/"+user.id+"/Dashboard");    
        }
        else{
            if(user.name =="Admin"){
                res.redirect("/Admin/list");
            }
            else{
                res.redirect("/"+user.dept+"/Staff/"+user._id+"/Dashboard");
            }
         }}
        }
    });
});


//HOD
//===


//Dashboard
app.get("/:dept/HOD/:H_id/Dashboard",function(req,res){                     
    //Get data for hod and leave applications that came to him
    User.find({
        dept:req.params.dept,
        desig:"Staff"       
    }).populate("leaves").exec(function(err,deptStaffs){
        if(err){
            console.log(err);
        }else{
        res.render("HOD/Dashboard",{users:deptStaffs,id:req.params.H_id});    
        }
    });
});

app.put("/:H_id/HOD/:leave_id/:id/Accept",function(req,res){
    Leave.update(
        {
            _id:req.params.leave_id
            
        }
        ,{approved:1},function(err,leaves){
        if(err){
            console.log(err);
        }else{
            User.findOne({_id:req.params.H_id},function(err,user){
              res.redirect("/"+user.dept+"/HOD/"+req.params.H_id+"/Dashboard");  
            });
        }     
    });
});


app.put("/:H_id/HOD/:leave_id/:id/Reject",function(req,res){
    Leave.update(
        {
            _id:req.params.leave_id
            
        }
        ,{approved:2},function(err,leaves){
        if(err){
            console.log(err);
        }else{
            User.findOne({_id:req.params.H_id},function(err,user){
              res.redirect("/"+user.dept+"/HOD/"+req.params.H_id+"/Dashboard");  
            });
        }     
    });
});


//View all the leaves taken
app.get("/HOD/Record",function(req,res){                      //add :dept
    //Get data for hod and leave applications that came to him
    res.render("HOD/Record");
});

//apply leave
app.get("/HOD/:id/leave",function(req,res){
    User.findOne({
        _id:req.params.id
    },function(err,user){
        if(err){
            console.log(err);
        }else{
        res.render("HOD/leave",{user:user});
        }
    });
});


//apply leave
app.post("/HOD/:id/leave",function(req,res){
    Leave.create(req.body.leave,function(err,leave){
              if(err){
                  print(err);
              }else{
             User.find({
                 _id:req.params.id
                 },
                 function(err,user){
                        if(err){
                            console.log(err);
                        }else{
                        user[0].leaves.push(leave);
                        user[0].save();
                        res.redirect("/"+user[0].dept+"/Staff/"+user[0]._id+"/Dashboard");  
                        }
                });
          
            } 
   }); 
});


//Admin
//=====


//add a new staff(GET method) 
app.get("/Admin/signup",function(req,res){
    res.render("Admin/signup");
});

//add a new staff(POST method)
app.post("/Admin/signup",function(req,res){
    //Create a new user
    User.create({
            username:req.body.user["regID"],
            name:req.body.user["name"],
            regID:req.body.user["regID"],
            dept:req.body.user["dept"],
            desig:req.body.user["desig"],
            password:req.body.user["password"]},function(err,user){
            if(err){
                console.log(err);
            }else{
                res.redirect("/Admin/list");
            }
    });
});

//Display staff list
app.get("/Admin/list",function(req,res){
    //Get all the users and send that object into this page
    User.find({},function(err,users){
       if(err){
           console.log("List err");
       }else{
           res.render("Admin/list",{Users:users});
       } 
    });  
    
});

//Detailed staff page
app.get("/Admin/:id/edit",function(req,res){
    User.findById(req.params.id,function(err,foundUser){
        if(err){
            console.log("User not found");
        }else{
            res.render("Admin/details",{User:foundUser});
        }
    })
});

app.put("/Admin/:id",function(req,res){
    User.findByIdAndUpdate(req.params.id,req.body.user,function(err,UpdatedUser){
        if(err){
            console.log("Update error");
        }else{
            res.redirect("Admin/list");
        }
    });   
});

//Delete User
app.delete("/Admin/:id",function(req,res){
   User.findByIdAndRemove(req.params.id,function(err,deletedUser){
       if(err){
           console.log("User delete error");
       }else{
           res.redirect("Admin/list")    
       }   
     
   }); 
});


//Staff
//=====


//staff dashboard
app.get("/:dept/Staff/:id/Dashboard",function(req,res){
    User.findOne({_id:req.params.id}).populate("leaves").exec(
        function(err,user){
            if(err){
                console.log(err);
            }else{
                
                res.render("Staff/Dashboard",{User:user})
            }    
        });
});

//Apply leave
app.get("/Staff/:id/leave",function(req,res){
    User.findOne({
        _id:req.params.id
    },function(err,user){
        if(err){
            console.log(err);
        }else{
        res.render("Staff/leave",{user:user});
        }
    });
});

app.post("/Staff/:id/leave",function(req,res){
    Leave.create(req.body.leave,function(err,leave){
              if(err){
                  print(err);
              }else{
             User.find({
                 _id:req.params.id
                 },
                 function(err,user){
                        if(err){
                            console.log(err);
                        }else{
                        user[0].leaves.push(leave);
                        user[0].save();
                        res.redirect("/"+user[0].dept+"/Staff/"+user[0]._id+"/Dashboard");  
                        }
                });
          
            } 
        }); 
});


//print leave
app.get("/Staff/:id/print",function(req,res){
    res.send("Print leave");
});




//LISTEN ROUTES
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server Started");
});

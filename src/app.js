const express = require("express");
const connectDB = require("./config/database");

const app = express();
const User = require("./Models/user");


 app.use(express.json());

app.post("/signup", async (req, res) => {

    // creating a new instance of the User model
    const user = new User(req.body);
     
    try {
        await user.save();
        res.send("User Added successfully");
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }

});

//Get user by email
app.get("/user", async(req,res) => {
    const userEmail = req.body.emailId;

    try{
        console.log(userEmail);
        const user = await User.findOne({emailId: userEmail});
        if(!user) {
          res.status(404).send("User not found");
        } else{
          res.send(user);
        }
    } catch (err) {
      res.status(400).send("Something went wrong ");
    }
})

app.get("/feed", async(req,res)=>{
   try{
  const users = await User.find({});
  res.send(users);

    } catch (err) {
    res.status(400).send("Something went wrong");
  }
});
app.get("/find/:id", async(req,res) => {
  try{
    const id = req.params.id;   // taking id

    const user = await User.findById(id);

    res.send(user);

  } catch (err) {
    res.status(400).send("Id is missing");
  }
});

app.delete("/user", async (req,res) => {
    const userId = req.body.userId;
    try {
        
      const user = await User.findByIdAndDelete(userId);

      res.send("User deleted successfully");
    } catch (err) {
       res.status(400).send("Something went wrong");
    }
});

app.patch("/user/:id", async(req,res) => {
   const userId = req.params.id;
   const data = req.body;

   try{
      const ALLOWED_UPDATES = ["photoUrl", "about","gender","age","skills"];

      const isUpdateAllowed = Object.keys(data).every((k) => 
         ALLOWED_UPDATES.includes(k)
      );

      if (!isUpdateAllowed) {
         throw new Error("Update not allowed");
      }

       if(data?.skills.length > 10) {
        throw new Error("Skills cannot be more than 10")
       }
       
      const user = await User.findByIdAndUpdate(userId, data, {
         new: true,
         runValidators: true,
      });

      res.send("User updated successfully");

   }catch (err) {
      res.status(400).send(err.message);
   }
});
connectDB()
  .then(() => {
    console.log("Database connection established.....");
    app.listen(7000, () => {
      console.log("Server is Listening on port 7000");
    });
  })
  .catch((err) => {
    console.log("Database can not be connected!!!!");
  });
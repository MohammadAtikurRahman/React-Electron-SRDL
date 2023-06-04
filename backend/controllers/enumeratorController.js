const User = require("../model/user");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const path = require('path');

var userid

async function getEnumerator(req, res) {
    const {id} = req.params;
    const enumerator = await User.findById(id);
    return res.status(200).json(enumerator);
}

async function getToken(data) {
    let token = await jwt.sign(
        {user: data.username, id: data._id, userId: data.userId},
        "shhhhh11111",
        {expiresIn: "1d"},
    );

    // console.log("token",token)
    let decoded = jwt.decode(token);
    userid = decoded.userId
    console.log("userid",userid)
    return token;
}

async function userLogin(req, res) {
    console.log(req.body);
    let user = await User.findOne({username: req.body.username});
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({error: "Username or Password missing"});
    }
     if(!user){
        return res.status(401).json({error: "User Not Found"});
    }
    if (user.password === req.body.password ) {
        let token = await getToken(user);
        return res.status(200).json({
            message: "Login Successfully.",
            token: token,
            status: true,
        });
    }
    return res.status(500).json({message: "Something went wrong."});
}

async function findUserid(req,res){
    console.log("userid",userid);
   res.send({userid});
 
 }



async function deletecsv(req, res){
    // path to the csv file in the public directory
    const csvFilePath = path.join(__dirname, '..', '..', 'public', 'video_information.csv');
  
    fs.unlink(csvFilePath, function(error) {
      if (error) {
        console.error("Error deleting CSV file:", error);
        res.status(500).send('Error deleting file');
      } else {
        console.log("File deleted successfully!");
        res.status(200).send('File deleted successfully');
      }
    });
  };
  











module.exports = {getEnumerator,
    findUserid,
    
    deletecsv,
    userLogin};

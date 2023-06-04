require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const moment = require('moment');
const path = require('path'); // don't forget to require 'path'

const multer = require("multer"),
    bodyParser = require("body-parser");

const mongoose = require("mongoose").set("debug", true);
const {router} = require("./routes.js");
const {randomNumberNotInUserCollection} = require("./helpers/number");

mongoose.connect(process.env.MONGO_URI ||'mongodb://127.0.0.1:27017/electron-offline', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});


const user = require("./model/user.js");

app.use(express.json({limit: "50mb"}));

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.static("uploads"));
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
    bodyParser.urlencoded({
        extended: false,
    }),
);




app.use(router);



app.use("/", (req, res, next) => {
    try {
        if (
            req.path == "/login" ||
            req.path == "/register" ||
            req.path == "/" ||
            req.path == "/api" ||
            req.path == "/users" ||
            req.path == "/delete-csv" ||

            req.path == "/get-testscore" ||
            req.path == "/get-beneficiary" ||
            req.path == "/user-details" ||
            req.path == "/enumerator" ||
            req.path == "/get-enumerator" ||
            req.path == "/get-all" ||
            req.path == "/get-login" ||
            req.path == "/get-pc" ||
            req.path === "/get-vd" ||
            req.path == "/get-download" ||
            req.path == "/get-school" ||
            req.path == "/list-beneficiary" ||
            req.path == "/beneficiary"
        ) {
            next();
        } else {
            /* decode jwt token if authorized*/
            jwt.verify(req.headers.token, "shhhhh11111", function (err, decoded) {
                if (decoded && decoded.user) {
                    req.user = decoded;
                    next();
                } else {
                    return res.status(401).json({
                        errorMessage: "User unauthorized!",
                        status: false,
                    });
                }
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});

app.get("/", (req, res) => {
    res.send({});
});

app.get("/user-details", (req, res) => {
    res.send({});
});

/* user register api */
app.post("/register", async (req, res) => {
    try {
        const userId = await randomNumberNotInUserCollection();
        console.log(userId);
        if (req.body && req.body.username && req.body.password) {
            user.find({username: req.body.username}, (err, data) => {
                if (data.length == 0) {
                    let User = new user({
                        username: req.body.username,
                        password: req.body.password,
                        userId: userId,
                    });
                    User.save((err, data) => {
                        if (err) {
                            res.status(400).json({
                                errorMessage: err,
                                status: false,
                            });
                        } else {
                            res.status(200).json({
                                status: true,
                                title: "Registered Successfully.",
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        errorMessage: `Username ${req.body.username} already exist!`,
                        status: false,
                    });
                }
            });
        } else {
            res.status(400).json({
                errorMessage: "Add proper parameter first!",
                status: false,
            });
        }
    } catch (e) {
        res.status(400).json({
            errorMessage: "Something went wrong!",
            status: false,
        });
    }
});


app.get("/api", (req, res) => {
    user.find((err, val) => {
        if (err) {
            console.log(err);
        } else {
            res.json(val);
        }
    });
});
app.get("/get-all", (req, res) => {
    user.find((err, val) => {
        if (err) {
            console.log(err);
        } else {
            res.json(val);
        }
    });
});

app.get("/get-enumerator", async (req, res) => {
    let users = await user.find({}).select("-beneficiary");
    return res.status(200).json(users);
});

app.get("/get-testscore", async (req, res) => {
    let users = await user.find({})
      .select("-username -password -createdAt -updatedAt -__v -id -_id -userId")
      .select("-pc._id")
      .select("-beneficiary._id")
      .exec();
  
    const formattedData = users[0].pc;
    const beneficiaries = users[0].beneficiary;
  
    let result = formattedData
      .filter(data => data.video_name !== undefined && data.video_name !== "")
      .map(data => ({
        video_name: data.video_name,
        location: data.location,
        pl_start: data.pl_start,
        start_date_time: data.start_date_time,
        pl_end: data.pl_end,
        end_date_time: data.end_date_time,
        duration: data.duration,
      }));
  
    // Remove duplicates
    const uniqueResult = result.reduce((acc, curr) => {
      const exists = acc.find(item => JSON.stringify(item) === JSON.stringify(curr));
      if (!exists) {
        acc.push(curr);
      }
      return acc;
    }, []);
  
    return res.status(200).json({ beneficiary: beneficiaries, pc: uniqueResult });
  });
  
  

app.get("/get-pc", async (req, res) => {
    let users = await user
        .find({})
        .select("-username")
        .select("-password")
        .select("-createdAt")
        .select("-updatedAt")
        .select("-__v")

        .select("-id")
        .select("-_id")
        .select("-userId")
        .select("-beneficiary")

    // const data = users;

    // const formatted_data = data[0];
    // extact_data = formatted_data["beneficiary"];
    const formattedData = users[0].pc;

    // console.log(formattedData);
  
    return res.status(200).json(formattedData);
});



// app.delete('/delete-csv', (req, res) => {
//   // path to the csv file in the public directory
//   const csvFilePath = path.join(__dirname, '..', 'public', 'video_information.csv');

//   fs.unlink(csvFilePath, function(error) {
//     if (error) {
//       console.error("Error deleting CSV file:", error);
//       res.status(500).send('Error deleting file');
//     } else {
//       console.log("File deleted successfully!");
//       res.status(200).send('File deleted successfully');
//     }
//   });
// });


app.get("/get-download", async (req, res) => {
  let users = await user.find({})
    .select("-username")
    .select("-password")
    .select("-createdAt")
    .select("-updatedAt")
    .select("-__v")
    .select("-id")
    .select("-_id")
    .select("-userId")
    .select("-beneficiary");

  const formattedData = users[0].pc;

  // Group data by date
  let dataByDate = {};
  for (let data of formattedData) {
    let dateObject = moment(data.win_end, "M/D/YYYY, h:mm:ss A");

    // Check if the date is valid
    if (!dateObject.isValid()) {
      // If the date is not valid, skip this entry
      continue;
    }

    let date = dateObject.format('YYYY-MM-DD');
    if (!dataByDate[date]) {
      dataByDate[date] = [];
    }
    dataByDate[date].push(data);
  }

  // For each date, sort by time and select the earliest start and latest end
  let result = [];
  for (let date in dataByDate) {
    dataByDate[date].sort((a, b) => moment(a.win_start, "M/D/YYYY, h:mm:ss A").toDate() - moment(b.win_start, "M/D/YYYY, h:mm:ss A").toDate());
    let earliestStart = dataByDate[date][0].win_start;

    dataByDate[date].sort((a, b) => moment(b.win_end, "M/D/YYYY, h:mm:ss A").toDate() - moment(a.win_end, "M/D/YYYY, h:mm:ss A").toDate());
    let latestEnd = dataByDate[date][0].win_end;

    let total_time = dataByDate[date][0].total_time;
    let formattedTotalTime = '';

    if (total_time < 60) {
      formattedTotalTime = `${total_time} minute${total_time !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(total_time / 60);
      const minutes = total_time % 60;
      formattedTotalTime = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    result.push({
      earliestStart,
      latestEnd,
      total_time: formattedTotalTime
    });
  }

  return res.status(200).json(result);
});

app.get("/get-school", async (req, res) => {
    let users = await user.find({})
      .select("-username")
      .select("-password")
      .select("-createdAt")
      .select("-updatedAt")
      .select("-__v")
      .select("-id")
      .select("-_id")
      .select("-userId");
  
    const formattedData = users[0].pc;
    const beneficiaries = users[0].beneficiary;
  
    let dataByDate = {};
    for (let data of formattedData) {
      let dateObject = moment(data.win_end, "M/D/YYYY, h:mm:ss A");
  
      if (!dateObject.isValid()) {
        continue;
      }
  
      let date = dateObject.format('YYYY-MM-DD');
      if (!dataByDate[date]) {
        dataByDate[date] = [];
      }
      dataByDate[date].push(data);
    }
  
    let result = [];
    for (let date in dataByDate) {
      dataByDate[date].sort((a, b) => moment(a.win_start, "M/D/YYYY, h:mm:ss A").toDate() - moment(b.win_start, "M/D/YYYY, h:mm:ss A").toDate());
      let earliestStart = dataByDate[date][0].win_start;
  
      dataByDate[date].sort((a, b) => moment(b.win_end, "M/D/YYYY, h:mm:ss A").toDate() - moment(a.win_end, "M/D/YYYY, h:mm:ss A").toDate());
      let latestEnd = dataByDate[date][0].win_end;
  
      let total_time = dataByDate[date][0].total_time;
      let formattedTotalTime = '';
  
      if (total_time < 60) {
        formattedTotalTime = `${total_time} minute${total_time !== 1 ? 's' : ''}`;
      } else {
        const hours = Math.floor(total_time / 60);
        const minutes = total_time % 60;
        formattedTotalTime = `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
  
      result.push({
        earliestStart,
        latestEnd,
        total_time: formattedTotalTime
      });
    }
  
    return res.status(200).json({beneficiary: beneficiaries, pc: result});
  });










  app.get("/get-vd", async (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    let users = await user
      .find({})
      .select("-username")
      .select("-password")
      .select("-createdAt")
      .select("-updatedAt")
      .select("-__v")
      .select("-id")
      .select("-_id")
      .select("-pc._id")
      .select("-pc.win_start")
      .select("-pc.win_end")
      .select("-pc.total_time");
  
    const formattedData = users[0].pc;
    const filteredData = formattedData.filter((obj, index, self) => {
      return (
        JSON.stringify(obj) !== JSON.stringify({}) &&
        index === self.findIndex((o) => {
          return JSON.stringify(o) === JSON.stringify(obj);
        })
      );
    });
  
    const response = {
      userId: users[0].userId, // Adding userId
      beneficiary: users[0].beneficiary, // Adding beneficiary
      videoData: filteredData // video data
    };
  
    return res.status(200).json(response);
  });
  

app.get("/get-beneficiary", async (req, res) => {
    let users = await user
        .find({})
        .select("-_id")
        .select("-id")
        .select("-username")
        .select("-password")
        .select("-createdAt")

        .select("-beneficiary.test");

    const data = users;
    const data1 = users;
    const formatted_data = data[0];

    //   const formatted_data1= data1[1]

    // extact_data1 = formatted_data1['beneficiary']

    extact_data = formatted_data["beneficiary"];

    // let obj3 = Object.assign(extact_data, extact_data1);

    //  console.log(obj3)

    return res.status(200).json(extact_data);
});

app.get("/get-login", async (req, res) => {
    // let users = await user.find({}).select("-password").select("-username").select("-beneficiary.name").select("-beneficiary.f_nm")
    // .select("-beneficiary.ben_nid").select("-beneficiary.ben_id").select("-beneficiary.sl").select("-beneficiary.m_nm").select("-beneficiary.age").select("-beneficiary.dis")
    // .select("-beneficiary.sub_dis").select("-beneficiary.uni").select("-beneficiary.vill").select("-beneficiary.relgn").select("-beneficiary.job").select("-beneficiary.gen")

    // .select("-beneficiary.mob").select("-beneficiary.pgm").select("-beneficiary.pass").select("-beneficiary.bank").select("-beneficiary.branch").select("-beneficiary.r_out")

    // .select("-beneficiary.mob_1").select("-beneficiary.ben_sts").select("-beneficiary.nid_sts").select("-beneficiary.a_sts").select("-beneficiary.u_nm")

    // .select("-beneficiary.dob").select("-beneficiary.accre").select("-beneficiary.f_allow").select("-beneficiary.mob_own").select("-beneficiary.test")

    let users = await user.find({}).select("-beneficiary");
    return res.status(200).json(users);
});

app.get("/enumerator", (req, res) => {
    product.find((err, val) => {
        if (err) {
            console.log(err);
        } else {
            res.json(val);
        }
    });
});

app.post("/api", async (req, res) => {
    try {
        // const anotherData = JSON.parse(req.body)
        const saveData = req.body;
        const newData = new user({
            username: saveData.username,
            password: saveData.password,
        });
        await newData.save();
        res.status(201).json({success: true, data: newData});
    } catch (error) {
        res.status(400).json({success: false});
    }
});

app.listen(2000, (err, data) => {
    // console.log(err);
    console.log("Server is Runing On port 2000");
});

import React, { Component } from "react";

import {
  TextField,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import swal from "sweetalert";
import File from "./File";

import { Link as MaterialLink } from "@material-ui/core";
import { Link } from "react-router-dom";
import BeneficiaryDelete, { beneficiarydelete } from "./BeneficiaryDelete";
import { searchBeneficiary } from "./utils/search";
import { EditBeneficiary } from "./EditBeneficiary";
import { AddBeneficiary } from "./AddBeneficiary";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import Userid from "./Userid";

const axios = require("axios");
const baseUrl = process.env.REACT_APP_URL;

export default class Video extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openProductModal: false,
      openProductEditModal: false,
      id: "",
      lastData: {},

      name: "",
      f_nm: "",
      ben_nid: "",
      sl: "",
      ben_id: "",
      m_nm: "",
      data: [],

      age: "",
      dis: "",
      sub_dis: "",
      uni: "",
      vill: "",
      relgn: "",
      job: "",
      gen: "",
      mob: "",
      pgm: "",

      pass: "",
      bank: "",
      branch: "",
      r_out: "",
      mob_1: "",
      mob_own: "",
      ben_sts: "",
      nid_sts: "",
      a_sts: "",

      u_nm: "",
      dob: "",
      accre: "",
      f_allow: "",
      score1: "",
      score2: "",

      desc: "",
      price: "",
      discount: "",
      file: "",
      fileName: "",
      page: 1,
      search: "",
      beneficiaries: [],
      persons: [],
      pages: 0,
      loading: false,

      anchorEl: null,
      selectedItem: null,
      beneficiary: {},
      error: "",
      filteredBeneficiary: [],
      currentBeneficiary: "",
      dataSent: false,
      timeData: {
        totalDuration: 0,
        firstStartTime: "",
        lastStartTime: "",
      },
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }
  fetchData = () => {
    axios
      .get("http://localhost:2000/get-vd")
      .then((response) => {
        this.setState({ data: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  downloadCSV = () => {
    function createCombinedRow(bData, pcData = {}) {
      // Combine beneficiary and pc data into a single row
      const userName = `"${(bData.m_nm || "").replace(/"/g, '""')}"`;
      const eiin = bData.beneficiaryId;
      const schoolName = bData.name;
      const pcId = bData.u_nm;
      const labId = bData.f_nm;
      const videoName = `"${(pcData.video_name || "").replace(/"/g, '""')}"`;
      const location = `"${(pcData.location || "").replace(/"/g, '""')}"`;
      const playerTimeStart = `"${(pcData.pl_start || "").replace(
        /"/g,
        '""'
      )}"`;
      const pcTimeStart = `"${(pcData.start_date_time || "").replace(
        /"/g,
        '""'
      )}"`;
      const playerEndTime = `"${(pcData.pl_end || "").replace(/"/g, '""')}"`;
      const pcEndTime = `"${(pcData.end_date_time || "").replace(/"/g, '""')}"`;
      const totalTime = `"${(pcData.duration || "").replace(/"/g, '""')}"`;

      return [
        videoName,
        location,
        playerTimeStart,
        pcTimeStart,
        playerEndTime,
        pcEndTime,
        totalTime,
        userName,
        eiin,
        schoolName,
        pcId,
        labId,
      ];
    }

    axios
      .get("http://localhost:2000/get-testscore")
      .then((response) => {
        const { data } = response;
        let csvContent = "data:text/csv;charset=utf-8,";

        // Combine headers
        const headers = [
          "Video Name",
          "Location",
          "Player Time",
          "PC Time Start",
          "Player End Time",
          "PC End Time",
          "Total Time",
          "User Name",
          "EIIN",
          "School Name",
          "PC ID",
          "Lab ID",
        ];
        csvContent += headers.join(",") + "\r\n";

        // Map beneficiaries with pc data
        data.beneficiary.forEach((bData) => {
          // Find matching pc data for each beneficiary
          const matchingPcData = data.pc.filter(
            (pcData) => bData.id === pcData.beneficiaryId
          );

          // If matching pc data is found, create a row for each
          if (matchingPcData.length) {
            matchingPcData.forEach((pcData) => {
              const row = createCombinedRow(bData, pcData);
              csvContent += row.join(",") + "\r\n";
            });
          } else {
            // If no matching pc data is found, create a row with just beneficiary data
            const row = createCombinedRow(bData);
            csvContent += row.join(",") + "\r\n";
          }
        });

        // Extract school name for file renaming
        // const schoolName = data.beneficiary[0].name;
        // const fileName = `video_${schoolName}.csv`;

        const schoolName = data.beneficiary[0].name;
        const eiin = data.beneficiary[0].beneficiaryId;
        const pc_id = data.beneficiary[0].f_nm;

        const fileName = `video_${schoolName}_ein_${eiin}_Pc_Id_${pc_id}.csv`; 

        // Create a download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading CSV:", error);
      });
  };

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleSelect(item) {
    this.setState({ selectedItem: item });
    this.handleClose();
  }

  sendPcData = async (data) => {
    try {
      const response = await fetch("http://localhost:2000/pcinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  convertToHoursAndMinutes(totalTime) {
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
        minutes > 1 ? "s" : ""
      }`;
    }
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  componentDidMount = () => {

    this.interval = setInterval(this.fetchData1, 90000); // fetch data every 1 minute



    let token = localStorage.getItem("token");
    if (!token) {
      this.props.history.push("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getBeneficiaries();
      });
    }

    axios.get(baseUrl + "/user-details").then((res) => {
      const persons = res.data;
      this.setState({ persons });
    });

    const currentTime = new Date();
    const currentDate = currentTime.toLocaleDateString();
    const newTimeData = {
      windowsStartTime: currentTime.toLocaleString(),
    };
    this.fetchData();

    const storedData = localStorage.getItem("timeData");
    if (storedData) {
      const timeArray = JSON.parse(storedData);
      const lastTimeData = timeArray[timeArray.length - 1];
      const lastStartTime = new Date(lastTimeData.windowsStartTime);
      const duration = Math.floor(
        (currentTime.getTime() - lastStartTime.getTime()) / (1000 * 60)
      );
      newTimeData.duration = duration;
      timeArray.push(newTimeData);

      localStorage.setItem("timeData", JSON.stringify(timeArray, null, 2));

      const todaysData = timeArray.filter((item) => {
        const itemDate = new Date(item.windowsStartTime).toLocaleDateString();
        return itemDate === currentDate;
      });

      if (todaysData.length > 0) {
        const firstStartTime = new Date(todaysData[0].windowsStartTime);
        const lastStartTime = new Date(
          todaysData[todaysData.length - 1].windowsStartTime
        );
        const totalDuration = Math.floor(
          (lastStartTime.getTime() - firstStartTime.getTime()) / (1000 * 60)
        );

        this.setState({
          timeData: {
            totalDuration,
            firstStartTime: todaysData[0].windowsStartTime,
            lastStartTime: todaysData[todaysData.length - 1].windowsStartTime,
          },
        });
      } else {
        console.log("No data for today yet");
      }
    } else {
      const timeArray = [newTimeData];
      localStorage.setItem("timeData", JSON.stringify(timeArray, null, 2));
      console.log("Time data saved to storage");
    }

    // After setting timeData, send the data to the server
    this.sendPcData(this.state.timeData);

    fetch("http://localhost:2000/userid")
      .then((response) => response.json())
      .then((data) => this.setState({ user: data }));
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
 
  }


  fetchData1 = () => {  

    if (!navigator.onLine) {

    axios
   .get("http://localhost:2000/get-testscore")
   .then((response) => {
     const { data } = response;
     console.log(data); // Log data to console
   
     const videoDataArray = data.pc.map(video => ({
       pc_name: video.pc_name,
       eiin: data.beneficiary[0].beneficiaryId,
       school_name: data.beneficiary[0].name,
       pc_id: data.beneficiary[0].u_nm,
       lab_id: data.beneficiary[0].f_nm,
       video_name: video.video_name,
       location: video.location,
       pl_start: video.pl_start,
       start_date_time: video.start_date_time,
       pl_end: video.pl_end,
       end_date_time: video.end_date_time,
       duration: video.duration,
     }));
   
     console.log(videoDataArray); // Log transformed data to console
   
     // Make a POST request with the transformed data
     axios
       .post("http://172.104.191.159:2002/insert-video-data", videoDataArray)
       .then((response) => {
         console.log("Data inserted successfully:", response.data);
         // Handle the response as needed
       })
       .catch((error) => {
         console.error("Error inserting data:", error);
       });
   })
   .catch((error) => {
     console.error("Error fetching data:", error);
   });





  }







   };
   


  sendData = async () => {
    const userid = this.state.user ? this.state.user.userid : null;

    const data = {
      userId: userid,
      win_start: this.state.timeData.firstStartTime,
      win_end: this.state.timeData.lastStartTime,
      total_time: this.state.timeData.totalDuration,
    };

    try {
      const response = await axios.post("http://localhost:2000/pcinfo", data);
      console.log(response.data);
      this.setState({ dataSent: true }, () => {
        window.location.reload();
        setTimeout(() => {
          window.location.reload();
        }, 100); // Adjust the delay (in milliseconds) as needed
      });
    } catch (error) {
      console.error(error);
    }
  };

  getBeneficiaries = () => {
    this.setState({ loading: true });
    axios
      .get(baseUrl + "/beneficiary", {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          beneficiaries: res.data.beneficiaries,
          filteredBeneficiary: res.data.beneficiaries,
        });
      })
      .catch((err) => {
        swal({
          text: err,
          icon: "error",
          type: "error",
        });
        this.setState(
          { loading: false, beneficiaries: [], userinfo: [] },
          () => {}
        );
      });
  };
  logOut = () => {
    localStorage.setItem("token", null);
    this.props.history.push("/");
  };

  fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:2000/get-pc");
      const data = response.data;
      const lastData = data[data.length - 1];
      this.setState({ lastData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {});

    if (e.target.name === "search") {
      const needle = e.target.value;
      this.setState({
        filteredBeneficiary: searchBeneficiary(
          this.state.beneficiaries,
          needle
        ),
      });
    }
  };

  handleClick1 = () => {
    this.sendData();
    this.sendData();
    this.sendData();
  };

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: "",
      name: "",
      desc: "",
      price: "",
      discount: "",
      fileName: "",
    });
  };

  handleCsv = () => {
    this.setState({
      openProductModal: true,
      id: "",
      name: "",
      desc: "",
      price: "",
      discount: "",
      fileName: "",
    });
  };
  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };

  handleProductEditOpen = (row) => {
    this.setState({
      openProductEditModal: true,
      currentBeneficiary: row,
    });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };

  render() {
    const { data } = this.state;

    const { dataSent } = this.state;
    const { lastData } = this.state;

    return (
      <div style={{ overflowX: "hidden", maxWidth: "100%" }}>
        {this.state.openProductEditModal && (
          <EditBeneficiary
            beneficiary={this.state.currentBeneficiary}
            isEditModalOpen={this.state.openProductEditModal}
            handleEditModalClose={this.handleProductEditClose}
            getBeneficiaries={this.getBeneficiaries}
          />
        )}
        {this.state.openProductModal && (
          <AddBeneficiary
            isEditModalOpen={this.state.openProductModal}
            handleEditModalClose={this.handleProductClose}
            getBeneficiaries={this.getBeneficiaries}
          />
        )}
        <AppBar position="static" style={{ backgroundColor: "#1F8A70" }}>
          <Toolbar>
            <div style={{ display: "flex"}}>
              <Button
                variant="contained"
                color="primary"
                href="/dashboard"
                style={{ zIndex: "9999" }}
              >
                Video INFO
              </Button>
              &nbsp; &nbsp;
              <h5 style={{ paddingTop: "10px"}}>SRDL Video Dashboard</h5>

            </div>

            <div style={{ flexGrow: 1 }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                &nbsp; &nbsp; &nbsp; &nbsp;
                <Button
                  className="button_style"
                  variant="contained"
                  color="inherit"
                  size="small"
                  style={{ zIndex: "9999" }}
                  onClick={this.downloadCSV}
                >
                  Download
                </Button>
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <AppBar position="static" style={{ backgroundColor: "#3399CC" }}>
          {this.state?.filteredBeneficiary?.map((row, index) => (
            <Toolbar    >
              <div>
                <div
                  style={{
                    backgroundColor: "#FF9933", // Adjust the color as desired
                    borderRadius: "4px",
                    display: "inline-block",
                    textDecoration: "none",
                    color: "black",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px", // Adjust the font size as desired

                      padding: "4px",
                      paddingLeft: "12px",
                      paddingRight: "12px",
                      zIndex: "99999",
                    }}
                    href="/allcontent"
                  >
                    {row.name}
                  </Button>
                </div>
              </div>
              {/* <div style={{ flexGrow: 1 }} /> */}
              &nbsp; &nbsp; &nbsp; &nbsp;
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={this.handleProductOpen}
                  >
                    <b>EIIN: {row.beneficiaryId} </b>
                  </Button>
                  &nbsp; &nbsp;
                  <Button variant="contained" size="small">
                    <b> LAB ID: {row.u_nm} </b>
                  </Button>
                  &nbsp; &nbsp;
                  <Button variant="contained" size="small">
                    <b> PC ID: {row.f_nm} </b>
                  </Button>
                  &nbsp; &nbsp;
                  <Button
                    className="button_style"
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ zIndex: "9999" }}
                    onClick={() => this.handleProductEditOpen(row)}
                  >
                    Edit
                  </Button>
                  <BeneficiaryDelete row={row} />
                  &nbsp; &nbsp;
                </div>
              </div>
            </Toolbar>
          ))}
        </AppBar>
        <div>
          <div style={{ transform: "translate(10px, -111px)" }}>
            <File />
          </div>
        </div>

        
        <AppBar
          position="static"
          style={{ backgroundColor: "#ffff", marginTop: "22%" }}
          elevation={0}
        >
          <Toolbar>
            

            <div style={{ flexGrow: 1 }} />
            <div style={{ flexGrow: -2 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
              
                &nbsp;
             
                <Button
                  className="button_style"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={this.logOut}
                >
                  <MaterialLink
                    style={{
                      textDecoration: "none",
                      color: "white",
                    }}
                    href="/"
                  >
                    Logout
                  </MaterialLink>
                </Button>
              </div>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

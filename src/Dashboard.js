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
import Userid from "./Userid";

import { Link as MaterialLink } from "@material-ui/core";
import { Link } from "react-router-dom";
import BeneficiaryDelete, { beneficiarydelete } from "./BeneficiaryDelete";
import { searchBeneficiary } from "./utils/search";
import { EditBeneficiary } from "./EditBeneficiary";
import { AddBeneficiary } from "./AddBeneficiary";
import Previous from "./Previous";

import Online from "./Online";


import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";

const axios = require("axios");
const baseUrl = process.env.REACT_APP_URL;

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openProductModal: false,
      openProductEditModal: false,
      id: "",
      lastData: {},
      ttime: {},
      user: null,

      name: "",
      f_nm: "",
      ben_nid: "",
      sl: "",
      ben_id: "",
      m_nm: "",

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
      csvContent: '',
      fileName: '',
      jsonData: null,



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
    this.fetchData();
    this.handleClick1();  // Call initially for immediate execution
    this.intervalID = setInterval(this.handleClick1.bind(this), 1 * 60 * 1000);  // Schedule to run every 1 minute
    this.interval = setInterval(this.fetchData1, 6000); // fetch data every 1 minute


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
    clearInterval(this.intervalID);  // Stop the interval when the component unmounts
    if (this.interval) {
      clearInterval(this.interval);
    }
 
  }

  
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
      const ttime = data[data.length - 1];
      this.setState({ ttime });

      const today = new Date().toLocaleDateString(); // Get current date in the format "MM/DD/YYYY"

      let earliestStart = null;
      let latestEnd = null;

      for (let i = 0; i < data.length; i++) {
        const startDate = new Date(data[i].win_start);
        const endDate = new Date(data[i].win_end);

        const entryDate = startDate.toLocaleDateString(); // Get entry's date in the format "MM/DD/YYYY"

        if (entryDate === today) {
          if (!earliestStart || startDate < new Date(earliestStart)) {
            earliestStart = data[i].win_start;
          }

          if (!latestEnd || endDate > new Date(latestEnd)) {
            latestEnd = data[i].win_end;
          }
        }
      }

      const lastData = {
        earliestStart,
        latestEnd,
      };

      console.log("result", lastData);
      this.setState({ lastData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };



  fetchData1 = () => {
 
    
    if (!navigator.onLine) {


    axios.get("http://localhost:2000/get-school")
      .then((response) => {
        const { data } = response;
        console.log("data checking",data); // log the fetched data in the console
  
        const beneficiary = data.beneficiary[0]; // Since it's an array with one object
        const pcs = data.pc;
  
        // Create the first schoolData object with the "header" information
        const newSchoolData = [{
          "User Name": beneficiary.m_nm,
          "EIIN": beneficiary.beneficiaryId,
          "School Name": beneficiary.name,
          "PC ID": beneficiary.f_nm,
          "Lab ID": beneficiary.u_nm
        },
        // Create the header for time tracking information
        {
          "User Name": "Start Time",
          "EIIN": "End Time",
          "School Name": "Total Time",
          "PC ID": "",
          "Lab ID": ""
        }];
  
        // Add each pc object to the newSchoolData array
        pcs.forEach((pc) => {
          newSchoolData.push({
            "User Name": pc.earliestStart,
            "EIIN": pc.latestEnd,
            "School Name": pc.total_time,
            "PC ID": "",
            "Lab ID": ""
          });
        });
  
        // Create the postData object
        const postData = {
          schoolData: newSchoolData
        };
    
        console.log("postData", postData);
    
        // Make the API post request
        axios.post("http://172.104.191.159:2002/insert-data", postData)
          .then((response) => {
            console.log("Data inserted successfully");
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
  

  downloadCSV = () => {
    axios
      .get("http://localhost:2000/get-school")
      .then((response) => {
        const { data } = response;
        let csvContent = "data:text/csv;charset=utf-8,";

        // Add beneficiary data rows
        const beneficiaryHeaders = [
          "User Name",
          "EIIN",
          "School Name",
          "PC ID",
          "Lab ID",
        ];
        csvContent += beneficiaryHeaders.join(",") + "\r\n";
        data.beneficiary.forEach((item) => {
          const userName = `"${(item.m_nm || "").replace(/"/g, '""')}"`;
          const eiin = item.beneficiaryId;
          const name = item.name;

          const pcId = item.u_nm;
          const labId = item.f_nm;
          const row = [userName, eiin, name, pcId, labId];
          csvContent += row.join(",") + "\r\n";
        });

        // Add column headers for pc data
        const pcHeaders = ["Start Time", "End Time", "Total Time"];
        csvContent += pcHeaders.join(",") + "\r\n";

        // Add pc data rows
        data.pc.forEach((item) => {
          const startTime = `"${(item.earliestStart || "").replace(
            /"/g,
            '""'
          )}"`;
          const endTime = `"${(item.latestEnd || "").replace(/"/g, '""')}"`;
          const totalTime = `"${(item.total_time || "").replace(/"/g, '""')}"`;
          const row = [startTime, endTime, totalTime];
          csvContent += row.join(",") + "\r\n";
        });

        // Extract school name for file renaming

        const schoolName = data.beneficiary[0].name;
        const eiin = data.beneficiary[0].beneficiaryId;
        const pc_id = data.beneficiary[0].f_nm;

        const fileName = `pc_${schoolName}_ein_${eiin}_Pc_Id_${pc_id}.csv`;

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
    const { dataSent } = this.state;
    const { lastData } = this.state;
    const { ttime } = this.state;

    return (
      <div>
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

  

        <AppBar position="static" style={{ backgroundColor: "#1F8A70" }}             elevation={0}
     >
          <Toolbar>
            {this.state?.filteredBeneficiary?.reverse().map((row, index) => (
              <div key={index}  style={{ display: "flex"}}>
                <Button variant="contained" color="primary" href="/video">
                  PC INFO
                </Button>
                &nbsp; &nbsp;
                <Button variant="contained" color="primary">
                  {" "}
                  {row.m_nm}{" "}
                </Button>
                &nbsp; &nbsp;
                <h5 style={{ paddingTop: "10px"}}>SRDL PC Dashboard</h5>
              </div>
            ))}
            <div style={{ flexGrow: 1 }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                &nbsp; &nbsp; &nbsp; &nbsp;
                <Button
                  variant="contained"
                  size="small"
                  onClick={this.handleProductOpen}
                >
                  <b> Add School</b>
                </Button>
                &nbsp; &nbsp;
                <Button
                  variant="contained"
                  size="small"
                  onClick={this.downloadCSV}
                >
                  <b> Download </b>
                </Button>

                {this.state.jsonData && (
          <pre>{JSON.stringify(this.state.jsonData, null, 2)}</pre>
        )}

                {dataSent ? (
                  <p></p>
                ) : (
                  <Button
                    className="button_style"
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.handleClick1}
                  >
                    Pc Usages
                  </Button>
                )}
          
              <Online />
                
              </div>
            </div>
          </Toolbar>
        </AppBar>

        <AppBar position="static" style={{ backgroundColor: "#3399CC" }}>
          {this.state?.filteredBeneficiary?.map((row, index) => (
            <Toolbar>
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
                    variant="h6"
                    href="/allcontent"
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px", // Adjust the font size as desired

                      padding: "4px",
                      paddingLeft: "12px",
                      paddingRight: "12px",
                    }}
                  >
                    {row.name}
                  </Button>
                </div>
              </div>
              {/* <div style={{ flexGrow: 1 }} /> */}
              &nbsp; &nbsp; &nbsp; &nbsp;
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button variant="contained" size="small">
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
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <b> Start Date & Time </b>
                  </TableCell>
                  <TableCell align="center">
                    <b> Last Usage Date & Time </b>
                  </TableCell>
                  <TableCell align="center">
                    <b> Duration </b>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {this.state?.filteredBeneficiary
                  ?.reverse()
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">


                        <b> {new Date(lastData.earliestStart).toLocaleString(
                          "en-GB",
                          { hour12: true }
                        )} </b>
                       
                      </TableCell>

                      <TableCell align="center">

                         <b>

                        {new Date(lastData.latestEnd).toLocaleString("en-GB", {
                          hour12: true,
                        })}
                        
                        </b>


                      </TableCell>

                     

                      <TableCell align="center" component="th" scope="row">


                        <b>

                        {this.convertToHoursAndMinutes(ttime.total_time)}

                        
</b>


                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* <Previous /> */}

            <Pagination
              count={this.state.pages}
              page={this.state.page}
              onChange={this.pageChange}
              color="primary"
            />
          </TableContainer>
        </div>

        {/* <AppBar
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
        </AppBar> */}
      </div>
    );
  }
}

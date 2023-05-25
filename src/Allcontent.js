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
import Previous from "./Previous"
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

export default class Allcontent extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openProductModal: false,
      openProductEditModal: false,
      id: "",
      lastData: {},
      ttime: {},

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
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  componentDidMount = () => {
    this.fetchData();

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
  };

  
  sendData = async () => {
    const data = {
      userId:  <Userid />,
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
        latestEnd
      };
  
      console.log("result", lastData);
      this.setState({ lastData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  



  downloadCSV = () => {
    axios
      .get('http://localhost:2000/get-school')
      .then((response) => {
        const { data } = response;
        let csvContent = 'data:text/csv;charset=utf-8,';
  
        // Add beneficiary data rows
        const beneficiaryHeaders = ['User Name', 'EIIN','School Name', 'PC ID', 'Lab ID'];
        csvContent += beneficiaryHeaders.join(',') + '\r\n';
        data.beneficiary.forEach((item) => {
          const userName = `"${(item.m_nm || '').replace(/"/g, '""')}"`;
          const eiin = item.beneficiaryId;
          const name = item.name;

          const pcId = item.u_nm;
          const labId = item.f_nm;
          const row = [userName, eiin,name, pcId, labId];
          csvContent += row.join(',') + '\r\n';
        });
  
        // Add column headers for pc data
        const pcHeaders = ['Start Time', 'End Time', 'Total Time'];
        csvContent += pcHeaders.join(',') + '\r\n';
  
        // Add pc data rows
        data.pc.forEach((item) => {
          const startTime = `"${(item.earliestStart || '').replace(/"/g, '""')}"`;
          const endTime = `"${(item.latestEnd || '').replace(/"/g, '""')}"`;
          const totalTime = `"${(item.total_time || '').replace(/"/g, '""')}"`;
          const row = [startTime, endTime, totalTime];
          csvContent += row.join(',') + '\r\n';
        });
  
        // Extract school name for file renaming
        const schoolName = data.beneficiary[0].name;
        const fileName = `pc_${schoolName}.csv`;
  
        // Create a download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error('Error downloading CSV:', error);
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
        {/* <div>
                    <br></br>
                    <h2>Dashboard</h2>

                    <Button
                        className="button_style"
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.handleProductOpen}>
                        Add Beneficiary
                    </Button>

                    <Button
                        className="button_style"
                        variant="contained"
                        color="primary"
                        size="small">
                        <MaterialLink
                            style={{ textDecoration: "none", color: "white" }}
                            href="/enumerator">
                            List Of Enumerator
                        </MaterialLink>
                    </Button>

                    <Button
                        className="button_style"
                        variant="contained"
                        color="inherit"
                        size="small">
                        <MaterialLink
                            style={{ textDecoration: "none", color: "black" }}
                            href="/test">
                            List Of Test
                        </MaterialLink>
                    </Button>

                    <Button
                        className="button_style"
                        variant="contained"
                        color="inherit"
                        size="small">
                        <MaterialLink
                            style={{ textDecoration: "none", color: "black" }}
                            href="/test">
                            Transactions
                        </MaterialLink>
                    </Button>

                    <Button
                        className="button_style"
                        variant="contained"
                        size="small"
                        onClick={this.logOut}>
                        <MaterialLink
                            style={{
                                textDecoration: "none",
                                color: "black",
                            }}
                            href="/">
                            logout
                        </MaterialLink>
                    </Button>
                </div>
                <br />
                <TableContainer>
                    <div className="search-container">
                        <TextField
                            id="standard-basic"
                            type="search"
                            autoComplete="off"
                            name="search"
                            value={this.state.search}
                            onChange={this.onChange}
                            placeholder="Search by Beneficiary"
                            required
                            style={{ border: "1px solid grey", padding: "1px" }}
                            InputProps={{
                                disableUnderline: true,
                                style: { paddingRight: "5px", paddingLeft: "50px" },
                            }}
                        />
                    </div>

                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">
                                    <b> Beneficiary Created Time </b>
                                </TableCell>
                                <TableCell align="center">
                                    <b> Beneficiary Name </b>
                                </TableCell>
                                <TableCell align="center">
                                    <b> Beneficiary Id </b>
                                </TableCell>

                                <TableCell align="center">
                                    <b> Test Score </b>
                                </TableCell>
                                <TableCell align="center">
                                    <b> Action </b>
                                </TableCell>
                                <TableCell align="center">
                                    <b> View BeneFiciary </b>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {this.state?.filteredBeneficiary?.reverse().map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell align="center">
                                        {new Date(row.updatedAt).toLocaleString("en-US", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            hour12: true,
                                        })}
                                        &nbsp; &nbsp; &nbsp; &nbsp;
                                        {new Date(row.updatedAt).toLocaleString("en-GB", {
                                            month: "2-digit",
                                            day: "2-digit",
                                            year: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell align="center">{row.name}</TableCell>

                                    <TableCell align="center" component="th" scope="row">
                                        {row.beneficiaryId}
                                    </TableCell>

                                    <TableCell align="center">{row.score1}</TableCell>

                                    <TableCell align="center">
                                        <Button
                                            className="button_style"
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => this.handleProductEditOpen(row)}>
                                            Edit
                                        </Button>

                                        <BeneficiaryDelete row={row} />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Button
                                            className="button_style"
                                            variant="contained"
                                            color="primary"
                                            size="small">
                
                                            <Link
                                                style={{
                                                    textDecoration: "none",
                                                    color: "white",
                                                }}
                                                to={`/profile/${row._id}`}
                                                state={row}>
                                                BeneFiciary Details
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <br />
                    <Pagination
                        count={this.state.pages}
                        page={this.state.page}
                        onChange={this.pageChange}
                        color="primary"
                    />
                </TableContainer>
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
                )} */}

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

          {this.state?.filteredBeneficiary
                  ?.reverse()
                  .map((row, index) => (
            <div  key={index}>
              <Button variant="contained" color="primary" href="/dashboard">
                PC INFO
              </Button>
              &nbsp; &nbsp;
              <Button variant="contained" color="primary" href="/video">
                VIDEO INFO
              </Button>
            </div>
            ))
            
          }
            <div style={{ flexGrow: 1 }} />
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                &nbsp; &nbsp; &nbsp; &nbsp;
                <Button
              variant="outlined"
                  size="small"
                  // onClick={this.handleProductOpen}
                  disabled
                  style={{ color: "black"}}
                >
                  <b> Details PC Usages</b>
                </Button>
                &nbsp; &nbsp;
                <Button variant="contained" size="small"
                                    onClick={this.downloadCSV}
                                    >
                  <b> Download </b>
                </Button>
                {/* &nbsp; &nbsp; */}
                {/* <Button variant="contained" size="small">
                  <b> Details </b>
                </Button> */}
                {/* &nbsp; */}
                {/* <IconButton>
                  <SearchIcon style={{ color: "white" }} />
                </IconButton>
                <InputBase
                  placeholder="Search..."
                  style={{ marginLeft: 1, color: "white" }}
                  inputProps={{
                    style: { color: "white" },
                    placeholder: "SEARCH",
                  }}
                /> */}
                {/* {dataSent ? (
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
                )} */}
                {/* <Button
                  className="button_style"
                  variant="contained"
                  size="small"
                  onClick={this.logOut}
                >
                  <MaterialLink
                    style={{
                      textDecoration: "none",
                      color: "black",
                    }}
                    href="/"
                  >
                    <b> Logout </b>
                  </MaterialLink>
                </Button> */}
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
                    href="/video"
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
                  {/* <IconButton>
                  <SearchIcon style={{ color: "white" }} />
                </IconButton>
                <InputBase
                  placeholder="Search..."
                  style={{ marginLeft: 8, color: "white" }}
                  inputProps={{
                    style: { color: "white" },
                    placeholder: "SEARCH",
                  }}
                /> */}
                  <Button
                    variant="contained"
                    size="small"
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
            {/* <div className="search-container">
                        <TextField
                            id="standard-basic"
                            type="search"
                            autoComplete="off"
                            name="search"
                            value={this.state.search}
                            onChange={this.onChange}
                            placeholder="Search by Beneficiary"
                            required
                            style={{ border: "1px solid grey", padding: "1px" }}
                            InputProps={{
                                disableUnderline: true,
                                style: { paddingRight: "5px", paddingLeft: "50px" },
                            }}
                        />
                    </div> */}

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
                      {/* <TableCell align="center">{lastData.earliestStart}</TableCell>

                      <TableCell align="center"> {lastData.latestEnd}</TableCell>

                      <TableCell align="center" component="th" scope="row">
                        {this.convertToHoursAndMinutes(ttime.total_time)}
                      </TableCell> */}

                      {/* <TableCell align="center">{row.name}</TableCell> */}


                      {/* <TableCell align="center">
                        <Button
                          className="button_style"
                          variant="contained"
                          // color="primary"
                          size="small"
                        >
                          <Link
                            style={{
                              // backgroundColor: "#1C6758",
                              textDecoration: "none",
                              color: "black",
                            }}
                            to={`/profile/${row._id}`}
                            state={row}
                          >
                             Details
                          </Link>
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>


            <Previous />

            <Pagination
              count={this.state.pages}
              page={this.state.page}
              onChange={this.pageChange}
              color="primary"
            />
          </TableContainer>
          {/* 
          <div className="App">
            <header className="App-header">
              <h1>React Frontend</h1>
              {dataSent ? (
                <p></p>
              ) : (
                <button onClick={this.handleClick1}>Computer Usages</button>
              )}
            </header>
          </div>

          <div>
            <p>win_start: {lastData.win_start}</p>
            <p>win_end: {lastData.win_end}</p>
            <p>total_time: {lastData.total_time}</p>
          </div> */}
        </div>


        <AppBar
          position="static"
          style={{ backgroundColor: "#ffff", marginTop: "22%" }}
          elevation={0}
        >
          <Toolbar>
            {/* <div>
              <Button variant="contained" color="primary" href="/video">
                PC INFO
              </Button>
            </div> */}

            <div style={{ flexGrow: 1 }} />
            <div style={{ flexGrow: -2 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* <Button
                  variant="contained"
                  size="small"
                  onClick={this.handleProductOpen}
                >
                  <b> Add School</b>
                </Button>
                &nbsp; &nbsp;
                <Button variant="contained" size="small">
                  <b> Download </b>
                </Button>
                &nbsp; &nbsp;
                <Button variant="contained" size="small">
                  <b> Details </b>
                </Button> */}
                &nbsp;
                {/* <IconButton>
                  <SearchIcon style={{ color: "white" }} />
                </IconButton>
                <InputBase
                  placeholder="Search..."
                  style={{ marginLeft: 1, color: "white" }}
                  inputProps={{
                    style: { color: "white" },
                    placeholder: "SEARCH",
                  }}
                /> */}
                {/* {dataSent ? (
                  <p></p>
                ) : (
                  <Button
                    className="button_style"
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={this.handleClick1}
                  >
                    Exit
                  </Button>
                )} */}
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
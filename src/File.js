import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@material-ui/core";

const File = () => {
  const [data, setData] = useState([]);
  const [videoInfo, setVideoInfo] = useState([]);
  const [user, setUser] = useState(null);
  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchCSVData();
    fetchData();

    fetch("http://localhost:2000/userid")
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []);

  const fetchCSVData = () => {
    fetch("/video_information.csv")
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          complete: (results) => {
            setVideoInfo(results.data);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching CSV data:", error);
      });
  };

  const fetchData = () => {
    axios
      .get("http://localhost:2000/get-vd")
      .then((response) => {
        setData(response.data.videoData); // Access the videoData in the response
        let months = response.data.videoData.map((item) => { // Access the videoData in the response
          const date = new Date(item.start_date_time);
          if (!isNaN(date)) {
            return `${date.getFullYear()}-${date.getMonth() + 1}`;
          }
        });
        months = months.filter(Boolean);
        let uniqueMonths = [...new Set(months)];
        setUniqueMonths(uniqueMonths);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const insertAndFetchData = () => {
    axios
      .post("http://localhost:2000/videoinfo", {
        userId: user ? user.userid : null,
        videos: videoInfo,
      })
      .then(() => {
        fetchData();
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });
  };

  const selectMonth = (month) => {
    if (selectedMonth === month) {
      setSelectedMonth("");
    } else {
      setSelectedMonth(month);
    }
  };

  const downloadData = async (month) => {
    const filteredData = data.filter((item) => {
      const date = new Date(item.start_date_time);
      return `${date.getFullYear()}-${date.getMonth() + 1}` === month;
    });
  
    try {
      // Fetch the names from the API
      const response = await axios.get("http://localhost:2000/get-school");
  
      // Check if there are any beneficiaries in the response
      if (!response.data.beneficiary || response.data.beneficiary.length === 0) throw new Error("No beneficiaries found in response");
  
      // Extract the properties from the first beneficiary in the response
      const beneficiary = response.data.beneficiary[0];
      const lab = beneficiary.u_nm || "Unknown_Lab";
      const pcLab = beneficiary.f_nm || "Unknown_PCLab";
      const school = beneficiary.name || "Unknown_School";
      const eiin = beneficiary.beneficiaryId || "Unknown_EIIN";
  
      // Convert the numerical month to a month name
      const date = new Date();
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short'}).format(date.setMonth(month.split('-')[1] - 1));
  
      // Create CSV from the data
      const csv = Papa.unparse(filteredData);
  
      // Create a CSV Blob
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  
      // Create a link and click it to start the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${lab}_${pcLab}_${school}_${eiin}_${monthName}_data.csv`;
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };
  
  


  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={insertAndFetchData}
      >
        Refresh The Data
      </Button>
      <br />
      <br />
      <br />
      <br />
      <br />

      {uniqueMonths.map((month, index) => (
        <Box margin={2} key={index}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            style={{ width: "150px" }}
            onClick={() => selectMonth(month)}
          >
            {new Date(
              month.split("-")[0],
              month.split("-")[1] - 1
            ).toLocaleString("default", { month: "long" })}'s Video Data
          </Button>

          <div style={{ display: "inline", padding: "20px" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ width: "150px" }}
              onClick={() => downloadData(month)}
            >
              Download  {new Date(
              month.split("-")[0],
              month.split("-")[1] - 1
            ).toLocaleString("default", { month: "long" })} Data
            </Button>
          </div>
          <br/>

          {selectedMonth === month && (
            <TableContainer component={Paper}>
                        <br/>

              <Table style={{ width: "98%" }}>
                <TableHead >
                  <TableRow>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      Video Name
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      File Location
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      Player Starting
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      Start Video Time
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      Player Ending
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      End Video Time
                    </TableCell>
                    <TableCell
                      style={{ border: "1px solid black", fontSize: "10px" }}
                    >
                      Duration
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data
                    .filter((item) => {
                      const date = new Date(item.start_date_time);
                      return (
                        `${date.getFullYear()}-${date.getMonth() + 1}` ===
                        selectedMonth
                      );
                    })
                    .map((item, index) => (
                      <TableRow key={index}>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.video_name}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.location}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.pl_start}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.start_date_time}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.pl_end}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.end_date_time}
                        </TableCell>
                        <TableCell
                          style={{
                            border: "1px solid black",
                            fontSize: "10px",
                          }}
                        >
                          {item.duration}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}
    </div>
  );
};

export default File;

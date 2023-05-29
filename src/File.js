import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";

import Userid from "./Userid"; // Import Userid component

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
} from "@material-ui/core";

const File = () => {
  const [data, setData] = useState([]);
  const [videoInfo, setVideoInfo] = useState([]);
  const [user, setUser] = useState(null);
  const [showTable, setShowTable] = useState(false); // New state for table visibility

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
        setData(response.data);
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
        fetchData(); // Fetch the updated data after successful insertion
      })
      .catch((error) => {
        console.error("Error inserting data:", error);
      });
  };

  const toggleTable = () => { // New function to toggle table visibility
    setShowTable(prevShowTable => !prevShowTable);
  };

  return (
    <div>
      <Button
        className="button_style"
        variant="contained"
        color="primary"
        size="small"
        onClick={insertAndFetchData}
      >
        Refresh The Data
      </Button>
      <Button
        className="button_style"
        variant="contained"
        color="secondary"
        size="small"
        onClick={toggleTable}
      >
        {showTable ? "Hide Table" : "Show Table"}
      </Button>
      <br />
      <br />
      <br />
      <br /> <br />
      <div style={{ overflowX: "hidden", maxWidth: "97.6%" }}>
        {showTable && data.length > 0 && (
          <table
            style={{
              tableLayout: "fixed",
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid black", // Set table border color to black
            }}
          >
            <thead>
              <tr>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>Video Name</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>File Location</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>Player Starting</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>Start Video Time</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>Player Ending</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>End Video Time</th>
                <th style={{fontSize: "13px",border: "1px solid black",padding: "8px"}}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.slice().reverse().map((item, index) => (
                <tr key={index}>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.video_name}</td>
                  <td style={{fontSize: "9px",border: "1px solid black",padding: "8px"}}>{item.location}</td>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.pl_start}</td>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.start_date_time}</td>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.pl_end}</td>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.end_date_time}</td>
                  <td style={{fontSize: "10px",border: "1px solid black",padding: "8px"}}>{item.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default File;

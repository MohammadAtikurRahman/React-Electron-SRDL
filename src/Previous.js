import React, { Component } from "react";
import Papa from 'papaparse';

import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@material-ui/core";
import { Parser } from "json2csv";
import { saveAs } from "file-saver";

class Previous extends Component {
  state = {
    data: [],
    showTable: false,
    filteredData: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:2000/get-school");
      // Update the data to reflect the new data structure
      const data = response.data.pc.map((item, index) => {
        return { ...item, ...response.data.beneficiary[index] };
      });
      this.setState({ data });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
  showDataByMonth = (month) => {
    const { data, showTable } = this.state;
    const filteredData = data.filter((item) => {
      const itemMonth = new Date(item.earliestStart).toLocaleString("default", {
        month: "long",
      });
      return itemMonth.toLowerCase() === month.toLowerCase();
    });

    // Toggle showTable in the same setState call as filteredData
    this.setState({
      filteredData,
      showTable: !showTable, // Toggle showTable based on its current value
    });
  };

  // downloadCSV = () => {
  //   axios
  //     .get("http://localhost:2000/get-school")
  //     .then((response) => {
  //       const { data } = response;
  //       let csvContent = "data:text/csv;charset=utf-8,";

  //       // Add beneficiary data rows
  //       const beneficiaryHeaders = [
  //         "User Name",
  //         "EIIN",
  //         "School Name",
  //         "PC ID",
  //         "Lab ID",
  //       ];
  //       csvContent += beneficiaryHeaders.join(",") + "\r\n";
  //       data.beneficiary.forEach((item) => {
  //         const userName = `"${(item.m_nm || "").replace(/"/g, '""')}"`;
  //         const eiin = item.beneficiaryId;
  //         const name = item.name;

  //         const pcId = item.u_nm;
  //         const labId = item.f_nm;
  //         const row = [userName, eiin, name, pcId, labId];
  //         csvContent += row.join(",") + "\r\n";
  //       });

  //       // Add column headers for pc data
  //       const pcHeaders = ["Start Time", "End Time", "Total Time"];
  //       csvContent += pcHeaders.join(",") + "\r\n";

  //       // Add pc data rows
  //       data.pc.forEach((item) => {
  //         const startTime = `"${(item.earliestStart || "").replace(
  //           /"/g,
  //           '""'
  //         )}"`;
  //         const endTime = `"${(item.latestEnd || "").replace(/"/g, '""')}"`;
  //         const totalTime = `"${(item.total_time || "").replace(/"/g, '""')}"`;
  //         const row = [startTime, endTime, totalTime];
  //         csvContent += row.join(",") + "\r\n";
  //       });

  //       // Extract school name for file renaming
  //       const schoolName = data.beneficiary[0].name;
  //       const eiin = data.beneficiary[0].beneficiaryId;
  //       const pc_id = data.beneficiary[0].f_nm;

  //       // Extract month name from startTime
  //       const monthName = new Date(data.pc[0].earliestStart).toLocaleString(
  //         "default",
  //         { month: "long" }
  //       );

  //       // Include month name in the fileName
  //       const fileName = `pc_${schoolName}_ein_${eiin}_Pc_Id_${pc_id}_Month_${monthName}.csv`;

  //       // Create a download link
  //       const encodedUri = encodeURI(csvContent);
  //       const link = document.createElement("a");
  //       link.setAttribute("href", encodedUri);
  //       link.setAttribute("download", fileName);
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     })
  //     .catch((error) => {
  //       console.error("Error downloading CSV:", error);
  //     });
  // };
  downloadCSV = async (month) => {
    const { data } = this.state;
  
    // Filter the data for the specified month
    const monthData = data.filter((item) => {
      const itemMonth = new Date(item.earliestStart).toLocaleString("default", {
        month: "long",
      });
      return itemMonth.toLowerCase() === month.toLowerCase();
    });
  
    // If there's no data for the month, return early
    if (monthData.length === 0) return;
  
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
  
      // Convert the data to CSV
      const csv = Papa.unparse(monthData);
  
      // Create a CSV Blob
      const blob = new Blob([csv], { type: "text/csv" });
  
      // Create a link and click it to start the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${lab}_${pcLab}_${school}_${eiin}_${month}_data.csv`;
      link.click();
    } catch (error) {
      console.error("Error fetching names:", error);
    }
  };
  
  

  downloadData = () => {
    const parser = new Parser();
    const csv = parser.parse(this.state.data);
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `${new Date().getMonth() + 1}.csv`);
  };

  render() {
    const { data, showTable, filteredData } = this.state;
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    return (
      <div>
    <div style={{ textAlign: "center" }}>
  {data.length > 0 && (
    <>
      {Array.from(
        new Set(
          data.map((item) =>
            new Date(item.earliestStart).toLocaleString("default", {
              month: "long",
            })
          )
        )
      ).map((month) => (
        <div 
          key={month} 
          style={{ 
            marginBottom: "10px",
            display: "flex",
            justifyContent: "center",
            gap: "10px"
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.showDataByMonth(month)}
            style={{
              width: "200px",
              display: "block",
              marginBottom: "10px",
            }}
          >
            {month}'s PC Data
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.downloadCSV(month)}
            style={{
              width: "200px",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Download {month}'s Data
          </Button>
        </div>
      ))}
    </>
  )}
</div>

    
      {showTable && filteredData.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">Start Date & Time</TableCell>
                <TableCell align="center">Last Usage Date & Time</TableCell>
                <TableCell align="center">Duration</TableCell>
                {/* <TableCell align="center">School Name</TableCell>
                <TableCell align="center">PC Name</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell align="center">
                    {new Date(item.earliestStart).toLocaleString("en-GB", {
                      hour12: true,
                    })}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(item.latestEnd).toLocaleString("en-GB", {
                      hour12: true,
                    })}
                  </TableCell>
                  <TableCell align="center">{item.total_time}</TableCell>
                  {/* <TableCell align="center">{item.name}</TableCell>
                  <TableCell align="center">{item.m_nm}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
    
    );
  }
}

export default Previous;
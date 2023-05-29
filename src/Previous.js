import React, { Component } from "react";
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
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:2000/get-download");
      this.setState({ data: response.data });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  toggleShowTable = () => {
    this.setState((prevState) => ({ showTable: !prevState.showTable }));
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
          const startTime = `"${(item.earliestStart || "").replace(/"/g, '""')}"`;
          const endTime = `"${(item.latestEnd || "").replace(/"/g, '""')}"`;
          const totalTime = `"${(item.total_time || "").replace(/"/g, '""')}"`;
          const row = [startTime, endTime, totalTime];
          csvContent += row.join(",") + "\r\n";
        });

        // Extract school name for file renaming
        const schoolName = data.beneficiary[0].name;
        const eiin = data.beneficiary[0].beneficiaryId;
        const pc_id = data.beneficiary[0].f_nm;

        // Extract month name from startTime
        const monthName = new Date(data.pc[0].earliestStart).toLocaleString("default", { month: "long" });

        // Include month name in the fileName
        const fileName = `pc_${schoolName}_ein_${eiin}_Pc_Id_${pc_id}_Month_${monthName}.csv`;

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

  downloadData = () => {
    const parser = new Parser();
    const csv = parser.parse(this.state.data);
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `${new Date().getMonth() + 1}.csv`);
  };

  render() {
    const { data, showTable } = this.state;
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    return (
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={this.toggleShowTable}
          style={{ width: "200px", marginRight: "10px" }} // adjust the value as needed
        >
          {currentMonth}'s PC Data
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={this.downloadCSV}
          style={{ width: "200px" }} // adjust the value as needed
        >
          Download  {currentMonth} Data
        </Button>

        {showTable && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Start Date & Time</TableCell>
                  <TableCell align="center">Last Usage Date & Time</TableCell>
                  <TableCell align="center">Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice()
                  .reverse()
                  .map((item) => (
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

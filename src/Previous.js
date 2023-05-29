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
} from "@material-ui/core";

class Previous extends Component {
  state = {
    data: [],
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

  render() {
    const { data } = this.state;

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead></TableHead>
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
    );
  }
}

export default Previous;

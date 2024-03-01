import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
} from "@mui/material";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1, fontFamily: "Roboto" }}>{children}</Box>
      )}
    </div>
  );
};

const fontStyle = { textAlign: "left", fontWeight: "bold" };

const paperStyle = {
  width: "100%",
  padding: "16px 32px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
};

const TipHistorySheet = () => {
  const [tipHistory, setTipHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
    fetchTipHistory(newValue);
  };

  const fetchTipHistory = async (tabIndex) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken)
        throw new Error("No access token found. Please log in.");

      let url = "http://localhost:3333/tips/history";
      if (tabIndex === 1) url = "http://localhost:3333/tips/history-received";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setTipHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch tip history:", error);
    }
  };

  useEffect(() => {
    fetchTipHistory(tabValue);
  }, [tabValue]);

  //style and table structure below here
  return (
    <Container maxWidth="md" style={{ marginTop: "40px" }}>
      <Paper elevation={10} style={paperStyle}>
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Tips Sent" />
          <Tab label="Tips Received" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography
            variant="h4"
            style={{ textAlign: "center", fontWeight: "bold" }}
          >
            Tips Sent
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={fontStyle}>Sender</TableCell>
                <TableCell style={fontStyle}>Receiver</TableCell>
                <TableCell style={fontStyle}>Amount</TableCell>
                <TableCell style={fontStyle}>Time</TableCell>
                <TableCell style={fontStyle}>Date</TableCell>
                <TableCell style={fontStyle}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipHistory.map((tip, index) => (
                <TableRow key={index}>
                  <TableCell>{tip.senderUsername}</TableCell>
                  <TableCell>{tip.receiverUsername}</TableCell>
                  <TableCell>{tip.amount}</TableCell>
                  <TableCell>
                    {new Date(tip.tipTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {new Date(tip.tipTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{tip.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>
        {/*tips received below this line*/}
        <TabPanel value={tabValue} index={1}>
          <Typography
            variant="h4"
            style={{ textAlign: "center", fontWeight: "bold" }}
          >
            Tips Received
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={fontStyle}>Sender</TableCell>
                <TableCell style={fontStyle}>Receiver</TableCell>
                <TableCell style={fontStyle}>Amount</TableCell>
                <TableCell style={fontStyle}>Time</TableCell>
                <TableCell style={fontStyle}>Date</TableCell>
                <TableCell style={fontStyle}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipHistory.map((tip, index) => (
                <TableRow key={index}>
                  <TableCell>{tip.senderUsername}</TableCell>
                  <TableCell>{tip.receiverUsername}</TableCell>
                  <TableCell>{tip.amount}</TableCell>
                  <TableCell>
                    {new Date(tip.tipTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    {new Date(tip.tipTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{tip.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TipHistorySheet;

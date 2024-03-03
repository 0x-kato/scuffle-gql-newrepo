import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
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
import client from "../apollo-client";

const GET_TIPS_SENT = gql`
  query getTipsByUserId {
    getTipsByUserId {
      tip_id
      sender
      receiver
      amount
      tip_time
      status
    }
  }
`;

const GET_TIPS_RECEIVED = gql`
  query getTipsReceivedByUserId {
    getTipsReceivedByUserId {
      tip_id
      sender
      receiver
      amount
      tip_time
      status
    }
  }
`;

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
  const [tabValue, setTabValue] = useState(0);
  const [tipSentHistory, setTipSentHistory] = useState([]);
  const [tipReceivedHistory, setTipReceivedHistory] = useState([]);
  const userId = parseInt(localStorage.getItem("user_id")); // Make sure you have the user ID
  console.log(userId);

  const fetchTipHistorySent = async () => {
    try {
      const { data } = await client.query({ query: GET_TIPS_SENT });
      console.log(data); // Log the structure of your received data
      setTipSentHistory(data.getTipsByUserId || []);
    } catch (error) {
      console.error("Failed to fetch tip history:", error);
    }
  };

  const fetchTipHistoryReceived = async () => {
    try {
      const { data } = await client.query({ query: GET_TIPS_RECEIVED });
      console.log(data); // Log the structure of your received data
      setTipReceivedHistory(data.getTipsReceivedByUserId || []);
    } catch (error) {
      console.error("Failed to fetch tip history:", error);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      fetchTipHistorySent();
    } else {
      fetchTipHistoryReceived();
    }
  }, [tabValue]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "40px" }}>
      <Paper elevation={10} style={paperStyle}>
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Tips Sent" />
          <Tab label="Tips Received" />
        </Tabs>

        {
          <>
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
                    <TableCell style={fontStyle}>Receiver</TableCell>
                    <TableCell style={fontStyle}>Amount</TableCell>
                    <TableCell style={fontStyle}>Time</TableCell>
                    <TableCell style={fontStyle}>Date</TableCell>
                    <TableCell style={fontStyle}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tipSentHistory?.map((tip, index) => (
                    <TableRow key={index}>
                      <TableCell>{tip.receiver}</TableCell>
                      <TableCell>{tip.amount}</TableCell>
                      <TableCell>
                        {new Date(tip.tip_time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {new Date(tip.tip_time).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tip.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
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
                    <TableCell style={fontStyle}>Amount</TableCell>
                    <TableCell style={fontStyle}>Time</TableCell>
                    <TableCell style={fontStyle}>Date</TableCell>
                    <TableCell style={fontStyle}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tipReceivedHistory?.map((tip, index) => (
                    <TableRow key={index}>
                      <TableCell>{tip.sender}</TableCell>
                      <TableCell>{tip.amount}</TableCell>
                      <TableCell>
                        {new Date(tip.tip_time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        {new Date(tip.tip_time).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tip.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </>
        }
      </Paper>
    </Container>
  );
};

export default TipHistorySheet;

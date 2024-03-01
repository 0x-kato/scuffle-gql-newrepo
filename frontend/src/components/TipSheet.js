import React, { useCallback, useEffect, useState } from "react";
import {
  CssVarsProvider,
  Sheet,
  FormControl,
  FormLabel,
  Input,
  Button,
  Typography,
} from "@mui/joy";
import { gql, useApolloClient } from "@apollo/client";

const TipSheet = () => {
  const [receiverUsername, setReceiverUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const client = useApolloClient();

  const FETCH_BALANCE_QUERY = gql`
    query GetBalance {
      balance
    }
  `;

  const SEND_TIP_MUTATION = gql`
    mutation CreateTip($tipInput: TipsDto!) {
      createTip(tipInput: $tipInput)
    }
  `;

  const fetchBalance = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: FETCH_BALANCE_QUERY,
        fetchPolicy: "no-cache",
        refetchQueries: [{ query: FETCH_BALANCE_QUERY }],
      });
      console.log("Fetched balance:", data.balance);
      setBalance(data.balance);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  }, [client, FETCH_BALANCE_QUERY]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("You must be logged in to send a tip.");
      return;
    }

    try {
      const tipAmount = parseFloat(amount);
      if (isNaN(tipAmount)) {
        alert("Please enter a valid amount.");
        return;
      }

      const tipInput = {
        receiverUsername,
        amount: tipAmount,
      };

      const { data } = await client.mutate({
        mutation: SEND_TIP_MUTATION,
        variables: {
          tipInput,
        },
        context: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });

      if (data.createTip) {
        setSuccessMessage(
          `Tip of ${amount} sent successfully to ${receiverUsername}!`
        );
        setReceiverUsername("");
        setAmount("");
        await fetchBalance();
      } else {
        alert("Failed to send tip. Please try again.");
      }
    } catch (error) {
      console.error("Failed to send tip:", error);
      alert("Failed to send tip. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <CssVarsProvider>
      <Sheet
        sx={{
          width: 500,
          mx: "auto", // margin left & right
          my: 10, // margin top & bottom
          py: 4, // padding top & bottom
          px: 8, // padding left & right
          display: "flex",
          flexDirection: "column",
          gap: 6,
          borderRadius: "lg",
          boxShadow: "lg",
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography level="h1" component="h1">
          Send a tip!
        </Typography>
        <FormControl>
          <FormLabel>Receiver Username:</FormLabel>
          <Input
            name="username"
            placeholder="ScuffleUser"
            value={receiverUsername}
            onChange={(e) => setReceiverUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Amount:</FormLabel>
          <Input
            name="amount"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Typography level="body1" sx={{ textAlign: "left", mt: 1 }}>
            Your current balance: {balance}
          </Typography>
        </FormControl>
        {successMessage && (
          <Typography level="body1" sx={{ color: "green", mt: 2 }}>
            {successMessage}
          </Typography>
        )}
        <Button
          type="submit"
          sx={{
            backgroundColor: "black",
            "&:hover": { color: "white", backgroundColor: "#9e082b" },
          }}
        >
          Send tip!
        </Button>
      </Sheet>
    </CssVarsProvider>
  );
};

export default TipSheet;

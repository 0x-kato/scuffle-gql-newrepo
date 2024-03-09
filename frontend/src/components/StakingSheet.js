import { gql } from "@apollo/client";
import {
  CssVarsProvider,
  Sheet,
  FormControl,
  FormLabel,
  Input,
  Button,
  Typography,
} from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import client from "../apollo-client";

//should really break this apart into logic files and then import them here

const StakingSheet = () => {
  const [balance, setBalance] = useState(0);
  const [amountToStake, setAmountToStake] = useState("");
  const [amountToUnstake, setAmountToUnstake] = useState("");
  const [stakedBalance, setStakedBalance] = useState(0);
  const [successMessageStake, setSuccessMessageStake] = useState("");
  const [successMessageUnstake, setSuccessMessageUnstake] = useState("");
  const [stakingRewards, setStakingRewards] = useState(0); // update to rewards available
  const poolId = 1; // because manually made the staking pool -- makes it scalable if I want to add more pools later

  const FETCH_STAKED_BALANCE_QUERY = gql`
    query GetStake {
      getStake {
        amount
        interestAccumulated
      }
    }
  `;

  const FETCH_BALANCE_QUERY = gql`
    query GetBalance {
      balance
    }
  `;

  const STAKE_TOKENS_MUTATION = gql`
    mutation StakeTokens($stakeInput: StakeDto!) {
      stakeTokens(stakeInput: $stakeInput)
    }
  `;

  const UNSTAKE_TOKENS_MUTATION = gql`
    mutation UnstakeTokens($unstakeInput: StakeDto!) {
      unstakeTokens(unstakeInput: $unstakeInput)
    }
  `;

  const CLAIM_REWARDS_MUTATION = gql`
    mutation ClaimRewards {
      withdrawRewards
    }
  `;

  const fetchStakedBalance = useCallback(async () => {
    const accessToken = localStorage.getItem("access_token");
    const selectedPoolId = poolId;
    if (!accessToken) {
      alert("You must be logged in to view staked balance.");
      return;
    }
    try {
      const { data } = await client.query({
        query: FETCH_STAKED_BALANCE_QUERY,
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
            poolId: selectedPoolId,
          },
        },
        fetchPolicy: "no-cache",
      });
      console.log("Fetched staked balance:", data.getStake);
      setStakingRewards(data.getStake.interestAccumulated);
      setStakedBalance(data.getStake.amount);
    } catch (error) {
      console.error("Failed to fetch staked balance:", error);
    }
  }, [FETCH_STAKED_BALANCE_QUERY]);

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
  }, [FETCH_BALANCE_QUERY]);

  const handleSubmitStake = async (event) => {
    event.preventDefault();

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("You must be logged in to stake.");
      return;
    }

    try {
      const stakeAmount = parseFloat(amountToStake);
      if (isNaN(stakeAmount)) {
        alert("Please enter a valid amount.");
        return;
      }

      const stakeInput = {
        amount: stakeAmount,
      };

      const { data } = await client.mutate({
        mutation: STAKE_TOKENS_MUTATION,
        variables: {
          stakeInput,
        },
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
            poolId: poolId,
          },
        },
      });
      console.log("Stake response:", data);

      setSuccessMessageStake(`Successfully staked ${amountToStake} tokens.`);
      setAmountToStake("");
      fetchBalance();
      fetchStakedBalance();
    } catch (error) {
      console.error("Failed to stake tokens:", error);
      alert("Failed to stake tokens. Please try again.");
      setSuccessMessageStake("");
    }
  };

  const handleClaimRewards = async () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("You must be logged in to claim rewards.");
      return;
    }

    try {
      const { data } = await client.mutate({
        mutation: CLAIM_REWARDS_MUTATION,
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
            poolId: poolId,
          },
        },
      });
      console.log("Claim rewards response:", data);
      alert("Rewards successfully claimed.");
      fetchStakedBalance(); // Refresh staked balance and rewards
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      alert("Failed to claim rewards. Please try again.");
    }
  };

  const handleSubmitUnstake = async (event) => {
    event.preventDefault();
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("You must be logged in to unstake.");
      return;
    }

    try {
      const unstakeAmount = parseFloat(amountToUnstake);
      if (isNaN(unstakeAmount)) {
        alert("Please enter a valid amount.");
        return;
      }

      const unstakeInput = {
        amount: unstakeAmount,
      };

      const { data } = await client.mutate({
        mutation: UNSTAKE_TOKENS_MUTATION,
        variables: {
          unstakeInput,
        },
        context: {
          headers: {
            authorization: `Bearer ${accessToken}`,
            poolId: poolId,
          },
        },
      });
      console.log("Unstake response:", data);

      setSuccessMessageUnstake(
        `Successfully unstaked ${amountToUnstake} tokens.`
      );
      setAmountToUnstake("");
      fetchBalance();
      fetchStakedBalance();
    } catch (error) {
      console.error("Failed to unstake tokens:", error);
      alert("Failed to unstake tokens. Please try again");
      setSuccessMessageUnstake("");
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchStakedBalance();
  }, [fetchBalance, fetchStakedBalance]);

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
        onSubmit={handleSubmitStake}
      >
        <Typography level="h1" component="h1">
          Stake your tokens for 10% APY!
        </Typography>
        <FormControl>
          <FormLabel>Stake Tokens:</FormLabel>
          <Input
            name="amount"
            placeholder="0.00"
            value={amountToStake}
            onChange={(e) => setAmountToStake(e.target.value)}
          />
          <Typography level="body1" sx={{ textAlign: "left", mt: 1 }}>
            Your current balance: {balance}
          </Typography>
        </FormControl>
        {successMessageStake && (
          <Typography level="body1" sx={{ color: "green", mt: 2 }}>
            {successMessageStake}
          </Typography>
        )}
        <Button
          type="submit"
          sx={{
            backgroundColor: "black",
            "&:hover": { color: "white", backgroundColor: "#9e082b" },
          }}
        >
          Stake Tokens
        </Button>
      </Sheet>

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
        onSubmit={handleSubmitUnstake}
      >
        <Typography level="h1" component="h1">
          Unstake your tokens or claim rewards!
        </Typography>
        <Typography level="body1" sx={{ textAlign: "left", mt: 1 }}>
          Rewards available: {stakingRewards}
        </Typography>
        <Button
          onClick={handleClaimRewards}
          sx={{
            backgroundColor: "black",
            "&:hover": { color: "white", backgroundColor: "#9e082b" },
          }}
        >
          Claim Rewards
        </Button>

        <FormControl>
          <FormLabel>Unstake Tokens:</FormLabel>
          <Input
            name="amount"
            placeholder="0.00"
            value={amountToUnstake}
            onChange={(e) => setAmountToUnstake(e.target.value)}
          />
          <Typography level="body1" sx={{ textAlign: "left", mt: 1 }}>
            Your current balance staked: {stakedBalance}
          </Typography>
        </FormControl>

        <Button
          type="submit"
          sx={{
            backgroundColor: "black",
            "&:hover": { color: "white", backgroundColor: "#9e082b" },
          }}
        >
          Unstake Tokens
        </Button>
        {successMessageUnstake && (
          <Typography level="body1" sx={{ color: "green", mt: 2 }}>
            {successMessageUnstake}
          </Typography>
        )}
      </Sheet>
    </CssVarsProvider>
  );
};
export default StakingSheet;

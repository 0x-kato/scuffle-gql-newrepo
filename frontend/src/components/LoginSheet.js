import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { CssVarsProvider } from "@mui/joy/styles";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { login } from "./AuthService";
import { useNavigate } from "react-router-dom";

const boxSX = {
  backgroundColor: "black",
  "&:hover": {
    color: "white",
    backgroundColor: "#9e082b",
  },
};

const sheetSX = {
  width: 300,
  mx: "auto", // margin left & right
  my: 10, // margin top & bottom
  py: 5, // padding top & bottom
  px: 8, // padding left & right
  display: "flex",
  flexDirection: "column",
  gap: 2,
  borderRadius: "md",
  boxShadow: "lg",
};

const LoginSheet = () => {
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      localStorage.setItem("userId", data.user_id);
      console.log(data);
      setLoginSuccess(true);
      setErrorMessage("");
      navigate("/tips");
    } catch (error) {
      console.error("Failed to log in", error);
      setErrorMessage(error.message);
      setLoginSuccess(false);
    }
  };

  return (
    <CssVarsProvider>
      <Sheet sx={sheetSX} component="form" onSubmit={handleSubmit}>
        <div>
          <Typography level="h2" component="h1">
            Welcome to Scuffle.
          </Typography>
          <Typography level="body-sm">Sign in to continue.</Typography>
        </div>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            name="username"
            type="text"
            placeholder="degenerategambler"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {loginSuccess && (
          <Typography sx={{ color: "green", textAlign: "center", mt: 2 }}>
            Success!
          </Typography>
        )}
        {!loginSuccess && errorMessage && (
          <Typography sx={{ color: "red", textAlign: "left", mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Button type="submit" sx={boxSX}>
          Log in
        </Button>
        <Typography
          endDecorator={<Link to="/register">Sign up</Link>}
          fontSize="sm"
          sx={{ alignSelf: "center" }}
        >
          Don't have an account?
        </Typography>
      </Sheet>
    </CssVarsProvider>
  );
};

export default LoginSheet;

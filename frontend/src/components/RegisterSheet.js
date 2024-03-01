import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { CssVarsProvider } from "@mui/joy/styles";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { register } from "./AuthService";

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

const RegisterSheet = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(username, password);
      console.log(data);
      setRegisterSuccess(true);
      setErrorMessage("");
      navigate("/tips");
    } catch (error) {
      setRegisterSuccess(false);
      setErrorMessage(error.message);
    }
  };

  return (
    <CssVarsProvider>
      <Sheet sx={sheetSX} component="form" onSubmit={handleSubmit}>
        <div>
          <Typography level="h2" component="h1">
            Register here!
          </Typography>
          <Typography level="body-sm">
            Enter your information in the fields below.
          </Typography>
        </div>
        <FormControl>
          <FormLabel>Username</FormLabel>
          <Input
            name="username"
            type="username"
            placeholder="reeeee"
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
        {registerSuccess && (
          <Typography sx={{ color: "green", textAlign: "center", mt: 2 }}>
            Success!
          </Typography>
        )}
        {!registerSuccess && errorMessage && (
          <Typography sx={{ color: "red", textAlign: "center", mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
        <Button type="submit" sx={boxSX}>
          Register
        </Button>
        <Typography
          endDecorator={<Link to="/">Log in</Link>}
          fontSize="sm"
          sx={{ alignSelf: "center" }}
        >
          Already signed up?
        </Typography>
      </Sheet>
    </CssVarsProvider>
  );
};

export default RegisterSheet;

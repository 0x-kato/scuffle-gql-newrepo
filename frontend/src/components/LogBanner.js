import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";

//banner which exempts the name in the top right for logged in user
//also gets rid of the menu
// easier to do it this way rater than set up logic for it, but also repeating code which is bad
function LogBanner() {
  const auth = React.useState(true);
  const username = localStorage.getItem("username") || null;
  const isUsernameValid = username && username !== "undefined";

  return (
    <Box sx={{ flexGrow: 1 }}>
      <FormGroup></FormGroup>
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <Typography
            variant="h4"
            component="div"
            sx={{ fontFamily: "Monospace", fontWeight: "bold", flexGrow: 1 }}
          >
            SCUFFLE
          </Typography>
          {auth && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {isUsernameValid && (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ marginRight: 2 }}
                >
                  {username}
                </Typography>
              )}
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default LogBanner;

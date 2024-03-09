import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import FormGroup from "@mui/material/FormGroup";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { useNavigate } from "react-router-dom";
import { logout } from "./AuthService";

function Banner() {
  const [auth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || null;
  const isUsernameValid = username && username !== "undefined";

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStakingSheet = () => {
    setAnchorEl(null);
    navigate("/staking");
  };

  const handleSendTip = () => {
    setAnchorEl(null);
    navigate("/tips");
  };

  const handleTippingHistory = () => {
    setAnchorEl(null);
    navigate("/tip-history");
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setAnchorEl(null);
    try {
      await logout();
      console.log("successful logout");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    navigate("/");
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <FormGroup></FormGroup>
      <AppBar position="static" sx={{ backgroundColor: "#000000" }}>
        <Toolbar>
          <Typography
            variant="h4"
            component="div"
            sx={{
              fontFamily: "Roboto, sans-serif",
              fontWeight: "bold",
              flexGrow: 1,
            }}
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

              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleSendTip}>Send Tip</MenuItem>
                <MenuItem onClick={handleTippingHistory}>
                  Tipping History
                </MenuItem>
                <MenuItem onClick={handleStakingSheet}>Staking</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default Banner;

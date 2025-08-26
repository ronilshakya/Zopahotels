import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark", // sets dark mode globally
    primary: {
      main: "#1976d2", // blue
    },
    secondary: {
      main: "#9c27b0", // purple
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#ff9800",
    },
    error: {
      main: "#f44336",
    },
    background: {
      default: "#121212", // dark background
      paper: "#1e1e1e",  // card background
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0b0b0",
    },
  },
});

export default darkTheme;

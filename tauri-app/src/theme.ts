import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFD700", // 골드
    },
    secondary: {
      main: "#00FFB0", // 민트
    },
    background: {
      default: "#101315",
      paper: "#181A20",
    },
    success: {
      main: "#00FFB0",
    },
    error: {
      main: "#FF4C4C",
    },
    warning: {
      main: "#FFD700",
    },
    info: {
      main: "#00BFFF",
    },
    text: {
      primary: "#f5f5f5",
      secondary: "#FFD700",
      disabled: "#8a8a8a",
    },
    divider: "#bfa14a",
  },
  typography: {
    fontFamily: "Pretendard, Noto Sans KR, Montserrat, Inter, sans-serif",
    fontWeightBold: 900,
    h5: {
      fontWeight: 900,
      letterSpacing: 1.5,
      color: "#f5f5f5",
    },
    h6: {
      fontWeight: 800,
      color: "#bfa14a",
    },
    button: {
      textTransform: "none",
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: 1,
    },
    body1: {
      color: "#f5f5f5",
      fontWeight: 500,
    },
    body2: {
      color: "#bfa14a",
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
          fontWeight: 800,
          fontSize: 18,
          padding: "12px 28px",
        },
        containedPrimary: {
          backgroundColor: "#bfa14a",
          color: "#101315",
          border: "2.5px solid #bfa14a",
          '&:hover': { backgroundColor: "#d4c08a", color: "#101315" },
        },
        outlinedPrimary: {
          border: "2.5px solid #bfa14a",
          color: "#bfa14a",
          background: "#101315",
          '&:hover': { backgroundColor: "#bfa14a", color: "#101315" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background: "#181c1b",
          border: "2px solid #bfa14a",
          color: "#f5f5f5",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "#101315",
          color: "#bfa14a",
          borderBottom: "2px solid #bfa14a",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "#181c1b",
          color: "#bfa14a",
          borderRight: "2px solid #bfa14a",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#181c1b",
          border: "2px solid #bfa14a",
          color: "#f5f5f5",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 900,
          fontSize: 17,
          border: "2px solid #bfa14a",
          background: "#101315",
          color: "#bfa14a",
          padding: "6px 16px",
        },
      },
    },
  },
});

export default darkTheme; 
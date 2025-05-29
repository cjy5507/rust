import { createTheme } from "@mui/material/styles";

const rolexTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#c9b037", // 롤렉스 골드
      light: "#f4d03f",
      dark: "#b8860b",
      contrastText: "#0d1117",
    },
    secondary: {
      main: "#2c3e50", // 다크 네이비
      light: "#34495e",
      dark: "#1a252f",
      contrastText: "#f0f6fc",
    },
    background: {
      default: "#0a0e13", // 더 깊은 다크 배경
      paper: "#13181f", // 카드 배경
    },
    surface: {
      main: "#1a202c", // 추가 서페이스 컬러
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    text: {
      primary: "#f8fafc", // 가장 밝은 텍스트
      secondary: "#c9b037", // 골드 텍스트
      disabled: "#64748b",
    },
    divider: "#334155",
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#c9b037',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2rem',
      color: '#c9b037',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#c9b037',
      lineHeight: 1.3,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#f8fafc',
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#f8fafc',
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      color: '#f8fafc',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#e2e8f0',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: '#cbd5e1',
      lineHeight: 1.5,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      color: '#e2e8f0',
      lineHeight: 1.6,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      color: '#cbd5e1',
      lineHeight: 1.6,
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      color: '#94a3b8',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      textTransform: "none",
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
    "0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
    "0 10px 15px rgba(0,0,0,0.4), 0 4px 6px rgba(0,0,0,0.3)",
    "0 20px 25px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.3)",
    "0 25px 50px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.4)",
    // ... 나머지 shadows
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          background: 'linear-gradient(135deg, #0a0e13 0%, #0f172a 100%)',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#1e293b',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#475569',
          borderRadius: '4px',
          '&:hover': {
            background: '#64748b',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
          textTransform: "none",
          fontSize: '0.875rem',
          padding: '10px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
          color: "#0a0e13",
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(201, 176, 55, 0.3)',
          '&:hover': { 
            background: 'linear-gradient(135deg, #f4d03f 0%, #c9b037 100%)',
            boxShadow: '0 8px 25px rgba(201, 176, 55, 0.5)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0px)',
          },
          '&:disabled': {
            background: "#475569",
            color: "#94a3b8",
            boxShadow: 'none',
          }
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: "#f8fafc",
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)',
          },
        },
        outlinedPrimary: {
          borderColor: "#c9b037",
          color: "#c9b037",
          borderWidth: 2,
          '&:hover': { 
            backgroundColor: "rgba(201, 176, 55, 0.1)",
            borderColor: "#f4d03f",
            borderWidth: 2,
          },
        },
        textPrimary: {
          color: "#c9b037",
          '&:hover': {
            backgroundColor: "rgba(201, 176, 55, 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#13181f",
          backgroundImage: 'none',
          border: "1px solid #334155",
          boxShadow: "0 10px 32px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        elevation1: {
          boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)",
        },
        elevation2: {
          boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)",
        },
        elevation3: {
          boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 6px 16px rgba(0,0,0,0.4)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#13181f",
          border: "1px solid #334155",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: "rgba(201, 176, 55, 0.6)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.6), 0 8px 20px rgba(201, 176, 55, 0.2)",
            transform: 'translateY(-4px)',
          }
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8rem',
          height: 32,
          borderRadius: 8,
        },
        colorDefault: {
          backgroundColor: "#475569",
          color: "#e2e8f0",
          border: "1px solid #64748b",
        },
        colorPrimary: {
          backgroundColor: "rgba(201, 176, 55, 0.2)",
          color: "#c9b037",
          border: "1px solid rgba(201, 176, 55, 0.5)",
        },
        colorSuccess: {
          backgroundColor: "rgba(16, 185, 129, 0.2)",
          color: "#10b981",
          border: "1px solid rgba(16, 185, 129, 0.5)",
        },
        colorError: {
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.5)",
        },
        colorWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.2)",
          color: "#f59e0b",
          border: "1px solid rgba(245, 158, 11, 0.5)",
        },
        colorInfo: {
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          color: "#3b82f6",
          border: "1px solid rgba(59, 130, 246, 0.5)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: "#0a0e13",
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#475569',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#64748b',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c9b037',
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#94a3b8',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#c9b037',
            },
            '&.Mui-error': {
              color: '#ef4444',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: '#f8fafc',
            fontWeight: 500,
          },
          '& .MuiInputAdornment-root .MuiSvgIcon-root': {
            color: '#64748b',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "#0a0e13",
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#475569',
            borderWidth: 2,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#64748b',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c9b037',
            borderWidth: 2,
          },
        },
        icon: {
          color: '#c9b037',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: "#13181f",
          color: "#f8fafc",
          fontWeight: 500,
          '&:hover': {
            backgroundColor: "rgba(201, 176, 55, 0.1)",
          },
          '&.Mui-selected': {
            backgroundColor: "rgba(201, 176, 55, 0.2)",
            '&:hover': {
              backgroundColor: "rgba(201, 176, 55, 0.3)",
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#64748b',
          '&.Mui-checked': {
            color: '#c9b037',
          },
          '&:hover': {
            backgroundColor: 'rgba(201, 176, 55, 0.1)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
          color: "#0a0e13",
          boxShadow: '0 8px 24px rgba(201, 176, 55, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f4d03f 0%, #c9b037 100%)',
            transform: 'scale(1.05) translateY(-2px)',
            boxShadow: '0 12px 32px rgba(201, 176, 55, 0.6)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#13181f",
          backgroundImage: 'none',
          borderBottom: "1px solid #334155",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#13181f",
          borderRight: "1px solid #334155",
          backgroundImage: 'none',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          fontSize: '0.75rem',
          fontWeight: 500,
          border: "1px solid #475569",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        },
        arrow: {
          color: "#1e293b",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#475569",
          borderRadius: 4,
        },
        bar: {
          backgroundColor: "#c9b037",
          borderRadius: 4,
        },
      },
    },
  },
});

// 커스텀 색상 추가
declare module '@mui/material/styles' {
  interface Palette {
    surface: Palette['primary'];
  }
  interface PaletteOptions {
    surface?: PaletteOptions['primary'];
  }
}

export default rolexTheme;

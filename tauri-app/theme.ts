import {createTheme} from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: [
      'Montserrat',
      'Pretendard',
      'Noto Sans KR',
      'Inter',
      'Roboto',
      'Apple SD Gothic Neo',
      'sans-serif',
    ].join(','),
    fontWeightBold: 900,
    fontWeightMedium: 700,
    fontWeightRegular: 500,
  },
}); 
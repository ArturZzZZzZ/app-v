import { createTheme } from '@mui/material/styles';
import { purple, green } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b3d5b",
    },
    secondary: {
      main: green[500],
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        containedPrimary: {
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: '#fff',  // Selected background color
            color: '#000',            // Selected font color
            '&:hover': {
              backgroundColor: '#f0f0f0', // Slightly darker shade on hover when selected
            },
          },
          '&:hover': {
            backgroundColor: purple[700],
          },
        },
        containedSecondary: {
          backgroundColor: green[500],
          color: '#fff',
          '&:hover': {
            backgroundColor: green[700],
          },
        },
        outlinedPrimary: {
          borderColor: purple[500],
          color: purple[500],
          '&:hover': {
            borderColor: purple[700],
            color: purple[700],
          },
        },
        outlinedSecondary: {
          borderColor: green[500],
          color: green[500],
          '&:hover': {
            borderColor: green[700],
            color: green[700],
          },
        },
      },
    },
  },
});

export default theme;
// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // Будем переключать этот параметр для темного и светлого режимов
        primary: {
            main: '#0D47A1', // Темно-синий цвет
        },
        secondary: {
            main: '#FF6F00', // Ярко-оранжевый цвет
        },
        background: {
            default: '#F5F5F5',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
});

export default theme;

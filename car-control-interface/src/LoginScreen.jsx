import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function LoginScreen({ onLogin }) {
    return (
        <Box
            sx={{
                backgroundColor: '#121212',
                color: '#fff',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box sx={{ width: 300 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Авторизация
                </Typography>
                <TextField
                    label="Логин"
                    variant="filled"
                    fullWidth
                    margin="normal"
                    InputProps={{ style: { color: '#fff' } }}
                    InputLabelProps={{ style: { color: '#fff' } }}
                />
                <TextField
                    label="Пароль"
                    type="password"
                    variant="filled"
                    fullWidth
                    margin="normal"
                    InputProps={{ style: { color: '#fff' } }}
                    InputLabelProps={{ style: { color: '#fff' } }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={onLogin}
                    sx={{ mt: 2 }}
                >
                    Войти
                </Button>
            </Box>
        </Box>
    );
}

export default LoginScreen;

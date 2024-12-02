import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Button,
    Select,
    MenuItem,
    TextField,
    Card,
    CardContent,
    LinearProgress,
    IconButton,
    Tooltip,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import {
    Speed as SpeedIcon,
    BatteryChargingFull as BatteryIcon,
    CameraAlt as CameraIcon,
    Refresh as RefreshIcon,
    PowerSettingsNew as PowerOffIcon,
    Send as SendIcon,
    SettingsInputHdmi as PortIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


function ControlPanel() {
    // Состояния компонента
    const [port, setPort] = useState(localStorage.getItem('selectedPort') || '');
    const [command, setCommand] = useState('');
    const [response, setResponse] = useState('');
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [commandError, setCommandError] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const theme = useTheme();

    // Переключение темы
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Обновление темы при переключении режима
    useEffect(() => {
        theme.palette.mode = darkMode ? 'dark' : 'light';
    }, [darkMode, theme.palette]);

    // Обработка изменения порта
    const handlePortChange = (event) => {
        const selectedPort = event.target.value;
        setPort(selectedPort);
        localStorage.setItem('selectedPort', selectedPort);
    };

    // Обработка отправки команды
    const handleSendCommand = () => {
        if (command.trim() === '') {
            setCommandError(true);
            return;
        }
        setCommandError(false);
        setIsLoading(true);
        // Имитация отправки команды
        setTimeout(() => {
            setResponse(`Ответ на команду: ${command}`);
            setIsLoading(false);
            setSnackbarOpen(true);
        }, 2000);
    };

    // Обработка изменения команды
    const handleCommandChange = (e) => {
        setCommand(e.target.value);
        setCommandError(e.target.value.trim() === '');
    };

    // Обработка клика по камере
    const handleCameraClick = (cam) => {
        setSelectedCamera(selectedCamera === cam ? null : cam);
    };

    const cameraList = ['Front', 'Left', 'Back', 'Right'];

    return (
        <Box sx={{ padding: 2 }}>
            {/* Верхняя панель */}
            <Grid container justifyContent="space-between" alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    🚗 Система управления машиной
                </Typography>
                <Box display="flex" alignItems="center">
                    {/* Переключатель темы */}
                    <Tooltip title="Переключить тему">
                        <IconButton onClick={toggleDarkMode} color="inherit">
                            {theme.palette.mode === 'dark' ? (
                                <Brightness7Icon />
                            ) : (
                                <Brightness4Icon />
                            )}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Переподключиться">
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<RefreshIcon />}
                            sx={{ mr: 2 }}
                        >
                            Переподключиться
                        </Button>
                    </Tooltip>
                    <Tooltip title="Отключиться">
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<PowerOffIcon />}
                        >
                            Отключиться
                        </Button>
                    </Tooltip>
                </Box>
            </Grid>

            {/* Основная область */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
                {/* Блок с камерами */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ height: '100%', borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📷 Камеры
                            </Typography>
                            <Box>
                                {selectedCamera ? (
                                    <>
                                        {/* Верхняя строка с уменьшенными камерами */}
                                        <Grid container spacing={1}>
                                            {cameraList
                                                .filter((cam) => cam !== selectedCamera)
                                                .map((cam) => (
                                                    <Grid item xs={4} key={cam}>
                                                        <Box
                                                            onClick={() => handleCameraClick(cam)}
                                                            sx={{
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                borderRadius: 2,
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    boxShadow: 6,
                                                                    transform: 'scale(1.02)',
                                                                    transition: 'all 0.3s ease-in-out',
                                                                },
                                                                transition: 'all 0.3s ease-in-out',
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: '#1e1e1e',
                                                                    height: 80,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: '#fff',
                                                                    borderRadius: 2,
                                                                    boxShadow: 3,
                                                                    transition: 'all 0.3s ease-in-out',
                                                                }}
                                                            >
                                                                {`Камера ${cam}`}
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                        </Grid>
                                        {/* Выбранная камера */}
                                        <Box
                                            onClick={() => handleCameraClick(selectedCamera)}
                                            sx={{
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: 2,
                                                cursor: 'pointer',
                                                mt: 1,
                                                '&:hover': {
                                                    boxShadow: 6,
                                                    transform: 'scale(1.01)',
                                                    transition: 'all 0.3s ease-in-out',
                                                },
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: '#1e1e1e',
                                                    height: 320,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    borderRadius: 2,
                                                    boxShadow: 3,
                                                    transition: 'all 0.3s ease-in-out',
                                                }}
                                            >
                                                {`Камера ${selectedCamera}`}
                                            </Box>
                                        </Box>
                                    </>
                                ) : (
                                    <Grid container spacing={1}>
                                        {cameraList.map((cam) => (
                                            <Grid item xs={6} key={cam}>
                                                <Box
                                                    onClick={() => handleCameraClick(cam)}
                                                    sx={{
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        borderRadius: 2,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            boxShadow: 6,
                                                            transform: 'scale(1.02)',
                                                            transition: 'all 0.3s ease-in-out',
                                                        },
                                                        transition: 'all 0.3s ease-in-out',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            backgroundColor: '#1e1e1e',
                                                            height: 180,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff',
                                                            borderRadius: 2,
                                                            boxShadow: 3,
                                                            transition: 'all 0.3s ease-in-out',
                                                        }}
                                                    >
                                                        {`Камера ${cam}`}
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Правая колонка */}
                <Grid item xs={12} md={5}>
                    {/* Информация о машине */}
                    <Card sx={{ mb: 2, borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                ℹ️ Информация о машине
                            </Typography>
                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                <SpeedIcon sx={{ mr: 1 }} color="action" />
                                <Typography sx={{ flexGrow: 1 }}>Скорость: 84 км/ч</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={84}
                                    sx={{
                                        width: '30%',
                                        height: 10,
                                        borderRadius: 5,
                                        animation: 'progressAnimation 2s ease-in-out',
                                    }}
                                />
                            </Box>
                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                <BatteryIcon sx={{ mr: 1 }} color="action" />
                                <Typography sx={{ flexGrow: 1 }}>Аккумулятор: 26%</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={26}
                                    color="secondary"
                                    sx={{
                                        width: '30%',
                                        height: 10,
                                        borderRadius: 5,
                                        animation: 'progressAnimation 2s ease-in-out',
                                    }}
                                />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                {['Cam_01', 'Cam_02', 'Cam_03', 'Cam_04'].map((cam) => (
                                    <Box key={cam} display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                                        <CameraIcon sx={{ mr: 1 }} color="action" />
                                        <Typography>{`${cam}: Enabled`}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* GPS-трекер */}
                    <Card sx={{ mb: 2, borderRadius: 4 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                🗺️ GPS-трекер
                            </Typography>
                            <MapContainer
                                center={[51.505, -0.09]}
                                zoom={13}
                                style={{ height: 200, width: '100%', marginTop: 10 }}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[51.505, -0.09]}>
                                    <Popup>Текущая позиция автомобиля</Popup>
                                </Marker>
                            </MapContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Нижняя часть с командами и подключением */}
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {/* Отправка команд машине */}
                        <Grid item xs={12} md={7}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        💻 Отправка команд машине
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <TextField
                                            label="Команда"
                                            value={command}
                                            onChange={handleCommandChange}
                                            error={commandError}
                                            helperText={commandError ? 'Команда не может быть пустой' : ''}
                                            sx={{ flexGrow: 1, mr: 2 }}
                                        />
                                        <Button
                                            variant="contained"
                                            endIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
                                            onClick={handleSendCommand}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Отправка...' : 'Отправить'}
                                        </Button>
                                    </Box>
                                    {response && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1">Ответ от машины:</Typography>
                                            <Typography>{response}</Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Выбор порта для подключения */}
                        <Grid item xs={12} md={5}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        🔌 Выбор порта для подключения
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <PortIcon sx={{ mr: 1 }} color="action" />
                                        <Select
                                            value={port}
                                            onChange={handlePortChange}
                                            sx={{ flexGrow: 1, mr: 2 }}
                                        >
                                            <MenuItem value="port_1">port_1</MenuItem>
                                            <MenuItem value="port_2">port_2</MenuItem>
                                            <MenuItem value="port_3">port_3</MenuItem>
                                            <MenuItem value="port_4">port_4</MenuItem>
                                        </Select>
                                        <Button variant="contained" color="primary">
                                            Подключить
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Уведомление Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message="Команда успешно отправлена"
            />
        </Box>
    );
}

export default ControlPanel;

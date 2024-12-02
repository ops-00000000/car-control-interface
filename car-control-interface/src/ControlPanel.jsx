// ControlPanel.jsx
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
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useWebSocketClient } from './useWebSocketClient';
import { useKeycloak } from '@react-keycloak/web';

function ControlPanel({ darkMode, toggleDarkMode }) {
    // Состояния компонента
    const [port, setPort] = useState(localStorage.getItem('selectedPort') || '');
    const [command, setCommand] = useState('');
    const [response, setResponse] = useState('');
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [commandError, setCommandError] = useState(false);
    const [portStatus, setPortStatus] = useState('idle'); // 'idle', 'connecting', 'error', 'ready'
    const [cameraEnabled, setCameraEnabled] = useState(false); // Новое состояние для камер

    const theme = useTheme();

    // Использование WebSocket клиента
    const { messages, sendMessage, status: wsStatus } = useWebSocketClient('ws://127.0.0.1:9090');

    // Использование Keycloak
    const { keycloak } = useKeycloak();

    // Обработка изменения порта
    const handlePortChange = (event) => {
        const selectedPort = event.target.value;
        setPort(selectedPort);
        localStorage.setItem('selectedPort', selectedPort);
        // Сброс состояния порта при изменении
        setPortStatus('idle');
    };

    // Обработка отправки команды
    const handleSendCommand = () => {
        if (command.trim() === '') {
            setCommandError(true);
            return;
        }
        setCommandError(false);
        setIsLoading(true);
        // Отправка команды через WebSocket
        sendMessage(command);
        // Очистка поля ввода и обновление состояния
        setCommand('');
        setIsLoading(false);
        setResponse('Команда отправлена');
        setSnackbarOpen(true);
    };

    // Обработка изменения команды
    const handleCommandChange = (e) => {
        setCommand(e.target.value);
        setCommandError(e.target.value.trim() === '');
    };

    // Обработка клика по камере
    const handleCameraClick = (cam) => {
        if (!cameraEnabled) return; // Камеры отключены по умолчанию
        setSelectedCamera(selectedCamera === cam ? null : cam);
    };

    // Обработка подключения к порту
    const handleConnectPort = () => {
        if (!port) return;
        setPortStatus('connecting');

        // Имитация процесса подключения с таймаутом 2 минуты
        const connectTimeout = setTimeout(() => {
            setPortStatus('error');
            setSnackbarOpen(true);
        }, 120000); // 2 минуты

        // Имитация успешного подключения через 5 секунд
        const successTimeout = setTimeout(() => {
            clearTimeout(connectTimeout);
            setPortStatus('ready');
            setSnackbarOpen(true);
            setCameraEnabled(true); // Включение камер после успешного подключения
        }, 5000);

        // Очистка таймаутов при размонтировании или изменении порта
        return () => {
            clearTimeout(connectTimeout);
            clearTimeout(successTimeout);
        };
    };

    // Автоматическое подключение при выборе порта
    useEffect(() => {
        if (port) {
            handleConnectPort();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [port]);

    // Обработка сообщений WebSocket
    useEffect(() => {
        if (messages.length > 0) {
            // Здесь вы можете обработать полученные сообщения
            setResponse(`Ответ от машины: ${messages[messages.length - 1]}`);
            setSnackbarOpen(true);
        }
    }, [messages]);

    // Обработка выхода из системы
    const handleLogout = () => {
        keycloak.logout();
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
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Переподключиться">
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<RefreshIcon />}
                            sx={{ mr: 2 }}
                            onClick={() => window.location.reload()}
                        >
                            Переподключиться
                        </Button>
                    </Tooltip>
                    <Tooltip title="Отключиться">
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<PowerOffIcon />}
                            onClick={handleLogout} // Используем функцию выхода
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
                                                        <Tooltip title={`Открыть Камеру ${cam}`}>
                                                            <Box
                                                                onClick={() => handleCameraClick(cam)}
                                                                sx={{
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    borderRadius: 2,
                                                                    cursor: cameraEnabled ? 'pointer' : 'not-allowed',
                                                                    opacity: cameraEnabled ? 1 : 0.5,
                                                                    '&:hover': cameraEnabled
                                                                        ? {
                                                                            boxShadow: 6,
                                                                            transform: 'scale(1.02)',
                                                                            transition: 'all 0.3s ease-in-out',
                                                                        }
                                                                        : {},
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
                                                        </Tooltip>
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
                                                cursor: cameraEnabled ? 'pointer' : 'not-allowed',
                                                opacity: cameraEnabled ? 1 : 0.5,
                                                mt: 1,
                                                '&:hover': cameraEnabled
                                                    ? {
                                                        boxShadow: 6,
                                                        transform: 'scale(1.01)',
                                                        transition: 'all 0.3s ease-in-out',
                                                    }
                                                    : {},
                                                transition: 'all 0.3s ease-in-out',
                                            }}
                                        >
                                            <Tooltip title={`Закрыть Камеру ${selectedCamera}`}>
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
                                            </Tooltip>
                                        </Box>
                                    </>
                                ) : (
                                    <Grid container spacing={1}>
                                        {cameraList.map((cam) => (
                                            <Grid item xs={6} key={cam}>
                                                <Tooltip title={`Открыть Камеру ${cam}`}>
                                                    <Box
                                                        onClick={() => handleCameraClick(cam)}
                                                        sx={{
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            borderRadius: 2,
                                                            cursor: cameraEnabled ? 'pointer' : 'not-allowed',
                                                            opacity: cameraEnabled ? 1 : 0.5,
                                                            '&:hover': cameraEnabled
                                                                ? {
                                                                    boxShadow: 6,
                                                                    transform: 'scale(1.02)',
                                                                    transition: 'all 0.3s ease-in-out',
                                                                }
                                                                : {},
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
                                                </Tooltip>
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
                                    attribution="" // Убираем атрибуцию
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
                                            disabled={isLoading || !cameraEnabled}
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
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>Выберите порт</em>
                                            </MenuItem>
                                            <MenuItem value="port_1">port_1</MenuItem>
                                            <MenuItem value="port_2">port_2</MenuItem>
                                            <MenuItem value="port_3">port_3</MenuItem>
                                            <MenuItem value="port_4">port_4</MenuItem>
                                        </Select>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleConnectPort}
                                            disabled={portStatus === 'connecting' || portStatus === 'ready' || port === ''}
                                        >
                                            Подключить
                                        </Button>
                                    </Box>

                                    {/* Состояния подключения */}
                                    <Box sx={{ mt: 2 }}>
                                        {portStatus === 'connecting' && (
                                            <Box display="flex" alignItems="center">
                                                <HourglassEmptyIcon color="action" sx={{ mr: 1 }} />
                                                <Typography>Подключение...</Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        ml: 1,
                                                        '& > *': {
                                                            marginLeft: '2px',
                                                            width: '6px',
                                                            height: '6px',
                                                            backgroundColor: 'secondary.main',
                                                            borderRadius: '50%',
                                                            animation: 'dotFlashing 1.4s infinite both',
                                                        },
                                                        '& > *:nth-of-type(1)': {
                                                            animationDelay: '-0.32s',
                                                        },
                                                        '& > *:nth-of-type(2)': {
                                                            animationDelay: '-0.16s',
                                                        },
                                                    }}
                                                >
                                                    <Box />
                                                    <Box />
                                                    <Box />
                                                </Box>
                                            </Box>
                                        )}
                                        {portStatus === 'error' && (
                                            <Box display="flex" alignItems="center" sx={{ color: 'error.main' }}>
                                                <ErrorIcon sx={{ mr: 1 }} />
                                                <Typography>Ошибка подключения</Typography>
                                            </Box>
                                        )}
                                        {portStatus === 'ready' && (
                                            <Box display="flex" alignItems="center" sx={{ color: 'success.main' }}>
                                                <CheckCircleIcon sx={{ mr: 1 }} />
                                                <Typography>Готово к работе</Typography>
                                            </Box>
                                        )}
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
                message={
                    portStatus === 'error'
                        ? 'Ошибка подключения к порту'
                        : response
                }
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}

export default ControlPanel;

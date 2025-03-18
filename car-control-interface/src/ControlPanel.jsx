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
    Divider,
    Chip,
    Paper,
    Avatar,
    alpha,
    Badge
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
    Speed as SpeedIcon,
    BatteryChargingFull as BatteryIcon,
    BatteryAlert as BatteryAlertIcon,
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
    SettingsRemote as SettingsRemoteIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useWebSocketClient } from './useWebSocketClient';
import { useKeycloak } from './useKeycloak';

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
    const [commandHistory, setCommandHistory] = useState([]); // История команд
    const [showCommandHistory, setShowCommandHistory] = useState(false); // Показать/скрыть историю команд

    const theme = useTheme();

    // Использование Keycloak
    const { keycloak } = useKeycloak();

    // Использование WebSocket клиента с токеном
    const { messages, sendMessage } = useWebSocketClient(keycloak.token);

    // Примеры быстрых команд
    const quickCommands = [
        { label: 'Статус', command: 'status' },
        { label: 'Остановить', command: 'stop' },
        { label: 'Запустить', command: 'start' },
        { label: 'Диагностика', command: 'diagnostics' }
    ];

    // Обработка изменения порта
    const handlePortChange = (event) => {
        const selectedPort = event.target.value;
        setPort(selectedPort);
        localStorage.setItem('selectedPort', selectedPort);
        // Сброс состояния порта при изменении
        setPortStatus('idle');
    };

    // Обработка отправки команды
    const handleSendCommand = (cmd = command) => {
        const commandToSend = cmd || command;

        if (commandToSend.trim() === '') {
            setCommandError(true);
            return;
        }
        setCommandError(false);
        setIsLoading(true);
        // Отправка команды через WebSocket
        sendMessage(commandToSend);

        // Добавление команды в историю
        setCommandHistory(prev => [commandToSend, ...prev.slice(0, 9)]);

        // Очистка поля ввода и обновление состояния
        setCommand('');
        setIsLoading(false);
        setResponse(`Команда отправлена: ${commandToSend}`);
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
        setCameraEnabled(false); // Отключаем камеры до завершения подключения

        // Имитация процесса подключения с таймаутом 2 минуты
        const connectTimeout = setTimeout(() => {
            setPortStatus('error');
            setSnackbarOpen(true);
            setCameraEnabled(false);
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

    // Получить цвет для отображения уровня заряда батареи
    const getBatteryColor = (level) => {
        if (level <= 15) return 'error';
        if (level <= 30) return 'warning';
        return 'success';
    };

    // Получить статус для температуры двигателя
    const getTemperatureStatus = (temp) => {
        if (temp >= 90) return 'error';
        if (temp >= 75) return 'warning';
        return 'success';
    };

    return (
        <Box sx={{
            padding: { xs: 1, sm: 2 },
            maxWidth: '1400px',
            margin: '0 auto',
            backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.7)
                : alpha(theme.palette.background.paper, 0.9),
            minHeight: '100vh',
            borderRadius: { sm: 1 }
        }}>
            {/* Верхняя панель */}
            <Card sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 3,
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(45deg, ${alpha(theme.palette.primary.dark, 0.6)}, ${alpha(theme.palette.secondary.dark, 0.4)})`
                    : `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.3)}, ${alpha(theme.palette.secondary.light, 0.2)})`
            }}>
                <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 50,
                                height: 50
                            }}>
                                <DirectionsCarIcon fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    Система управления машиной
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Статус: {portStatus === 'ready' ? 'Онлайн' : portStatus === 'connecting' ? 'Подключение...' : 'Не подключено'}
                                </Typography>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            {/* Кнопка уведомлений */}
                            <Tooltip title="Уведомления">
                                <IconButton>
                                    <Badge badgeContent={1} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            {/* Переключатель темы */}
                            <Tooltip title="Переключить тему">
                                <IconButton onClick={toggleDarkMode} color="inherit" sx={{
                                    bgcolor: alpha(theme.palette.background.paper, 0.2),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.background.paper, 0.3),
                                    }
                                }}>
                                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Переподключиться">
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={() => window.location.reload()}
                                    sx={{ borderRadius: 4 }}
                                >
                                    Переподключиться
                                </Button>
                            </Tooltip>

                            <Tooltip title="Отключиться">
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<PowerOffIcon />}
                                    onClick={handleLogout}
                                    sx={{ borderRadius: 4 }}
                                >
                                    Отключиться
                                </Button>
                            </Tooltip>
                        </Box>
                    </Grid>
                </CardContent>
            </Card>

            {/* Основная область */}
            <Grid container spacing={2}>
                {/* Блок с камерами */}
                <Grid item xs={12} md={7}>
                    <Card sx={{
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                        }
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CameraIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Камеры
                                </Typography>
                                <Box flexGrow={1} />
                                <Chip
                                    label={cameraEnabled ? "Активно" : "Неактивно"}
                                    color={cameraEnabled ? "success" : "default"}
                                    size="small"
                                    sx={{ mr: 1 }}
                                />
                            </Box>

                            <Divider sx={{ mb: 2 }} />

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
                                                                        background: theme.palette.mode === 'dark'
                                                                            ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`
                                                                            : `linear-gradient(to bottom, ${alpha('#f5f5f5', 0.9)}, ${alpha('#e0e0e0', 0.8)})`,
                                                                        height: 80,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        borderRadius: 2,
                                                                        boxShadow: 1,
                                                                        position: 'relative',
                                                                        overflow: 'hidden',
                                                                        '&::before': {
                                                                            content: '""',
                                                                            position: 'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            right: 0,
                                                                            bottom: 0,
                                                                            background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.palette.mode === 'dark' ? '444' : 'ddd'}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                                                            zIndex: 0
                                                                        }
                                                                    }}
                                                                >
                                                                    <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <CameraIcon fontSize="small" sx={{ mb: 0.5 }} />
                                                                        <Typography variant="body2">Камера {cam}</Typography>
                                                                    </Box>
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
                                                        background: theme.palette.mode === 'dark'
                                                            ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`
                                                            : `linear-gradient(to bottom, ${alpha('#f5f5f5', 0.9)}, ${alpha('#e0e0e0', 0.8)})`,
                                                        height: 320,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: 2,
                                                        boxShadow: 2,
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.palette.mode === 'dark' ? '444' : 'ddd'}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                                            zIndex: 0
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: theme.palette.primary.main,
                                                            width: 60,
                                                            height: 60,
                                                            mb: 2
                                                        }}>
                                                            <CameraIcon fontSize="large" />
                                                        </Avatar>
                                                        <Typography variant="h6">Камера {selectedCamera}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Нажмите, чтобы закрыть выбранную камеру
                                                        </Typography>
                                                    </Box>
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
                                                                background: theme.palette.mode === 'dark'
                                                                    ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`
                                                                    : `linear-gradient(to bottom, ${alpha('#f5f5f5', 0.9)}, ${alpha('#e0e0e0', 0.8)})`,
                                                                height: 180,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: 2,
                                                                boxShadow: 1,
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    background: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.palette.mode === 'dark' ? '444' : 'ddd'}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                                                                    zIndex: 0
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <Avatar sx={{
                                                                    bgcolor: theme.palette.primary.main,
                                                                    width: 40,
                                                                    height: 40,
                                                                    mb: 1
                                                                }}>
                                                                    <CameraIcon />
                                                                </Avatar>
                                                                <Typography variant="body1">Камера {cam}</Typography>
                                                                {!cameraEnabled && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                                        Недоступно - требуется подключение
                                                                    </Typography>
                                                                )}
                                                            </Box>
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
                    <Card sx={{
                        mb: 2,
                        borderRadius: 2,
                        boxShadow: 3,
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                        }
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                                    <InfoIcon />
                                </Avatar>
                                <Typography variant="h6" component="h2">
                                    Информация о машине
                                </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {/* Скорость */}
                            <Box display="flex" alignItems="center" sx={{ mb: 1.5, p: 1, borderRadius: 1, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, mr: 2 }}>
                                    <SpeedIcon fontSize="small" />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 'medium' }}>Скорость</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="h6" sx={{ mr: 1 }}>84</Typography>
                                        <Typography variant="body2" color="text.secondary">км/ч</Typography>
                                        <Box sx={{ ml: 'auto', width: '40%' }}>
                                            <Tooltip title="84/120 км/ч">
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={70} // 84/120 * 100
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 5,
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Аккумулятор */}
                            <Box display="flex" alignItems="center" sx={{
                                mb: 1.5,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.background.default, 0.4),
                                borderLeft: `4px solid ${theme.palette[getBatteryColor(26)].main}`
                            }}>
                                <Avatar sx={{
                                    bgcolor: alpha(theme.palette[getBatteryColor(26)].main, 0.8),
                                    width: 36,
                                    height: 36,
                                    mr: 2
                                }}>
                                    {26 <= 20 ? <BatteryAlertIcon fontSize="small" /> : <BatteryIcon fontSize="small" />}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 'medium' }}>Аккумулятор</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="h6" sx={{ mr: 1 }}>26</Typography>
                                        <Typography variant="body2" color="text.secondary">%</Typography>
                                        <Box sx={{ ml: 'auto', width: '40%' }}>
                                            <Tooltip title="26%">
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={26}
                                                    color={getBatteryColor(26)}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5,
                                                        backgroundColor: alpha(theme.palette[getBatteryColor(26)].main, 0.2),
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 5,
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Температура двигателя */}
                            <Box display="flex" alignItems="center" sx={{
                                mb: 1.5,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: alpha(theme.palette.background.default, 0.4),
                                borderLeft: `4px solid ${theme.palette[getTemperatureStatus(68)].main}`
                            }}>
                                <Avatar sx={{
                                    bgcolor: alpha(theme.palette[getTemperatureStatus(68)].main, 0.8),
                                    width: 36,
                                    height: 36,
                                    mr: 2
                                }}>
                                    <DeviceThermostatIcon fontSize="small" />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 'medium' }}>Температура двигателя</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="h6" sx={{ mr: 1 }}>68</Typography>
                                        <Typography variant="body2" color="text.secondary">°C</Typography>
                                    </Box>
                                </Box>
                            </Box>



                            {/* Камеры - улучшенный вид */}
                            <Typography variant="body1" sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}>
                                Статус камер:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                {cameraList.map((cam, index) => (
                                    <Chip
                                        key={cam}
                                        icon={<CameraIcon fontSize="small" />}
                                        label={`Cam_${cam}: ${cameraEnabled ? 'Активна' : 'Неактивна'}`}
                                        color={cameraEnabled ? "success" : "default"}
                                        variant={cameraEnabled ? "filled" : "outlined"}
                                        size="small"
                                        sx={{
                                            borderRadius: '8px',
                                            fontWeight: cam === selectedCamera ? 'bold' : 'normal'
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Предупреждения */}
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1.5,
                                    mt: 2,
                                    bgcolor: alpha(theme.palette.warning.light, 0.7),
                                    borderColor: theme.palette.warning.main,
                                    borderRadius: 2
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                                    <Typography variant="body2" color="warning.dark" fontWeight="medium">
                                        Низкий заряд батареи: требуется подзарядка
                                    </Typography>
                                </Box>
                            </Paper>
                        </CardContent>
                    </Card>

                    {/* GPS-трекер - перемещен внутрь Grid */}
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
                                    attribution=""
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
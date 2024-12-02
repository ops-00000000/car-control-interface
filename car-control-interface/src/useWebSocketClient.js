// useWebSocketClient.js
import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocketClient(url) {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
    const ws = useRef(null);
    const reconnectInterval = useRef(null);

    const connect = useCallback(() => {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
            setStatus('connected');
            // Очистить интервал переподключения при успешном подключении
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
                reconnectInterval.current = null;
            }
        };

        ws.current.onmessage = (event) => {
            console.log('Received:', event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setStatus('error');
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket Disconnected:', event.reason);
            setStatus('disconnected');
            // Попытка переподключения через 5 секунд
            if (!reconnectInterval.current) {
                reconnectInterval.current = setInterval(() => {
                    console.log('Attempting to reconnect to WebSocket...');
                    connect();
                }, 5000);
            }
        };
    }, [url]);

    useEffect(() => {
        setStatus('connecting');
        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
            }
        };
    }, [connect]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        } else {
            console.error('WebSocket is not open. Unable to send message:', message);
        }
    };

    return { messages, sendMessage, status };
}

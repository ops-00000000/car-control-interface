// src/useWebSocketClient.js
import { useState, useEffect, useRef } from 'react';

export function useWebSocketClient(token) {
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);
    const car_id = "cmMtY2FyLWNsaWVudCMwMDE="; // car id in base64

    useEffect(() => {
        if (!token) {
            return;
        }

        const wsUrl = `wss://81.200.149.133:9000/?jwt=${token}&car_id=${car_id}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.current.onmessage = (event) => {
            console.log('Received:', event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.current.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [token]);

    const sendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(message);
        } else {
            console.error('WebSocket is not open. Unable to send message:', message);
        }
    };

    return { messages, sendMessage };
}

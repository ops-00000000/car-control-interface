// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css'; // Импорт глобальных стилей
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';

const eventLogger = (event, error) => {
    console.log('onKeycloakEvent', event, error);
};

const tokenLogger = (tokens) => {
    console.log('onKeycloakTokens', tokens);
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
    <React.StrictMode>
        <ReactKeycloakProvider
            authClient={keycloak}
            onEvent={eventLogger}
            onTokens={tokenLogger}
            initOptions={{
                onLoad: 'login-required', // Требовать вход при загрузке
                checkLoginIframe: false, // Отключить iframe проверки
            }}
        >
            <App />
        </ReactKeycloakProvider>
    </React.StrictMode>
);

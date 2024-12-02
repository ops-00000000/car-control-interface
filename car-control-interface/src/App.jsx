import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import ControlPanel from './ControlPanel';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        // Реализуйте логику авторизации
        setIsLoggedIn(true);
    };

    return isLoggedIn ? <ControlPanel /> : <LoginScreen onLogin={handleLogin} />;
}

export default App;
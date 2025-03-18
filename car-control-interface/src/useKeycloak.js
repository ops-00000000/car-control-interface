// // src/useKeycloak.js
// import { useKeycloak as useKeycloakOriginal } from '@react-keycloak/web';
//
// export function useKeycloak() {
//     const { keycloak, initialized } = useKeycloakOriginal();
//     return { keycloak, initialized };
// }

// Временная замена для useKeycloak.js
import { useState, useEffect } from 'react';

export const useKeycloak = () => {
    const [keycloakState, setKeycloakState] = useState({
        keycloak: {
            authenticated: true,
            token: 'fake-token',
            logout: () => console.log('Logout called')
        },
        initialized: true
    });

    return keycloakState;
};
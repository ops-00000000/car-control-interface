// keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'https://<YOUR_KEYCLOAK_SERVER>/auth', // URL вашего Keycloak сервера
    realm: '<YOUR_REALM>', // Ваш Realm
    clientId: '<YOUR_CLIENT_ID>', // ID клиента
});

export default keycloak;

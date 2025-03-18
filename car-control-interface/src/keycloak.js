// // src/keycloak.js
// import Keycloak from 'keycloak-js';
//
// const keycloak = new Keycloak({
//     url: 'https://81.200.149.133:8443/auth', // URL вашего Keycloak сервера
//     realm: 'default', // Ваш Realm
//     clientId: 'rc-frontend-1', // ID клиента
// });
//
// export default keycloak;

// Заглушка для keycloak.js
const keycloak = {
    init: () => Promise.resolve(true),
    login: () => {},
    logout: () => {},
    updateToken: () => Promise.resolve(true)
};

export default keycloak;
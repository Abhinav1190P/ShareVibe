import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Replace this firebaseConfig object with the congurations for the project you created on your firebase console. 
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

initializeApp(firebaseConfig);

const messaging = getMessaging();


export const requestForToken = () => {
    return getToken(messaging, { vapidKey: 'BM9Em-YjtBC8AXddELomlqWfhXofCJGNRDw7QHpCVVx2WOHBO2siHeAMeOokFYiNJfr0kU9GZAFEjdA4UOEQQZ8' })
        .then((currentToken) => {
            if (currentToken) {
                return currentToken
                console.log('current token for client: ', currentToken);
            } else {
                // Show permission request UI
                console.log('No registration token available. Request permission to generate one.');
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("payload", payload)
            resolve(payload);
        });
    });
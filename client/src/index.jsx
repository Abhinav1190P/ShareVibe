import React from "react";
import ReactDOM from "react-dom/client";
import "nprogress/nprogress.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from './contexts/NotificationContext';
import { TabProvider } from './contexts/TabContext'
import App from "./App";
import { ChakraProvider } from '@chakra-ui/react' // Similar to the other wrappers around App, Chakra UI provides its own UI wrapper, that ensures that everything inside the App is based on the UI library
import './styles.css'; // Import custom scrollbar styles
import { registerServiceWorker } from "./registerServiceWorker";

registerServiceWorker()

ReactDOM.createRoot(document.getElementById("root")).render(
  <ChakraProvider>
      <BrowserRouter>
        <NotificationsProvider>
          <TabProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </TabProvider>
        </NotificationsProvider>
      </BrowserRouter>
  </ChakraProvider>
);

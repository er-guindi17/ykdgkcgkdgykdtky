import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://8e2a6d330b669e2b10f2160f6e251f04@o4510168287281152.ingest.de.sentry.io/4510168290689104",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true
});

const container = document.getElementById(“app”);
const root = createRoot(container);
root.render(<App />);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

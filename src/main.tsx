
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css'

import { Buffer } from 'buffer';

// Polyfill global object
if (typeof window.global === 'undefined') {
    window.global = global;
}

// Polyfill Buffer
if (typeof window.Buffer === 'undefined') {
    window.Buffer = Buffer;
}


Amplify.configure(outputs);



ReactDOM.createRoot(document.getElementById("root")!).render(
  
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
);

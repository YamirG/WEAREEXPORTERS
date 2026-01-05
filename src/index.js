import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Importamos BrowserRouter
import "./styles.css";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <BrowserRouter> {/* ✅ Envolvemos App con el Router */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
root.render(
  <BrowserRouter>
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
      <App />
    </GoogleReCaptchaProvider>
  </BrowserRouter>
);


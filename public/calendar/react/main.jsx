import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// This has our "Themes" dark, light, high-contrast.
// It could be swapped to a App level CSS based on our "Theme" css.
import "./styles.css";
// The wrapper around the entire app that provides the theme context as well as the theme select UI.
import Home from "./component/home";
import { ThemeProvider } from "./context/themeProvider";

function init(selector, props) {
    const container = document.querySelector(selector);
    if (container) {
        const root = createRoot(container);
        root.render(<ThemeProvider>
            <Home />
            <App {...props} />
        </ThemeProvider>);
    }
}

// Expose to global so AMD shim can call it
window.ReactApp = { init };

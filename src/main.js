import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
const router = createBrowserRouter([
    {
        element: _jsx(AppLayout, {}),
        children: [
            { path: '/', element: _jsx(Dashboard, {}) },
            { path: '/devices', element: _jsx(Devices, {}) },
            { path: '/analytics', element: _jsx(Analytics, {}) },
        ]
    }
]);
createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(RouterProvider, { router: router }) }));

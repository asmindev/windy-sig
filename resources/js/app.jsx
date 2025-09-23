import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { initializeTheme } from './lib/theme';
import { route } from './ziggy-config.js';
import { Ziggy } from './ziggy.js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name.replace('.', '/')}.jsx`,
            import.meta.glob('./pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize Ziggy routes
        if (typeof window !== 'undefined') {
            window.Ziggy = Ziggy;
            // Make route function available globally
            window.route = route;
        }

        // Initialize theme on app startup
        initializeTheme();

        root.render(
            <>
                <App {...props} />
                <Toaster richColors closeButton position="top-right" />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                dracula: {
                    bg: '#282a36',
                    current: '#44475a',
                    fg: '#f8f8f2',
                    comment: '#6272a4',
                    'comment-accessible': '#8a9bc4',
                    cyan: '#8be9fd',
                    green: '#50fa7b',
                    orange: '#ffb86c',
                    pink: '#ff79c6',
                    purple: '#bd93f9',
                    red: '#ff5555',
                    yellow: '#f1fa8c',
                },
                comoon: {
                    purple: '#9986bf',
                },
                leader: {
                    DEFAULT: '#2dd4bf',
                    light: '#5eead4',
                    dark: '#14b8a6',
                },
                entrepreneur: {
                    DEFAULT: '#22c55e',
                    light: '#4ade80',
                    dark: '#16a34a',
                },
                community: {
                    DEFAULT: '#f59e0b',
                    light: '#fbbf24',
                    dark: '#d97706',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};

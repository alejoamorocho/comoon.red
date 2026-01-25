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
                    cyan: '#8be9fd',
                    green: '#50fa7b',
                    orange: '#ffb86c',
                    pink: '#ff79c6',
                    purple: '#bd93f9',
                    red: '#ff5555',
                    yellow: '#f1fa8c',
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

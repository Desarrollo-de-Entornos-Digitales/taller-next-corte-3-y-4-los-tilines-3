import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Proxy/rewrite desactivado para pruebas de CORS directas
    // async rewrites() {
    //     return [
    //         {
    //             source: '/api/:path*',
    //             destination: 'http://localhost:3001/:path*', // Proxy hacia tu backend
    //         },
    //     ];
    // },
};

export default nextConfig;

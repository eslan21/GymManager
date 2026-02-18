/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Esto permite que el build termine incluso si hay warnings de ESLint
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;

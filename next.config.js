/** @type {import('next').NextConfig} */
const nextConfig = {
    // Turbopack config (Next.js 16 default)
    turbopack: {},

    experimental: {
        serverActions: {
            bodySizeLimit: '10mb'
        }
    },

    // Webpack config for WASM support (fallback)
    webpack: (config) => {
        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });
        config.module.rules.push({
            test: /\.wasm$/,
            type: 'asset/resource',
        });
        return config;
    },
}

module.exports = nextConfig

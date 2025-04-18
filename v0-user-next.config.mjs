import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add a resolve alias for @radix-ui/react-use-effect-event
    config.resolve.alias['@radix-ui/react-use-effect-event'] = path.resolve(__dirname, './lib/use-effect-event-patch.js');
    
    return config;
  },
}

export default nextConfig; 
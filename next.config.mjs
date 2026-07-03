/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow the dev server assets/HMR to be served when the app is reached
  // through the public IP (and localhost). Add any other host you use here.
  allowedDevOrigins: [
    "173.212.225.96",
    "localhost",
    "127.0.0.1",
  ],
}

export default nextConfig

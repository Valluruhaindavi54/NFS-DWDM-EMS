/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
       domains: ["i.pravatar.cc","cdn-icons-png.flaticon.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.jdmagicbox.com",
      },
    ],
  },
};

module.exports = nextConfig;

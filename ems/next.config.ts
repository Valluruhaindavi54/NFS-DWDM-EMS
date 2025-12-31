/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
       domains: ["i.pravatar.cc"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.jdmagicbox.com",
      },
    ],
  },
};

module.exports = nextConfig;

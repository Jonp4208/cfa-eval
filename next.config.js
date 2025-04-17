/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.ld-growth.com',
          },
        ],
        destination: 'https://ld-growth.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 
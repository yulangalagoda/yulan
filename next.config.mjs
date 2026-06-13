/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  // Keep the dev server's cache away from `next build` output: building while
  // `next dev` is running otherwise corrupts the dev server (blank/unstyled
  // pages, random "reading 'call'" errors) until it is restarted. The dev
  // process always has NODE_ENV=development; build stages vary, so they all
  // fall through to the standard '.next'.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
};

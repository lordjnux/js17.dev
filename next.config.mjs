import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCodeOptions]],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/cv',
        destination: '/CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER.pdf',
        permanent: true,
      },
      {
        source: '/resume',
        destination: '/CV-JEROHAM-SANCHEZ-SR-FULLSTACK-ENGINEER.pdf',
        permanent: true,
      },
    ]
  },
}

export default withMDX(nextConfig)

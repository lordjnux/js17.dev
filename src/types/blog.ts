export interface PostFrontmatter {
  title: string
  description: string
  date: string
  tags: string[]
  published: boolean
  author?: string
  coverImage?: string
  readingTime?: number
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
  excerpt: string
}

export interface PostHeading {
  id: string
  text: string
  level: number
}

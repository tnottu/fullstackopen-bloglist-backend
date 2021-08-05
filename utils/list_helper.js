const countBy = require('lodash/countBy')
const sortBy = require('lodash/sortBy')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs = []) => {
  const likes = blogs.reduce((total, blog) => {
    return total + (blog.likes || 0)
  }, 0)
  return likes
}

const favoriteBlog = (blogs = []) => {
  const favorite = blogs.reduce((favorite, blog) => {
    if (!favorite || blog.likes > favorite.likes) {
      const newFavorite = {
        title: blog.title,
        author: blog.author,
        likes: blog.likes,
      }
      return newFavorite
    }
    return favorite
  }, null)
  return favorite
}

const mostBlogs = (blogs = []) => {
  const blogCountsByAuthor = Object.entries(countBy(blogs, 'author' ))
    .map((authorBlogCounts) => ({ author: authorBlogCounts[0], blogs: authorBlogCounts[1] }))
  const blogCountsByAuthorSorted = sortBy(blogCountsByAuthor, ['blogs']).reverse()
  return blogCountsByAuthorSorted[0] || null
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
}

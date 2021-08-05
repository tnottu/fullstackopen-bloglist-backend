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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}

const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('blog api', () => {

  test('all blogs are returned as json', async () => {
    const response = await api.get('/api/blogs')
    expect(response.status).toBe(200)
    expect(response.type).toBe('application/json')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('blog posts have unique identifiers named id', async () => {
    const response = await api.get('/api/blogs')
    response.body .forEach((blog) => {
      expect(blog.id).toBeDefined()
    })
  })

})

afterAll(() => {
  mongoose.connection.close()
})

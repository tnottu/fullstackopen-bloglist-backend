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

  test('a valid blog post can be added', async () => {
    const newBlog = {
      title: 'Excession',
      author: 'Iain M. Banks',
      url: 'https://en.wikipedia.org/wiki/Excession',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const returnedBlog = blogsAtEnd[blogsAtEnd.length - 1]
    delete returnedBlog.id
    expect(newBlog).toEqual(returnedBlog)
  })

})

afterAll(() => {
  mongoose.connection.close()
})
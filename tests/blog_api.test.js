const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let token

beforeAll(async () => {
  await User.deleteMany({})

  const testUser = new User(helper.testUser.db)
  await testUser.save()

  const loginResponse = await api
    .post('/api/login')
    .send(helper.testUser.login)

  token = loginResponse.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('blog api get methods', () => {

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

describe('blog api post methods', () => {

  test('a valid blog post can be added', async () => {
    const newBlog = {
      title: 'Excession',
      author: 'Iain M. Banks',
      url: 'https://en.wikipedia.org/wiki/Excession',
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const returnedBlog = blogsAtEnd[blogsAtEnd.length - 1]
    delete returnedBlog.id
    delete returnedBlog.user
    expect(newBlog).toEqual(returnedBlog)
  })

  test('likes -property defaults to zero', async () => {
    const newBlog = {
      title: 'Consider Phlebas',
      author: 'Iain M. Banks',
      url: 'https://en.wikipedia.org/wiki/Consider_Phlebas',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    const returnedBlog = blogsAtEnd[blogsAtEnd.length - 1]
    expect(returnedBlog.likes).toBe(0)
  })

  test('creating blog post should fail with status code 400 if title or url missing', async () => {
    const newBlog = {
      author: 'Iain M. Banks',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
  }, 10000)

})

describe('blog api delete methods', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const idsAtEnd = blogsAtEnd.map(b => b.id)

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    expect(idsAtEnd).not.toContain(blogToDelete.id)
  })

  test('fails with status code 401 if token is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const result = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    expect(result.body.error).toContain('invalid token')
  })

})

describe('blog api put methods', () => {

  test('can update blog post information if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const blog = {
      title: 'Dune',
      author: 'Frank Herbert',
      url: 'https://en.wikipedia.org/wiki/Dune_(novel)',
      likes: 412,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd[0]

    delete updatedBlog.id
    delete updatedBlog.user

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
    expect(updatedBlog).toEqual(blog)
  })

})

afterAll(() => {
  mongoose.connection.close()
})

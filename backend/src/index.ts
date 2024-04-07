import { Hono } from 'hono'

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, jwt, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()
app.use('/api/v1/blog/*', async (c, next) => {
  const header = c.req.header("authorization") || "";
  const response = await verify(header, c.env.JWT_SECRET)
  if (response.id) {
    next()
  } else {
    c.status(403)
    return c.json({ error: "unauthorized" })
  }

})
app.post('/api/v1/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  try {

    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    })
    console.log(newUser);
    const token = await sign({
      id: newUser.id
    }, c.env.JWT_SECRET)

    return c.json({ token })
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signup" })

  }
})
app.post('/api/v1/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  const body = await c.req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      }

    })
    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }
    const token = await sign({
      id: user.id
    }, c.env.JWT_SECRET)
    return c.json({ token })
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signin" })

  }
})
app.post('/api/v1/blog', (c) => {
  return c.text("blog")
})
app.put('/api/v1/blog', (c) => {
  return c.text("blog update")
})
app.get('/api/v1/blog/:id', (c) => {
  return c.text("blog of id ")
})




export default app

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

userRouter.post('/signup', async (c) => {
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
userRouter.post('/signin', async (c) => {
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
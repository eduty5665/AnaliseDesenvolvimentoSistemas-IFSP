import fastify from 'fastify'
import { productsRoutes } from './routes/products'
const app = fastify()

app.register(productsRoutes)

app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send({ message: 'Validation error.', issues: error.format() })
    }
  
    console.error(error)
  
    return reply.status(500).send({ message: 'Internal server error.' })
  })

app.listen({ port: 3333}).then(() => {
    console.log('Servidor HTTP está rodando!')
})
import { FastifyInstance } from "fastify"
import { z } from 'zod'
import { prisma } from "../lib/prisma"

export async function productsRoutes(app: FastifyInstance){
    app.post('/products', async (request, reply) => {
        const bodyValidationSchema = z.object({
            title: z.string().min(1),
            price: z.number().positive(),
            category: z.string().min(1)

        })

        const { title, price, category } = bodyValidationSchema.parse(request.body)

        await prisma.product.create({
            data: {
                title,
                price,
                category
            }
        })
        return reply.status(201).send()
    })

    app.get('/products', async (request, reply) => {
        const products = await prisma.product.findMany()

        return reply.status(200).send({ products })
    })

}
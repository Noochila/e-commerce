import express from "express"
export const orderRouter = express.Router()
import db from "../db"
import { Prisma } from "../db"
import zod, { boolean } from "zod"



const orderSchema = zod.object({
  userId: zod.number().int().positive("User ID must be a positive integer"),
  products: zod.array(
    zod.object({
      productId: zod.number().int().positive("Product ID must be a positive integer"),
      quantity: zod.number().int().positive("Quantity must be a positive integer"),
    })
  ).nonempty("Products array cannot be empty"),
});


orderRouter.get("/",async (req, res) => {
  const orders =await db.order.findMany({ select: { id: true, orderDate: true, userId: true, products: { select: { productId: true, quantity: true } } } })
  res.json({
    orders: orders
  })
})

const validate = (schema: zod.Schema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof zod.ZodError) {

        res.status(400).json({
          message: error.errors[0].message,
        })
      }
    }
  };
}

orderRouter.post("/", validate(orderSchema), async (req, res) => {
  try {
    // Find user
    const user = await db.user.findUnique({
      where: { id: req.body.userId },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return; // Explicitly return to avoid further execution
    }

    // Validate products and check stock availability
    const products = req.body.products;
    for (const product of products) {
      const productDb = await db.product.findUnique({
        where: { id: product.productId },
      });

      if (!productDb || productDb.stockQuantity < product.quantity) {
        res
          .status(400)
          .json({ message: `Product with ID ${product.productId} is out of stock or Not found` });
        return; // Explicitly return to avoid further execution
      }
    }

    try {
      // Create order and associated order products in a transaction
      await db.$transaction(async (transaction) => {
        // Create the order
        const order = await transaction.order.create({
          data: {
            userId: req.body.userId,
            orderDate: new Date(),
          },
        });

        // Process each product and update stock within the transaction
        for (const product of products) {
          await transaction.orderProduct.create({
            data: {
              orderId: order.id,
              productId: product.productId,
              quantity: product.quantity,
            },
          });

          await transaction.product.update({
            where: { id: product.productId },
            data: {
              stockQuantity: {
                decrement: product.quantity,
              },
            },
          });
        }

        // Send success response
        res.json({
          message: "Order created successfully",
          order,
        });
      });
    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      res.status(500).json({ message: "Failed to create order" });
      return; // Ensure no further processing
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
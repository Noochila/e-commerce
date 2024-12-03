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
const updateOrderSchema = zod.object({
  orderId: zod.number().int().positive("Order ID must be a positive integer"),
  products: zod.array(
    zod.object({
      productId: zod.number().int().min(0, "Product ID must be a positive integer"),
      quantity: zod.number().int().min(0, "Quantity must be a positive integer"),
    })
  ).nonempty("Products array cannot be empty"),
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
        return;
      }
    }
  };
}


orderRouter.post("/", validate(orderSchema), async (req, res) => {
  try {

    const user = await db.user.findUnique({
      where: { id: req.body.userId },
    });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }


    const products = req.body.products;
    for (const product of products) {
      const productDb = await db.product.findUnique({
        where: { id: product.productId },
      });

      if (!productDb || productDb.stockQuantity < product.quantity) {
        res
          .status(400)
          .json({ message: `Product with ID ${product.productId} is out of stock or Not found` });
        return;
      }
    }

    try {

      await db.$transaction(async (transaction) => {

        const order = await transaction.order.create({
          data: {
            userId: req.body.userId,
            orderDate: new Date(),
          },
        });


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

        res.json({
          message: "Order created successfully",
          order,
        });
      });
    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      res.status(500).json({ message: "Failed to create order" });
      return;
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});


orderRouter.put("/", async (req, res) => {
  try {
    const orderId = parseInt(req.body.orderId);
    const { products: updatedProducts } = req.body;

    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        products: true, // Include associated OrderProduct entries
      },
    });

    if (!existingOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Map existing products by productId for quick lookup
    const existingProductsMap = new Map(
      existingOrder.products.map((p) => [p.productId, p])
    );

    // Start a transaction for the update operation
    await db.$transaction(async (transaction) => {
      for (const updatedProduct of updatedProducts) {
        const existingProduct = existingProductsMap.get(updatedProduct.productId);

        if (existingProduct) {
          // Revert stock quantity for the existing product
          await transaction.product.update({
            where: { id: existingProduct.productId },
            data: {
              stockQuantity: {
                increment: existingProduct.quantity,
              },
            },
          });

          // Remove the existing OrderProduct entry
          await transaction.orderProduct.delete({
            where: { id: existingProduct.id },
          });
        }

        // Skip creating new OrderProduct entry if quantity is zero
        if (updatedProduct.quantity === 0) {
          continue;
        }

        // Validate stock availability for the new product
        const productDb = await transaction.product.findUnique({
          where: { id: updatedProduct.productId },
        });

        if (!productDb || productDb.stockQuantity < updatedProduct.quantity) {
          throw new Error(
            `Product with ID ${updatedProduct.productId} is out of stock or not found.`
          );
        }

        // Decrement stock quantities for the new product
        await transaction.product.update({
          where: { id: updatedProduct.productId },
          data: {
            stockQuantity: {
              decrement: updatedProduct.quantity,
            },
          },
        });

        // Add updated product to OrderProduct
        await transaction.orderProduct.create({
          data: {
            orderId: existingOrder.id,
            productId: updatedProduct.productId,
            quantity: updatedProduct.quantity,
          },
        });
      }
    });

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order", error: error.message });
    }
  }
});

orderRouter.get("/recent/:id?", async (req, res) => {
  try {
    const userId = req.params.id ? parseInt(req.params.id) : null;

    const orders = await db.order.findMany({
      where: {
        userId: userId ? userId : undefined,
        orderDate: {
          gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
        orderDate: true,
        userId: true,
        products: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    res.json({
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ error: "An error occurred while fetching recent orders" });
  }
});


orderRouter.get("/users/who-bought/:productId", async (req, res) => {
  const { productId } = req.params;
  try {

    const productExists = await db.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!productExists) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }


    const users = await db.orderProduct.findMany({
      where: {
        product: {
          name: productExists.name
        }
      },
      select: {
        order: {
          select: {
            userId: true
          }
        }
      }
    });

    const userIds = [...new Set(users.map((user) => user.order.userId))];

    res.status(200).json({ userIds });

  } catch (e) {
    console.error("Error grouping by productId and userId:", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json({ error: "Something went wrong" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

orderRouter.get("/:id?", async (req, res) => {
  try {
    const userId = req.params.id ? parseInt(req.params.id) : null;

    const orders = await db.order.findMany({
      where: userId ? { userId } : {},
      select: {
        id: true,
        orderDate: true,
        userId: true,
        products: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    res.json({
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "An error occurred while fetching orders" });
  }
});

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


orderRouter.get("/orderbyproduct/:productId", async (req, res) => {
  const { productId } = req.params;
  try {

    const productExists = await db.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!productExists) {
       res.status(404).json({ error: 'Product not found' });
       return ;
    }

   
    const users = await db.orderProduct.findMany({
      where: {
         product:{
          name: productExists.name
         }
        },
        select:{
          order:{
            select:{
              userId:true
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

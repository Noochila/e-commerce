## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (managed with Prisma)
- **Validation**: Zod
- **Middleware**: Custom middleware for validation

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/noochila/e-commerce.git
   cd e-commerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file at the root of the project and add the following variables:
   ```env
   DATABASE_URL=your-postgres-url
   PORT=3000
   ```

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**:
   ```bash
   npm start
   ```

# User Router Endpoints Documentation

## **1. POST `users/`**
### **Description:**
Creates a new user.

### **Input:**
**JSON Body:**
```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123",
    "phone": "1234567890"
}
```

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "message": "User created successfully",
      "user": {
          "id": 1,
          "name": "John Doe",
          "email": "johndoe@example.com",
          "phone": "1234567890"
      }
  }
  ```

- **Error Responses:**
  - **Status Code:** 400 (User already exists)
    ```json
    {
        "error": "User with that email already exists"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```

---

## **2. PUT `users/`**
### **Description:**
Updates an existing user.

### **Input:**
**JSON Body:**
```json
{
    "email": "johndoe@example.com",
    "name": "John Updated",
    "password": "newpassword123",
    "phone": "9876543210"
}
```

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "message": "User updated successfully",
      "user": {
          "id": 1,
          "name": "John Updated",
          "email": "johndoe@example.com",
          "phone": "9876543210"
      }
  }
  ```

- **Error Responses:**
  - **Status Code:** 400 (Email is required)
    ```json
    {
        "message": "Email is required for updating"
    }
    ```
  - **Status Code:** 400 (User not found)
    ```json
    {
        "message": "User not found"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```
  - **Status Code:** 500 (Database error)
    ```json
    {
        "error": "Something went wrong"
    }
    ```

---

## **3. GET `users/`**
### **Description:**
Fetches a user by email.

### **Input:**
**JSON Body:**
```json
{
    "email": "johndoe@example.com"
}
```

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "id": 1,
      "name": "John Doe",
      "email": "johndoe@example.com",
      "phone": "1234567890"
  }
  ```

- **Error Responses:**
  - **Status Code:** 400 (Invalid email)
    ```json
    {
        "message": "Invalid email"
    }
    ```
  - **Status Code:** 404 (User not found)
    ```json
    {
        "message": "User not found"
    }
    ```
  - **Status Code:** 500 (Server error)
    ```json
    {
        "message": "An error occurred while fetching the user"
    }
    ```

---

## **4. Global Error Handler**
### **Description:**
Handles unexpected server errors.

### **Output:**
- **Error Response:**
  - **Status Code:** 500
    ```json
    {
        "message": "Internal server error"
    }
    ```

# Product Router Endpoints Documentation

## **1. GET `products/`**
### **Description:**
Fetches all products.

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "products": [
          {
              "id": 1,
              "name": "Product A",
              "price": 10.99,
              "category": "Category A",
              "stockQuantity": 100
          },
          {
              "id": 2,
              "name": "Product B",
              "price": 5.99,
              "category": "Category B",
              "stockQuantity": 50
          }
      ]
  }
  ```

- **Error Response:**
  - **Status Code:** 500
    ```json
    {
        "error": "Something went wrong"
    }
    ```

---

## **2. GET `products/total`**
### **Description:**
Fetches the total stock quantity of all products.

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "totalProducts": 150
  }
  ```

- **Error Response:**
  - **Status Code:** 500
    ```json
    {
        "error": "Something went wrong"
    }
    ```

---

## **3. POST `products/`**
### **Description:**
Creates a new product.

### **Input:**
**JSON Body:**
```json
{
    "name": "Product A",
    "price": 10.99,
    "category": "Category A",
    "stockQuantity": 100
}
```

### **Output:**
- **Success Response:**
  **Status Code:** 201
  ```json
  {
      "message": "Product created",
      "product": {
          "name": "Product A",
          "price": 10.99,
          "category": "Category A",
          "stockQuantity": 100
      }
  }
  ```

- **Error Responses:**
  - **Status Code:** 400 (Duplicate product name)
    ```json
    {
        "error": "Product with that name already exists"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```
  - **Status Code:** 500
    ```json
    {
        "error": "Something went wrong"
    }
    ```

---

## **4. PUT `products/`**
### **Description:**
Updates an existing product.

### **Input:**
**JSON Body:**
```json
{
    "name": "Product A",
    "price": 15.99,
    "category": "Category Updated",
    "stockQuantity": 120
}
```

### **Output:**
- **Success Response:**
  **Status Code:** 200
  ```json
  {
      "message": "Product updated successfully",
      "product": {
          "name": "Product A",
          "price": 15.99,
          "category": "Category Updated",
          "stockQuantity": 120
      }
  }
  ```

- **Error Responses:**
  - **Status Code:** 404 (Product not found)
    ```json
    {
        "message": "Product not found"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```
  - **Status Code:** 500
    ```json
    {
        "error": "Something went wrong"
    }
    ```

---

## **5. Global Error Handler**
### **Description:**
Handles unexpected server errors.

### **Output:**
- **Error Response:**
  - **Status Code:** 500
    ```json
    {
        "message": "Internal server error"
    }
    ```

# Orders Router Endpoints Documentation

## **1. POST ****`orders/`**

### **Description:**

Creates a new order for a user.

### **Input:**

**JSON Body:**

```json
{
    "userId": 1,
    "products": [
        {
            "productId": 101,
            "quantity": 2
        },
        {
            "productId": 102,
            "quantity": 1
        }
    ]
}
```

### **Output:**

- **Success Response:**
  **Status Code:** 200

  ```json
  {
      "message": "Order created successfully",
      "order": {
          "id": 1,
          "userId": 1,
          "orderDate": "2024-12-05T10:00:00.000Z",
          "products": [
              {
                  "productId": 101,
                  "quantity": 2
              },
              {
                  "productId": 102,
                  "quantity": 1
              }
          ]
      }
  }
  ```

- **Error Responses:**

  - **Status Code:** 400 (User not found)
    ```json
    {
        "message": "User not found"
    }
    ```
  - **Status Code:** 400 (Product out of stock or not found)
    ```json
    {
        "message": "Product with ID 101 is out of stock or Not found"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```
  - **Status Code:** 500 (Transaction error)
    ```json
    {
        "message": "Failed to create order"
    }
    ```
  - **Status Code:** 500 (Internal server error)
    ```json
    {
        "message": "Internal server error"
    }
    ```

---

## **2. PUT ****`orders/`**

### **Description:**

Updates an existing order.

### **Input:**

**JSON Body:**

```json
{
    "orderId": 1,
    "products": [
        {
            "productId": 101,
            "quantity": 3
        },
        {
            "productId": 103,
            "quantity": 2
        }
    ]
}
```

### **Output:**

- **Success Response:**
  **Status Code:** 200

  ```json
  {
      "message": "Order updated successfully",
      "order": {
          "id": 1,
          "userId": 1,
          "orderDate": "2024-12-05T10:00:00.000Z",
          "products": [
              {
                  "productId": 101,
                  "quantity": 3
              },
              {
                  "productId": 103,
                  "quantity": 2
              }
          ]
      }
  }
  ```

- **Error Responses:**

  - **Status Code:** 404 (Order not found)
    ```json
    {
        "message": "Order not found"
    }
    ```
  - **Status Code:** 400 (Product out of stock or not found)
    ```json
    {
        "message": "Product with ID 103 is out of stock or Not found"
    }
    ```
  - **Status Code:** 400 (Validation error)
    ```json
    {
        "message": "[Validation error message]"
    }
    ```
  - **Status Code:** 500 (Transaction error)
    ```json
    {
        "message": "Failed to update order"
    }
    ```
  - **Status Code:** 500 (Internal server error)
    ```json
    {
        "message": "Internal server error"
    }
    ```

---

## **3. GET ****`orders/recent/:id?`**

### **Description:**

Fetches recent orders (from the last 7 days) for a specific user or all users if `id` is not provided.

### **Input:**

**Path Parameter (Optional):**

- `id` (integer): The user ID to fetch recent orders for.

### **Output:**

- **Success Response:**
  **Status Code:** 200

  ```json
  {
      "orders": [
          {
              "id": 1,
              "orderDate": "2024-12-01T10:00:00.000Z",
              "userId": 1,
              "products": [
                  {
                      "productId": 101,
                      "quantity": 2
                  }
              ]
          }
      ]
  }
  ```

- **Error Responses:**

  - **Status Code:** 500
    ```json
    {
        "error": "An error occurred while fetching recent orders"
    }
    ```

---

## **4. GET ****`orders/users/who-bought/:productId`**

### **Description:**

Fetches unique user IDs who have bought a specific product.

### **Input:**

**Path Parameter:**

- `productId` (integer): The product ID to search for.

### **Output:**

- **Success Response:**
  **Status Code:** 200

  ```json
  {
      "userIds": [1, 2, 3]
  }
  ```

- **Error Responses:**

  - **Status Code:** 400 (Product ID missing)
    ```json
    {
        "error": "Product ID is required"
    }
    ```
  - **Status Code:** 404 (Product not found)
    ```json
    {
        "error": "Product not found"
    }
    ```
  - **Status Code:** 500
    ```json
    {
        "error": "Internal server error"
    }
    ```

---

## **5. GET ****`orders/:id?`**

### **Description:**

Fetches all orders for a specific user or all users if `id` is not provided.

### **Input:**

**Path Parameter (Optional):**

- `id` (integer): The user ID to fetch orders for.

### **Output:**

- **Success Response:**
  **Status Code:** 200

  ```json
  {
      "orders": [
          {
              "id": 1,
              "orderDate": "2024-12-05T10:00:00.000Z",
              "userId": 1,
              "products": [
                  {
                      "productId": 101,
                      "quantity": 2
                  }
              ]
          }
      ]
  }
  ```

- **Error Responses:**

  - **Status Code:** 400 (User ID missing)
    ```json
    {
        "message": "User ID is required"
    }
    ```
  - **Status Code:** 500
    ```json
    {
        "error": "An error occurred while fetching orders"
    }
    ```

---

## **6. Global Error Handler**

### **Description:**

Handles unexpected server errors.

### **Output:**

- **Error Response:**
  - **Status Code:** 500
    ```json
    {
        "message": "Internal server error"
    }
    ```



## License
This project is licensed under the MIT License.

## Acknowledgements
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Zod](https://github.com/colinhacks/zod)

## Contact
Manoj Noochila - manojnoochila@gmail.com




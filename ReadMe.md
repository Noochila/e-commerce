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

## **1. POST `/`**
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

## **2. PUT `/`**
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

## **3. GET `/`**
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

## **1. GET `/`**
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

## **2. GET `/total`**
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

## **3. POST `/`**
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

## **4. PUT `/`**
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


# Order Router Endpoints Documentation


## API Endpoints
### 1. Create an Order
**POST** `/`
- **Description**: Create a new order with stock validation.
- **Request Body**:
  ```json
  {
    "userId": 1,
    "products": [
      {
        "productId": 2,
        "quantity": 3
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order created successfully.",
    "orderId": 123
  }
  ```

### 2. Update an Order
**PUT** `/`
- **Description**: Update an existing order and manage stock updates.
- **Request Body**:
  ```json
  {
    "orderId": 123,
    "products": [
      {
        "productId": 2,
        "quantity": 5
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order updated successfully.",
    "orderId": 123
  }
  ```

### 3. Fetch Recent Orders
**GET** `/recent/:id?`
- **Description**: Get all orders from the last 7 days for a user. If `id` is omitted, returns orders for the authenticated user.
- **Response**:
  ```json
  [
    {
      "orderId": 123,
      "userId": 1,
      "products": [
        {
          "productId": 2,
          "productName": "Product A",
          "quantity": 3
        }
      ]
    }
  ]
  ```

### 4. Fetch Users Who Bought a Product
**GET** `/users/who-bought/:productId`
- **Description**: Retrieve a list of user IDs who bought a specified product.
- **Response**:
  ```json
  [
    1,
    2,
    5
  ]
  ```

## Middleware and Validation
- **Zod Schemas**: Used for validating request bodies and parameters.
- **Custom Validation Middleware**: Ensures data integrity before processing requests.

## Example Usage
**Creating an Order with Curl**:
```bash
curl -X POST http://localhost:3000/ \
-H "Content-Type: application/json" \
-d '{"userId": 1, "products": [{"productId": 2, "quantity": 3}]}'
```

## Contribution Guidelines
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
This project is licensed under the MIT License.

## Acknowledgements
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/)
- [Zod](https://github.com/colinhacks/zod)

## Contact
Manoj Noochila - manojnoochila@gmail.com




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


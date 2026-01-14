# API Documentation - Mobile Restaurant Backend

**Base URL**: `{{baseUrl}}`  
**Version**: v1  
**Authentication**: JWT Bearer Token (Required for most endpoints)

---

## Table of Contents
1. [Authentication & Account Management](#1-authentication--account-management)
2. [Global Search](#2-global-search)
3. [Cart Management](#3-cart-management)
4. [Order Management](#4-order-management)
5. [Dish & Menu Management](#5-dish--menu-management)
6. [Category Management](#6-category-management)
7. [Ingredient Management](#7-ingredient-management)
8. [Allergen Management](#8-allergen-management)
9. [Payment & VNPay](#9-payment--vnpay)
10. [Invoice Management](#10-invoice-management)
11. [Notification Management](#11-notification-management)
12. [Push Notification Management](#12-push-notification-management)
13. [Table Management](#13-table-management)
14. [Reservation Management](#14-reservation-management)
15. [Time Slot Management](#15-time-slot-management)
16. [Email Service](#16-email-service)

---

## 1. Authentication & Account Management

### 1.1 Register New Account
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/register`  
**Auth**: Not required  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789"
}
```
**Response**: `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "0123456789",
  "roles": ["USER"]
}
```

---

### 1.2 Login with Email & Password
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/login`  
**Auth**: Not required  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Get Current User (ME Endpoint)
**Endpoint**: `GET {{baseUrl}}/api/v1/auth/me`  
**Auth**: Required (JWT)  
**Headers**:
```
Authorization: Bearer {accessToken}
```
**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "0123456789",
  "roles": ["USER"]
}
```
**Note**: Fetches current logged-in user from JWT token stored in Redis. No parameters needed.

---

### 1.4 Login with Phone (Firebase SMS OTP)
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/phone-login`  
**Auth**: Not required  
**Body**:
```json
{
  "idToken": "firebase_id_token_from_client"
}
```
**Response**: `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.5 Forgot Password
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/forgot-password`  
**Auth**: Not required  
**Body**:
```json
{
  "email": "user@example.com"
}
```
**Response**: `200 OK`
```json
"Đã gửi email đặt lại mật khẩu"
```

---

### 1.6 Reset Password
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/reset-password`  
**Auth**: Not required  
**Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123"
}
```
**Response**: `200 OK`
```json
"Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
```

---

### 1.7 Refresh Access Token
**Endpoint**: `POST {{baseUrl}}/api/v1/auth/refresh`  
**Auth**: Not required  
**Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response**: `200 OK`
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "same_refresh_token"
}
```

---

### 1.8 Logout
**Endpoint**: `DELETE {{baseUrl}}/api/v1/auth/logout`  
**Auth**: Required  
**Headers**:
```
Authorization: Bearer {accessToken}
```
**Response**: `200 OK`
```json
"Đăng xuất thành công"
```

---

### 1.9 Logout All Devices
**Endpoint**: `DELETE {{baseUrl}}/api/v1/auth/logout-all`  
**Auth**: Required  
**Headers**:
```
Authorization: Bearer {accessToken}
```
**Response**: `200 OK`
```json
"Đăng xuất tất cả thiết bị thành công"
```

---

### 1.10 Get Account by ID
**Endpoint**: `GET {{baseUrl}}/api/v1/accounts/get/{id}`  
**Auth**: Required (ADMIN or Owner)  
**Response**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "0123456789",
  "roles": ["USER"]
}
```

---

### 1.11 Get All Accounts
**Endpoint**: `GET {{baseUrl}}/api/v1/accounts`  
**Auth**: Required (ADMIN only)  
**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "0123456789",
    "roles": ["USER"]
  }
]
```

---

### 1.12 Update Account
**Endpoint**: `PUT {{baseUrl}}/api/v1/accounts/{id}`  
**Auth**: Required (ADMIN or Owner)  
**Body**:
```json
{
  "fullName": "John Updated",
  "phone": "0987654321"
}
```
**Response**: `200 OK`

---

### 1.13 Delete Account
**Endpoint**: `DELETE {{baseUrl}}/api/v1/accounts/{id}`  
**Auth**: Required (ADMIN only)  
**Response**: `204 No Content`

---

## 2. Global Search

### 2.1 Search Dishes and Tables
**Endpoint**: `GET {{baseUrl}}/api/search?q={keyword}`  
**Auth**: Optional  
**Query Parameters**:
- `q` (optional): Search keyword (default: "")

**Response**: `200 OK`
```json
{
  "dishes": [
    {
      "dishId": 1,
      "dishName": "Phở Bò",
      "description": "Traditional Vietnamese beef noodle soup",
      "price": 50000,
      "imageUrl": "https://example.com/pho.jpg",
      "categoryName": "Noodles",
      "ingredients": ["Beef", "Rice Noodles", "Broth"]
    }
  ],
  "tables": [
    {
      "tableId": 1,
      "tableCode": "T001",
      "capacity": 4,
      "status": "AVAILABLE",
      "location": "Main Floor"
    }
  ]
}
```
**Note**: Searches dishes by name/ingredients and tables by table code.

---

## 3. Cart Management

### 3.1 Get Cart by Session ID (Guest Users)
**Endpoint**: `GET {{baseUrl}}/api/cart/{sessionId}`  
**Auth**: Not required  
**Response**: `200 OK`
```json
{
  "cartId": 1,
  "sessionId": "session_123",
  "userId": null,
  "items": [
    {
      "itemId": 1,
      "dishId": 1,
      "dishName": "Phở Bò",
      "quantity": 2,
      "unitPrice": 50000,
      "subtotal": 100000
    }
  ],
  "totalAmount": 100000,
  "createdAt": "2026-01-13T10:00:00",
  "updatedAt": "2026-01-13T10:30:00"
}
```

---

### 3.2 Add Item to Cart (Session)
**Endpoint**: `POST {{baseUrl}}/api/cart/{sessionId}/items`  
**Auth**: Not required  
**Body**:
```json
{
  "dishId": 1,
  "quantity": 2
}
```
**Response**: `201 Created` - Returns updated cart

---

### 3.3 Update Cart Item (Session)
**Endpoint**: `PUT {{baseUrl}}/api/cart/{sessionId}/items/{itemId}`  
**Auth**: Not required  
**Body**:
```json
{
  "quantity": 3
}
```
**Response**: `200 OK` - Returns updated cart

---

### 3.4 Remove Item from Cart (Session)
**Endpoint**: `DELETE {{baseUrl}}/api/cart/{sessionId}/items/{itemId}`  
**Auth**: Not required  
**Response**: `200 OK` - Returns updated cart

---

### 3.5 Clear Cart (Session)
**Endpoint**: `DELETE {{baseUrl}}/api/cart/{sessionId}/clear`  
**Auth**: Not required  
**Response**: `204 No Content`

---

### 3.6 Get Cart by User ID (Authenticated Users)
**Endpoint**: `GET {{baseUrl}}/api/cart/user/{userId}`  
**Auth**: Required  
**Response**: `200 OK` - Same structure as 3.1

---

### 3.7 Add Item to Cart (User)
**Endpoint**: `POST {{baseUrl}}/api/cart/user/{userId}/items`  
**Auth**: Required  
**Body**: Same as 3.2  
**Response**: `201 Created`

---

### 3.8 Clear Cart (User)
**Endpoint**: `DELETE {{baseUrl}}/api/cart/user/{userId}/clear`  
**Auth**: Required  
**Response**: `204 No Content`

---

### 3.9 Merge Session Cart to User Cart
**Endpoint**: `POST {{baseUrl}}/api/cart/merge?sessionId={sessionId}&userId={userId}`  
**Auth**: Required  
**Note**: Use when user logs in to merge guest cart with user cart  
**Response**: `200 OK`

---

### 3.10 Get All Carts (Admin)
**Endpoint**: `GET {{baseUrl}}/api/cart/admin/all`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK` - Array of all carts

---

### 3.11 Delete Expired Carts (Admin)
**Endpoint**: `DELETE {{baseUrl}}/api/cart/admin/expired`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 4. Order Management

### 4.1 Get All Orders
**Endpoint**: `GET {{baseUrl}}/api/orders`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK`
```json
[
  {
    "orderId": 1,
    "customerId": 1,
    "customerName": "John Doe",
    "reservationId": 1,
    "orderStatus": "PENDING",
    "paymentStatus": "UNPAID",
    "totalAmount": 150000,
    "orderDate": "2026-01-13T10:00:00",
    "items": [
      {
        "dishId": 1,
        "dishName": "Phở Bò",
        "quantity": 2,
        "unitPrice": 50000,
        "subtotal": 100000
      }
    ]
  }
]
```

---

### 4.2 Get Orders by Customer ID
**Endpoint**: `GET {{baseUrl}}/api/orders/by-customer/{customerId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of orders

---

### 4.3 Get Orders by Reservation ID
**Endpoint**: `GET {{baseUrl}}/api/orders/by-reservation/{reservationId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of orders

---

### 4.4 Get Orders by Status
**Endpoint**: `GET {{baseUrl}}/api/orders/by-status/{status}`  
**Auth**: Required  
**Path Parameters**:
- `status`: PENDING | CONFIRMED | PREPARING | READY | SERVED | CANCELLED

**Response**: `200 OK`

---

### 4.5 Get Orders by Payment Status
**Endpoint**: `GET {{baseUrl}}/api/orders/by-payment-status/{paymentStatus}`  
**Auth**: Required  
**Path Parameters**:
- `paymentStatus`: UNPAID | PAID | REFUNDED

**Response**: `200 OK`

---

### 4.6 Get Orders by Date Range
**Endpoint**: `GET {{baseUrl}}/api/orders/by-date-range?start={startDate}&end={endDate}`  
**Auth**: Required  
**Query Parameters**:
- `start`: ISO DateTime (e.g., 2026-01-01T00:00:00)
- `end`: ISO DateTime

**Response**: `200 OK`

---

### 4.7 Get Order by ID
**Endpoint**: `GET {{baseUrl}}/api/orders/{id}`  
**Auth**: Required  
**Response**: `200 OK`

---

### 4.8 Create Order
**Endpoint**: `POST {{baseUrl}}/api/orders`  
**Auth**: Required  
**Body**:
```json
{
  "customerId": 1,
  "reservationId": 1,
  "items": [
    {
      "dishId": 1,
      "quantity": 2
    }
  ],
  "notes": "No onions please"
}
```
**Response**: `201 Created`

---

### 4.9 Update Order
**Endpoint**: `PUT {{baseUrl}}/api/orders/{id}`  
**Auth**: Required  
**Body**: Same as 4.8  
**Response**: `200 OK`

---

### 4.10 Update Order Status
**Endpoint**: `PATCH {{baseUrl}}/api/orders/{id}/status?status={status}`  
**Auth**: Required  
**Query Parameters**:
- `status`: PENDING | CONFIRMED | PREPARING | READY | SERVED | CANCELLED

**Response**: `200 OK`

---

### 4.11 Update Payment Status
**Endpoint**: `PATCH {{baseUrl}}/api/orders/{id}/payment-status?paymentStatus={status}`  
**Auth**: Required  
**Query Parameters**:
- `paymentStatus`: UNPAID | PAID | REFUNDED

**Response**: `200 OK`

---

### 4.12 Delete Order
**Endpoint**: `DELETE {{baseUrl}}/api/orders/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 5. Dish & Menu Management

### 5.1 Get All Dishes
**Endpoint**: `GET {{baseUrl}}/api/dishes`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  {
    "dishId": 1,
    "dishName": "Phở Bò",
    "description": "Traditional Vietnamese beef noodle soup",
    "price": 50000,
    "imageUrl": "https://example.com/pho.jpg",
    "categoryId": 1,
    "categoryName": "Noodles",
    "isActive": true,
    "isVegetarian": false,
    "isVegan": false,
    "isSpicy": false,
    "ingredients": [
      {"ingredientId": 1, "ingredientName": "Beef"},
      {"ingredientId": 2, "ingredientName": "Rice Noodles"}
    ],
    "allergens": [
      {"allergenId": 1, "allergenName": "Gluten"}
    ]
  }
]
```

---

### 5.2 Get Active Dishes Only
**Endpoint**: `GET {{baseUrl}}/api/dishes/active`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.3 Get Vegetarian Dishes
**Endpoint**: `GET {{baseUrl}}/api/dishes/vegetarian`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.4 Get Vegan Dishes
**Endpoint**: `GET {{baseUrl}}/api/dishes/vegan`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.5 Get Spicy Dishes
**Endpoint**: `GET {{baseUrl}}/api/dishes/spicy`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.6 Search Dishes by Name
**Endpoint**: `GET {{baseUrl}}/api/dishes/search?name={keyword}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.7 Get Dishes by Category
**Endpoint**: `GET {{baseUrl}}/api/dishes/by-category/{categoryId}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.8 Get Dishes by Price Range
**Endpoint**: `GET {{baseUrl}}/api/dishes/by-price-range?minPrice={min}&maxPrice={max}`  
**Auth**: Optional  
**Query Parameters**:
- `minPrice`: Decimal number
- `maxPrice`: Decimal number

**Response**: `200 OK`

---

### 5.9 Get Dishes by Allergen
**Endpoint**: `GET {{baseUrl}}/api/dishes/by-allergen/{allergenId}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.10 Get Dishes by Ingredient
**Endpoint**: `GET {{baseUrl}}/api/dishes/by-ingredient/{ingredientId}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.11 Get Dish by ID
**Endpoint**: `GET {{baseUrl}}/api/dishes/{id}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 5.12 Create Dish
**Endpoint**: `POST {{baseUrl}}/api/dishes`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "dishName": "Phở Bò",
  "description": "Traditional Vietnamese beef noodle soup",
  "price": 50000,
  "imageUrl": "https://example.com/pho.jpg",
  "categoryId": 1,
  "isActive": true,
  "isVegetarian": false,
  "isVegan": false,
  "isSpicy": false,
  "ingredientIds": [1, 2, 3],
  "allergenIds": [1]
}
```
**Response**: `201 Created`

---

### 5.13 Update Dish
**Endpoint**: `PUT {{baseUrl}}/api/dishes/{id}`  
**Auth**: Required (ADMIN)  
**Body**: Same as 5.12  
**Response**: `200 OK`

---

### 5.14 Delete Dish
**Endpoint**: `DELETE {{baseUrl}}/api/dishes/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

### 5.15 Activate Dish
**Endpoint**: `PATCH {{baseUrl}}/api/dishes/{id}/activate`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

### 5.16 Deactivate Dish
**Endpoint**: `PATCH {{baseUrl}}/api/dishes/{id}/deactivate`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 6. Category Management

### 6.1 Get All Categories
**Endpoint**: `GET {{baseUrl}}/api/categories`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  {
    "categoryId": 1,
    "categoryName": "Noodles",
    "description": "Vietnamese noodle dishes",
    "isActive": true
  }
]
```

---

### 6.2 Get Active Categories
**Endpoint**: `GET {{baseUrl}}/api/categories/active`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 6.3 Search Categories by Name
**Endpoint**: `GET {{baseUrl}}/api/categories/search?name={keyword}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 6.4 Get Category by ID
**Endpoint**: `GET {{baseUrl}}/api/categories/{id}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 6.5 Create Category
**Endpoint**: `POST {{baseUrl}}/api/categories`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "categoryName": "Noodles",
  "description": "Vietnamese noodle dishes",
  "isActive": true
}
```
**Response**: `201 Created`

---

### 6.6 Update Category
**Endpoint**: `PUT {{baseUrl}}/api/categories/{id}`  
**Auth**: Required (ADMIN)  
**Body**: Same as 6.5  
**Response**: `200 OK`

---

### 6.7 Delete Category
**Endpoint**: `DELETE {{baseUrl}}/api/categories/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 7. Ingredient Management

### 7.1 Get All Ingredients
**Endpoint**: `GET {{baseUrl}}/api/ingredients`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  {
    "ingredientId": 1,
    "ingredientName": "Beef",
    "description": "Fresh beef"
  }
]
```

---

### 7.2 Search Ingredients by Name
**Endpoint**: `GET {{baseUrl}}/api/ingredients/search?name={keyword}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 7.3 Get Ingredient by ID
**Endpoint**: `GET {{baseUrl}}/api/ingredients/{id}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 7.4 Create Ingredient
**Endpoint**: `POST {{baseUrl}}/api/ingredients`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "ingredientName": "Beef",
  "description": "Fresh beef"
}
```
**Response**: `201 Created`

---

### 7.5 Update Ingredient
**Endpoint**: `PUT {{baseUrl}}/api/ingredients/{id}`  
**Auth**: Required (ADMIN)  
**Body**: Same as 7.4  
**Response**: `200 OK`

---

### 7.6 Delete Ingredient
**Endpoint**: `DELETE {{baseUrl}}/api/ingredients/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 8. Allergen Management

### 8.1 Get All Allergens
**Endpoint**: `GET {{baseUrl}}/api/allergens`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  {
    "allergenId": 1,
    "allergenName": "Gluten",
    "description": "Contains wheat products"
  }
]
```

---

### 8.2 Search Allergens by Name
**Endpoint**: `GET {{baseUrl}}/api/allergens/search?name={keyword}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 8.3 Get Allergen by ID
**Endpoint**: `GET {{baseUrl}}/api/allergens/{id}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 8.4 Create Allergen
**Endpoint**: `POST {{baseUrl}}/api/allergens`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "allergenName": "Gluten",
  "description": "Contains wheat products"
}
```
**Response**: `201 Created`

---

### 8.5 Update Allergen
**Endpoint**: `PUT {{baseUrl}}/api/allergens/{id}`  
**Auth**: Required (ADMIN)  
**Body**: Same as 8.4  
**Response**: `200 OK`

---

### 8.6 Delete Allergen
**Endpoint**: `DELETE {{baseUrl}}/api/allergens/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 9. Payment & VNPay

### 9.1 Create Payment
**Endpoint**: `POST {{baseUrl}}/api/payment/create`  
**Auth**: Required  
**Body**:
```json
{
  "amount": 150000,
  "orderId": 1,
  "userId": 1,
  "orderInfo": "Payment for Order #1",
  "returnUrl": "https://yourapp.com/payment-result"
}
```
**Response**: `201 Created`
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "txnRef": "TXN123456789"
}
```

---

### 9.2 Create Payment from Invoice
**Endpoint**: `POST {{baseUrl}}/api/payment/create-from-invoice/{invoiceId}?userId={userId}`  
**Auth**: Required  
**Path Parameters**:
- `invoiceId`: Invoice ID to create payment for

**Query Parameters**:
- `userId` (optional): User ID making the payment

**Response**: `201 Created`
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "txnRef": "TXN123456789"
}
```
**Note**: Automatically fetches invoice final amount and creates payment.

---

### 9.3 VNPay Return URL (Callback)
**Endpoint**: `GET {{baseUrl}}/api/payment/vnpay-return?vnp_TxnRef={txnRef}&...`  
**Auth**: Not required  
**Note**: This is called by VNPay after payment  
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "txnRef": "TXN123456789",
    "amount": 150000,
    "status": "SUCCESS",
    "transactionDate": "2026-01-13T10:00:00"
  }
}
```

---

### 9.4 Get Payment by Transaction Reference
**Endpoint**: `GET {{baseUrl}}/api/payment/txn/{txnRef}`  
**Auth**: Required  
**Response**: `200 OK`

---

### 9.5 Get Payments by Order ID
**Endpoint**: `GET {{baseUrl}}/api/payment/order/{orderId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of payments

---

### 9.6 Get Payments by User ID
**Endpoint**: `GET {{baseUrl}}/api/payment/user/{userId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of payments

---

## 10. Invoice Management

### 10.1 Create Invoice from Order
**Endpoint**: `POST {{baseUrl}}/api/invoices/from-order/{orderId}?discount={discount}`  
**Auth**: Required  
**Path Parameters**:
- `orderId`: Order ID to create invoice from

**Query Parameters**:
- `discount` (optional, default: 0): Discount amount

**Response**: `201 Created`
```json
{
  "invoiceId": 1,
  "orderId": 1,
  "userId": 1,
  "userName": "John Doe",
  "subtotal": 150000,
  "discount": 10000,
  "tax": 14000,
  "finalAmount": 154000,
  "status": "PENDING",
  "createdAt": "2026-01-13T10:00:00",
  "items": [
    {
      "dishId": 1,
      "dishName": "Phở Bò",
      "quantity": 2,
      "unitPrice": 50000,
      "subtotal": 100000
    }
  ]
}
```

---

### 10.2 Create Invoice Manually
**Endpoint**: `POST {{baseUrl}}/api/invoices`  
**Auth**: Required  
**Body**:
```json
{
  "orderId": 1,
  "userId": 1,
  "discount": 10000,
  "tax": 14000
}
```
**Response**: `201 Created`

---

### 10.3 Get All Invoices
**Endpoint**: `GET {{baseUrl}}/api/invoices`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK` - Array of invoices

---

### 10.4 Get Invoice by ID
**Endpoint**: `GET {{baseUrl}}/api/invoices/{id}`  
**Auth**: Required  
**Response**: `200 OK`

---

### 10.5 Get Invoice by Order ID
**Endpoint**: `GET {{baseUrl}}/api/invoices/order/{orderId}`  
**Auth**: Required  
**Response**: `200 OK`

---

### 10.6 Get Invoices by User ID
**Endpoint**: `GET {{baseUrl}}/api/invoices/user/{userId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of invoices

---

### 10.7 Update Invoice
**Endpoint**: `PUT {{baseUrl}}/api/invoices/{id}`  
**Auth**: Required  
**Body**: Same as 10.2  
**Response**: `200 OK`

---

### 10.8 Update Invoice Status
**Endpoint**: `PATCH {{baseUrl}}/api/invoices/{id}/status?status={status}`  
**Auth**: Required  
**Query Parameters**:
- `status`: PENDING | PAID | CANCELLED | REFUNDED

**Response**: `200 OK`

---

### 10.9 Get Invoice Final Amount
**Endpoint**: `GET {{baseUrl}}/api/invoices/{id}/final-amount`  
**Auth**: Required  
**Response**: `200 OK`
```json
154000
```
**Note**: Returns the final amount to be paid (used for payment creation).

---

### 10.10 Delete Invoice
**Endpoint**: `DELETE {{baseUrl}}/api/invoices/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `204 No Content`

---

## 11. Notification Management

### 11.1 Create Notification
**Endpoint**: `POST {{baseUrl}}/api/notifications`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "title": "New Promotion",
  "message": "Get 20% off on all dishes today!",
  "type": "PROMOTION",
  "priority": "HIGH"
}
```
**Response**: `201 Created`
```json
{
  "notificationId": 1,
  "title": "New Promotion",
  "message": "Get 20% off on all dishes today!",
  "type": "PROMOTION",
  "priority": "HIGH",
  "createdAt": "2026-01-13T10:00:00"
}
```
**Types**: PROMOTION | ORDER_UPDATE | RESERVATION | SYSTEM  
**Priority**: LOW | MEDIUM | HIGH | URGENT

---

### 11.2 Send Notification to User
**Endpoint**: `POST {{baseUrl}}/api/notifications/send?userId={userId}&notificationId={notificationId}`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK`
```json
{
  "userNotificationId": 1,
  "userId": 1,
  "notificationId": 1,
  "isRead": false,
  "sentAt": "2026-01-13T10:00:00",
  "notification": {
    "notificationId": 1,
    "title": "New Promotion",
    "message": "Get 20% off on all dishes today!",
    "type": "PROMOTION",
    "priority": "HIGH"
  }
}
```

---

### 11.3 Get Notifications for User
**Endpoint**: `GET {{baseUrl}}/api/notifications/user/{userId}`  
**Auth**: Required  
**Response**: `200 OK` - Array of user notifications

---

### 11.4 Get Unread Notifications
**Endpoint**: `GET {{baseUrl}}/api/notifications/user/{userId}/unread`  
**Auth**: Required  
**Response**: `200 OK` - Array of unread notifications

---

### 11.5 Get Unread Notification Count
**Endpoint**: `GET {{baseUrl}}/api/notifications/user/{userId}/unread/count`  
**Auth**: Required  
**Response**: `200 OK`
```json
5
```

---

### 11.6 Mark Notification as Read
**Endpoint**: `PUT {{baseUrl}}/api/notifications/read/{id}`  
**Auth**: Required  
**Path Parameters**:
- `id`: User notification ID (not notification ID)

**Response**: `200 OK`

---

### 11.7 Get Notifications by Type
**Endpoint**: `GET {{baseUrl}}/api/notifications/type/{type}`  
**Auth**: Required (ADMIN)  
**Path Parameters**:
- `type`: PROMOTION | ORDER_UPDATE | RESERVATION | SYSTEM

**Response**: `200 OK`

---

### 11.8 Get Notifications by Priority
**Endpoint**: `GET {{baseUrl}}/api/notifications/priority/{priority}`  
**Auth**: Required (ADMIN)  
**Path Parameters**:
- `priority`: LOW | MEDIUM | HIGH | URGENT

**Response**: `200 OK`

---

## 12. Push Notification Management

### 12.1 Register Push Token
**Endpoint**: `POST {{baseUrl}}/api/v1/users/push-token`  
**Auth**: Required  
**Body**:
```json
{
  "userId": 1,
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android"
}
```
**Platform**: "android" or "ios"  
**Response**: `200 OK`
```json
{
  "id": 1,
  "userId": 1,
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "deviceInfo": null,
  "isActive": true,
  "createdAt": "2026-01-13T10:00:00",
  "updatedAt": "2026-01-13T10:00:00"
}
```
**Note**: Call this endpoint when user logs in or app starts to register device for push notifications.

---

### 12.2 Remove Push Token
**Endpoint**: `DELETE {{baseUrl}}/api/v1/users/push-token?userId={userId}&pushToken={token}`  
**Auth**: Required  
**Query Parameters**:
- `userId`: User ID
- `pushToken`: The push token to remove

**Response**: `200 OK`
**Note**: Call when user logs out or wants to disable notifications.

---

## 13. Table Management

### 13.1 Get All Tables
**Endpoint**: `GET {{baseUrl}}/api/tables`  
**Auth**: Optional  
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Fetched all tables successfully",
  "data": [
    {
      "tableId": 1,
      "tableCode": "T001",
      "capacity": 4,
      "status": "AVAILABLE",
      "location": "Main Floor",
      "qrCode": "data:image/png;base64,..."
    }
  ]
}
```
**Status**: AVAILABLE | OCCUPIED | RESERVED | MAINTENANCE

---

### 13.2 Get Table by ID
**Endpoint**: `GET {{baseUrl}}/api/tables/{id}`  
**Auth**: Optional  
**Response**: `200 OK`

---

### 13.3 Create Table
**Endpoint**: `POST {{baseUrl}}/api/tables`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "tableCode": "T001",
  "capacity": 4,
  "location": "Main Floor"
}
```
**Response**: `200 OK`
**Note**: Automatically generates QR code for table.

---

### 13.4 Update Table
**Endpoint**: `PUT {{baseUrl}}/api/tables/{id}`  
**Auth**: Required (ADMIN)  
**Body**: Same as 13.3  
**Response**: `200 OK`

---

### 13.5 Delete Table
**Endpoint**: `DELETE {{baseUrl}}/api/tables/{id}`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK`

---

### 13.6 Update Table Status
**Endpoint**: `PUT {{baseUrl}}/api/tables/{tableCode}/status`  
**Auth**: Required  
**Path Parameters**:
- `tableCode`: Table code (e.g., "T001")

**Body**:
```json
{
  "status": "OCCUPIED"
}
```
**Response**: `200 OK`

---

### 13.7 Book Table
**Endpoint**: `POST {{baseUrl}}/api/tables/{tableCode}/book`  
**Auth**: Required  
**Body**:
```json
{
  "userId": 1,
  "reservationDate": "2026-01-15",
  "timeSlotId": 1,
  "numberOfGuests": 4
}
```
**Response**: `200 OK`

---

### 13.8 Check-in to Table
**Endpoint**: `POST {{baseUrl}}/api/tables/check-in`  
**Auth**: Required  
**Body**:
```json
{
  "tableCode": "T001",
  "userId": 1
}
```
**Response**: `200 OK`
```json
"Check-in successful"
```

---

### 13.9 Get Table Availability
**Endpoint**: `GET {{baseUrl}}/api/tables/availability?date={date}&slotId={slotId}`  
**Auth**: Optional  
**Query Parameters**:
- `date`: Date in format YYYY-MM-DD
- `slotId`: Time slot ID

**Response**: `200 OK` - List of available tables

---

## 14. Reservation Management

### 14.1 Get All Reservations
**Endpoint**: `GET {{baseUrl}}/api/reservations`  
**Auth**: Required (ADMIN)  
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Fetched all reservations",
  "data": [
    {
      "reservationId": 1,
      "userId": 1,
      "userName": "John Doe",
      "tableId": 1,
      "tableCode": "T001",
      "reservationDate": "2026-01-15",
      "timeSlotId": 1,
      "timeSlotLabel": "12:00 - 14:00",
      "numberOfGuests": 4,
      "status": "CONFIRMED",
      "createdAt": "2026-01-13T10:00:00"
    }
  ]
}
```
**Status**: PENDING | CONFIRMED | CANCELLED | COMPLETED

---

### 14.2 Get Reservation by ID
**Endpoint**: `GET {{baseUrl}}/api/reservations/{id}`  
**Auth**: Required  
**Response**: `200 OK`

---

### 14.3 Get Reservations by User ID
**Endpoint**: `GET {{baseUrl}}/api/reservations/user/{userId}`  
**Auth**: Required  
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Fetched user reservations",
  "data": [
    {
      "reservationId": 1,
      "userId": 1,
      "bookingCode": "BK123456",
      "contactName": "John Doe",
      "contactEmail": "john@example.com",
      "contactPhone": "0123456789",
      "totalGuests": 4,
      "reservationStatus": "CONFIRMED",
      "otpVerified": true,
      "createdAt": "2026-01-13T10:00:00",
      "reservationTables": [...]
    }
  ]
}
```
**Note**: Returns all reservations for the user (past and future).

---

### 14.4 Get Active Reservations by User ID
**Endpoint**: `GET {{baseUrl}}/api/reservations/user/{userId}/active`  
**Auth**: Required  
**Response**: `200 OK`
```json
{
  "success": true,
  "message": "Fetched active user reservations",
  "data": [...]
}
```
**Note**: Returns only CONFIRMED reservations with future dates. Use this for "My Active Reservations" screen.

---

### 14.5 Create Reservation
**Endpoint**: `POST {{baseUrl}}/api/reservations`  
**Auth**: Required  
**Body**:
```json
{
  "userId": 1,
  "tableId": 1,
  "reservationDate": "2026-01-15",
  "timeSlotId": 1,
  "numberOfGuests": 4,
  "notes": "Window seat preferred"
}
```
**Response**: `201 Created`

---

### 14.6 Update Reservation
**Endpoint**: `PUT {{baseUrl}}/api/reservations/{id}`  
**Auth**: Required  
**Body**: Same as 14.5  
**Response**: `200 OK`

---

### 14.7 Delete Reservation
**Endpoint**: `DELETE {{baseUrl}}/api/reservations/{id}`  
**Auth**: Required  
**Response**: `200 OK`

---

## 15. Time Slot Management

### 15.1 Get All Time Slots
**Endpoint**: `GET {{baseUrl}}/api/timeslots`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  {
    "slotId": 1,
    "startTime": "12:00:00",
    "endTime": "14:00:00",
    "label": "12:00 - 14:00",
    "isActive": true
  }
]
```

---

### 15.2 Get All Time Slot Labels
**Endpoint**: `GET {{baseUrl}}/api/timeslots/all-label`  
**Auth**: Optional  
**Response**: `200 OK`
```json
[
  "12:00 - 14:00",
  "14:00 - 16:00",
  "18:00 - 20:00"
]
```

---

## 16. Email Service

### 16.1 Send Email
**Endpoint**: `POST {{baseUrl}}/api/emails/send`  
**Auth**: Required (ADMIN)  
**Body**:
```json
{
  "to": "user@example.com",
  "subject": "Welcome to our restaurant",
  "body": "Thank you for your reservation!"
}
```
**Response**: `200 OK`
```json
"Email sent successfully"
```

---

## Common Response Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content returned
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Authentication Header

For endpoints requiring authentication, include JWT token in headers:

```
Authorization: Bearer {accessToken}
```

---

## Important Notes for Frontend

### 1. **Cart Workflow**
- **Guest users**: Use session-based cart (sessionId can be generated client-side)
- **Logged-in users**: Use user-based cart (userId)
- **Login transition**: Call `/api/cart/merge` to merge session cart into user cart

### 2. **Order → Invoice → Payment Flow**
```
1. Create Order (POST /api/orders)
   ↓ **AUTO: Invoice created automatically via event**
2. Get Invoice by Order ID (GET /api/invoices/order/{orderId})
3. Create Payment from Invoice (POST /api/payment/create-from-invoice/{invoiceId})
4. Redirect user to paymentUrl
5. Handle callback at /api/payment/vnpay-return
```
**Note**: Invoice is now **automatically created** when an order is created. You don't need to manually call create invoice endpoint.

### 3. **Search Functionality**
- Global search returns both dishes and tables in one response
- Searches across dish names, ingredients, and table codes
- No authentication required

### 4. **Table & Reservation**
- Check availability before booking: `/api/tables/availability`
- Book table: `/api/tables/{tableCode}/book`
- QR code is auto-generated when creating tables
- Use check-in endpoint when customer arrives
- Get active reservations: `/api/reservations/user/{userId}/active`

### 5. **Notifications & Push**
- **Register Push Token**: Call `/api/v1/users/push-token` on app start/login
- **Auto-Push**: When sending notification via `/api/notifications/send`, push notification is automatically sent to user's devices
- Poll unread count: `/api/notifications/user/{userId}/unread/count`
- Mark as read after user views: `/api/notifications/read/{id}`
- Different types for different purposes (ORDER_UPDATE, PROMOTION, etc.)
- **Remove token on logout**: Call DELETE `/api/v1/users/push-token`

### 6. **Current User Endpoint**
- Use `GET /api/v1/auth/me` to get current logged-in user
- No parameters needed - uses JWT from Authorization header
- Returns full user profile with roles

### 7. **Auto-Invoice Creation**
- When you create an order, an invoice is **automatically created** in the background
- You can fetch it using: `GET /api/invoices/order/{orderId}`
- This happens asynchronously and doesn't block order creation
- If invoice creation fails, the order is still created successfully

---

## Postman Collection Structure

Organize your Postman collection as follows:

```
Restaurant API
├── 1. Auth & Account
│   ├── Register
│   ├── Login
│   ├── Get Current User (ME)
│   ├── Phone Login
│   ├── Forgot Password
│   ├── Reset Password
│   ├── Refresh Token
│   ├── Logout
│   ├── Logout All
│   └── Push Token Management
│       ├── Register Push Token
│       └── Remove Push Token
├── 2. Global Search
│   └── Search
├── 3. Cart
│   ├── Session Cart Operations
│   ├── User Cart Operations
│   └── Merge Cart
├── 4. Orders
│   └── All order endpoints
├── 5. Dishes
│   └── All dish endpoints
├── 6. Categories
├── 7. Ingredients
├── 8. Allergens
├── 9. Payments
│   └── VNPay operations
├── 10. Invoices
│   └── (Note: Auto-created with orders)
├── 11. Notifications
│   └── DB Notifications
├── 12. Push Notifications
│   ├── Register Token
│   └── Remove Token
├── 13. Tables
├── 14. Reservations
│   ├── All Reservations
│   ├── User Reservations
│   └── Active User Reservations
├── 15. Time Slots
└── 16. Email
```

### Environment Variables
Create these in Postman environment:

```
baseUrl: http://localhost:8080
accessToken: (auto-set from login response)
refreshToken: (auto-set from login response)
userId: (auto-set from login response)
sessionId: (generate random string)
```

---

**Last Updated**: January 13, 2026  
**API Version**: 1.0  
**Backend Framework**: Spring Boot 3.x with Java 17


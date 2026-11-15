# 🛒 E-Commerce Website

A modern, responsive e-commerce web application built using **React.js and Supabase**, designed to provide a smooth online shopping experience with user authentication, product management, shopping cart, payment integration, and order management.

## 🌟 Overview

This project is an online shopping platform where customers can browse products, manage their shopping carts, complete purchases, and track their orders. It also includes an admin dashboard for managing products and orders.

## ✨ Features

### 👤 User Authentication
- User registration and login.
- Secure authentication using Supabase.
- User account management.

### 🛍️ Product Management
- Browse available products.
- View product details.
- Organized product listings.

### 🛒 Shopping Cart
- Add products to cart.
- Manage cart items.
- Update product quantities.
- Calculate order totals.

### 💳 Payment Integration
- Integrated payment functionality.
- Supports the checkout process.

### 📦 Order Management
- Place orders.
- Manage customer orders.
- View order information and status.

### 🔐 Admin Dashboard
- Admin interface for managing products.
- Manage customer orders.
- Monitor e-commerce operations.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| JavaScript | Application logic |
| HTML5 | Page structure |
| CSS3 | Styling and layout |
| Supabase | Backend services |
| Supabase Auth | User authentication |
| Supabase Database | Data storage |

## 🏗️ Application Architecture

```text
E-Commerce Website
       |
       v
  React Frontend
       |
       v
    Supabase
       |
       |---- Authentication
       |
       |---- Database
       |
       |---- Backend Services
       |
       v
  Shopping & Order Management
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Asshu-06/E-commerce-Site.git
```

### 2. Navigate to the project directory

```bash
cd E-commerce-Site
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use your actual Supabase project credentials. Never expose service-role keys or payment secrets in frontend code.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🔒 Security

- Use Supabase Row Level Security (RLS) policies to protect database records.
- Restrict admin operations to authorized users.
- Keep sensitive credentials out of the public repository.
- Verify payment transactions securely on the server side.

## 🎯 Project Objective

The objective of this project is to develop a practical e-commerce application while gaining hands-on experience in frontend development, backend integration, database management, authentication, and real-world application workflows.

## 👩‍💻 Developer

**Aswani Adduri**

B.Tech Computer Science & Engineering | 2027

- GitHub: [Asshu-06](https://github.com/Asshu-06)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/aswani-adduri-442149328/)

---

⭐ If you find this project interesting, feel free to explore the repository!

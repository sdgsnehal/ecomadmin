# 🛍️ eCommerce Admin Dashboard

A modern, full-featured admin dashboard for managing your eCommerce platform. Built with **Next.js**, **Tailwind CSS**, and **MongoDB**, this dashboard allows administrators to manage products, categories, and more — all in one place.

## 🚀 Features

- 🔐 Admin authentication
- 🗂 Category and product management
- 📦 Create, read, update, and delete (CRUD) operations
- 📊 Dashboard overview (coming soon)
- 🌐 API routes with Next.js
- ⚡ Dynamic UI with React hooks
- 💅 Styled with Tailwind CSS
- 🧠 MongoDB + Mongoose for schema-based data

## 🧱 Tech Stack

- **Frontend**: Next.js (App Router or Pages Router)
- **Styling**: Tailwind CSS
- **Database**: MongoDB
- **ORM**: Mongoose
- **HTTP Client**: Axios

## 📁 Project Structure

├── components/ # Reusable UI components ├── lib/ # Database connection and models ├── pages/ # Page-based routing │ ├── api/ # API routes for server-side logic │ ├── categories.js # Category management UI │ ├── index.js # Dashboard landing page ├── public/ # Static assets ├── styles/ # Global styles └── .env # Environment variables


## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ecommerce-admin.git
cd ecommerce-admin

2. Install dependencies
npm install
# or
yarn

3. Set up environment variables
Create a .env.local file in the root of your project:
MONGODB_URI=your_mongo_connection_string
PORT=3000

4. Run the app
npm run dev
# or
yarn dev

Visit http://localhost:3000 to start using the dashboard.

✅ To-Do
 Product management

 Admin login/auth

 Orders overview

 Sales analytics

 Inventory tracking

📦 Deployment
You can easily deploy this app on Vercel, Render, or any Node.js-supported platform.

🤝 Contributing
Feel free to fork this repo and contribute! Pull requests are welcome.

📄 License
MIT License. Use it freely for personal or commercial projects.
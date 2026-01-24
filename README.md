# EasyInvoice Clone

A modern invoice management application built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 User authentication (Login/Register)
- 📊 Dashboard with statistics
- 📝 Invoice creation and management
- 💼 Client management
- 🎨 Modern, responsive UI design

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── contexts/       # React contexts (Auth)
├── pages/          # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Invoices.tsx
│   └── CreateInvoice.tsx
├── App.tsx         # Main app component with routing
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Features Overview

### Authentication
- Login page with email and password
- Registration page with form validation
- Protected routes for authenticated users

### Dashboard
- Overview statistics (Total Invoices, Revenue, Pending, Clients)
- Quick actions to create invoices
- Recent invoices table

### Invoice Management
- View all invoices in a table
- Search and filter functionality
- Create new invoices with:
  - Client information
  - Invoice items with quantity and pricing
  - Automatic tax calculation
  - Total calculation

## License

MIT

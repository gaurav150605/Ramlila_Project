# Ramlila Pedhewale Factory Management System

A comprehensive factory management system for traditional sweet manufacturing, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login and Registration pages with beautiful UI
- **Dashboard**: Overview of all management modules
- **Sales Management**: Track sales, manage customer orders, and generate invoices
- **Stock Management**: Monitor inventory levels of raw materials
- **Product Management**: Manage product catalog with pricing and descriptions
- **Reports & Analytics**: View sales reports and business insights
- **Employee Management**: Track employees, roles, and salaries

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── sales/              # Sales management pages
│   ├── stock/              # Stock management pages
│   ├── products/           # Product management pages
│   ├── reports/            # Reports & Analytics page
│   ├── employees/          # Employee management pages
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation header component
│   └── Footer.tsx          # Footer component
└── package.json            # Dependencies and scripts
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library

## Pages

- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - Main dashboard with module cards
- `/sales` - Sales management with transaction table
- `/sales/add` - Add new sale with multiple products
- `/stock` - Stock management with inventory tracking
- `/stock/add` - Add new stock item
- `/products` - Product management with catalog
- `/products/add` - Add new product
- `/reports` - Reports and analytics dashboard
- `/employees` - Employee management
- `/employees/add` - Add new employee

## License

© 2024 Ramlila Pedhewale Factory. All rights reserved.


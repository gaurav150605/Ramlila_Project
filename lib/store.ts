// Simple in-memory store for demo purposes
// In production, this would connect to a database

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface Sale {
  id: string;
  date: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'Fully Paid' | 'Partially Paid' | 'Unpaid';
  paidAmount: number;
  remainingAmount: number;
  payments: PaymentRecord[];
}

export interface StockItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category?: string;
  created?: string;
}

export interface Employee {
  id: string;
  name: string;
  contact: string;
  role: string;
  joiningDate: string;
  salary: number;
  status: 'Active' | 'Inactive';
  address?: string;
}

export interface Attendance {
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}

class Store {
  private sales: Sale[] = [];
  private stockItems: StockItem[] = [];
  private products: Product[] = [
    { id: '1', name: 'Kesar Pedha', description: 'Premium Kesar Pedha', price: 200, unit: 'kg' },
    { id: '2', name: 'Chocolate Pedha', description: 'Delicious Chocolate Pedha', price: 250, unit: 'kg' },
    { id: '3', name: 'Plain Pedha', description: 'Traditional Plain Pedha', price: 180, unit: 'kg' },
  ];
  private employees: Employee[] = [
    {
      id: '1',
      name: 'gaurav',
      contact: '9022776765',
      role: 'Accountant',
      joiningDate: 'Dec 05, 2025',
      salary: 15000,
      status: 'Active',
    },
    {
      id: '2',
      name: 'gaurav',
      contact: '0902277676',
      role: 'Worker',
      joiningDate: 'Oct 29, 2025',
      salary: 12000,
      status: 'Active',
    },
  ];
  private attendance: Attendance[] = [];

  // Sales methods
  getSales(): Sale[] {
    return this.sales;
  }

  getSale(id: string): Sale | undefined {
    return this.sales.find(s => s.id === id);
  }

  addSale(sale: Sale): void {
    this.sales.unshift(sale);
    this.saveSales();
  }

  updateSale(id: string, sale: Partial<Sale>): void {
    const index = this.sales.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sales[index] = { ...this.sales[index], ...sale };
      this.saveSales();
    }
  }

  addPaymentToSale(saleId: string, payment: PaymentRecord): void {
    const sale = this.sales.find(s => s.id === saleId);
    if (sale) {
      sale.payments.push(payment);
      sale.paidAmount += payment.amount;
      sale.remainingAmount = sale.total - sale.paidAmount;
      sale.paymentStatus = sale.remainingAmount === 0 ? 'Fully Paid' : 
                          sale.paidAmount > 0 ? 'Partially Paid' : 'Unpaid';
      this.saveSales();
    }
  }

  deleteSale(id: string): void {
    this.sales = this.sales.filter(s => s.id !== id);
    this.saveSales();
  }

  private saveSales(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sales', JSON.stringify(this.sales));
    }
  }

  // Stock methods
  getStockItems(): StockItem[] {
    return this.stockItems;
  }

  getStockItem(id: string): StockItem | undefined {
    return this.stockItems.find(item => item.id === id);
  }

  addStockItem(item: StockItem): void {
    this.stockItems.push(item);
    this.saveStockItems();
  }

  updateStockItem(id: string, item: Partial<StockItem>): void {
    const index = this.stockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      this.stockItems[index] = { ...this.stockItems[index], ...item };
      this.saveStockItems();
    }
  }

  deleteStockItem(id: string): void {
    this.stockItems = this.stockItems.filter(item => item.id !== id);
    this.saveStockItems();
  }

  private saveStockItems(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stockItems', JSON.stringify(this.stockItems));
    }
  }

  // Product methods
  getProducts(): Product[] {
    return this.products;
  }

  getProduct(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  addProduct(product: Product): void {
    this.products.push(product);
    this.saveProducts();
  }

  updateProduct(id: string, product: Partial<Product>): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...product };
      this.saveProducts();
    }
  }

  deleteProduct(id: string): void {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
  }

  private saveProducts(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('products', JSON.stringify(this.products));
    }
  }

  // Employee methods
  getEmployees(): Employee[] {
    return this.employees;
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.find(e => e.id === id);
  }

  addEmployee(employee: Employee): void {
    this.employees.push(employee);
    this.saveEmployees();
  }

  updateEmployee(id: string, employee: Partial<Employee>): void {
    const index = this.employees.findIndex(e => e.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...employee };
      this.saveEmployees();
    }
  }

  deleteEmployee(id: string): void {
    this.employees = this.employees.filter(e => e.id !== id);
    this.saveEmployees();
  }

  private saveEmployees(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('employees', JSON.stringify(this.employees));
    }
  }

  // Attendance methods
  getAttendance(employeeId?: string, month?: string, year?: string): Attendance[] {
    let filtered = this.attendance;
    if (employeeId) {
      filtered = filtered.filter(a => a.employeeId === employeeId);
    }
    if (month && year) {
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() + 1 === parseInt(month) && date.getFullYear() === parseInt(year);
      });
    }
    return filtered;
  }

  markAttendance(attendance: Attendance): void {
    // Remove existing attendance for same employee and date
    this.attendance = this.attendance.filter(
      a => !(a.employeeId === attendance.employeeId && a.date === attendance.date)
    );
    this.attendance.push(attendance);
    if (typeof window !== 'undefined') {
      localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }
  }

  getEmployeeAttendanceCount(employeeId: string, month: string, year: string): number {
    const attendance = this.getAttendance(employeeId, month, year);
    return attendance.filter(a => a.status === 'Present').length;
  }

  // Initialize from localStorage
  init(): void {
    if (typeof window !== 'undefined') {
      const savedSales = localStorage.getItem('sales');
      if (savedSales) {
        this.sales = JSON.parse(savedSales);
        // Migrate old sales to include payment tracking fields
        this.sales = this.sales.map((sale: any) => {
          // If sale doesn't have payment fields, add defaults
          if (sale.paidAmount === undefined) {
            sale.paidAmount = 0;
          }
          if (sale.remainingAmount === undefined) {
            sale.remainingAmount = sale.total - (sale.paidAmount || 0);
          }
          if (sale.paymentStatus === undefined) {
            sale.paymentStatus = sale.paidAmount >= sale.total ? 'Fully Paid' :
                                sale.paidAmount > 0 ? 'Partially Paid' : 'Unpaid';
          }
          if (sale.payments === undefined) {
            sale.payments = [];
            // If there's an initial payment, add it to payments history
            if (sale.paidAmount > 0) {
              sale.payments.push({
                id: Date.now().toString(),
                date: sale.date,
                amount: sale.paidAmount,
                paymentMethod: sale.paymentMethod || 'Cash',
                notes: 'Initial payment',
              });
            }
          }
          return sale;
        });
        // Save migrated sales
        this.saveSales();
      }
      const savedStock = localStorage.getItem('stockItems');
      if (savedStock) {
        this.stockItems = JSON.parse(savedStock);
        // Migrate old stock items to include date field
        this.stockItems = this.stockItems.map((item: any) => {
          if (!item.date && item.createdAt) {
            item.date = item.createdAt.split('T')[0];
          } else if (!item.date) {
            item.date = new Date().toISOString().split('T')[0];
          }
          return item;
        });
        this.saveStockItems();
      }
      const savedProducts = localStorage.getItem('products');
      if (savedProducts) {
        this.products = JSON.parse(savedProducts);
      }
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        this.employees = JSON.parse(savedEmployees);
      }
      const savedAttendance = localStorage.getItem('attendance');
      if (savedAttendance) {
        this.attendance = JSON.parse(savedAttendance);
      }
    }
  }
}

export const store = new Store();
if (typeof window !== 'undefined') {
  store.init();
}

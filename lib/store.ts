// Simple in-memory store for demo purposes
// In production, this would connect to a database
// Data is stored per user in localStorage

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface Sale {
  id: string;
  /** Sequential display number for invoices (1, 2, 3, …). Internal `id` stays a UUID. */
  invoiceNumber?: number;
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
  lowStockThreshold?: number;
}

export interface StockLog {
  id: string;
  stockItemId: string;
  date: string;
  quantityChange: number;
  newQuantity: number;
  reason: string;
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

export interface AdvanceRecord {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  reason?: string;
}

class Store {
  private sales: Sale[] = [];
  private stockItems: StockItem[] = [];
  private products: Product[] = [];
  private employees: Employee[] = [];
  private attendance: Attendance[] = [];
  private stockLogs: StockLog[] = [];
  private advances: AdvanceRecord[] = [];
  private currentUserId: string | null = null;

  // Get user-specific localStorage key
  private getStorageKey(key: string): string {
    if (!this.currentUserId) {
      // Try to get current user
      if (typeof window !== 'undefined') {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          this.currentUserId = user.id;
        }
      }
    }
    return this.currentUserId ? `${key}_${this.currentUserId}` : key;
  }

  // Set current user ID and reinitialize data
  setUserId(userId: string | null): void {
    this.currentUserId = userId;
    this.init();
  }

  // Sales methods
  getSales(): Sale[] {
    return this.sales;
  }

  getSale(id: string): Sale | undefined {
    return this.sales.find(s => s.id === id);
  }

  /** Next invoice number: max existing + 1, or 1 if none. */
  getNextInvoiceNumber(): number {
    const nums = this.sales
      .map((s) => s.invoiceNumber)
      .filter((n): n is number => typeof n === 'number' && n >= 1);
    if (nums.length === 0) return 1;
    return Math.max(...nums) + 1;
  }

  addSale(sale: Sale): void {
    const invoiceNumber = sale.invoiceNumber ?? this.getNextInvoiceNumber();
    this.sales.unshift({ ...sale, invoiceNumber });
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
      localStorage.setItem(this.getStorageKey('sales'), JSON.stringify(this.sales));
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
    
    // Add initial log
    this.addStockLog({
      id: Date.now().toString(),
      stockItemId: item.id,
      date: new Date().toISOString(),
      quantityChange: item.quantity,
      newQuantity: item.quantity,
      reason: 'Initial stock addition'
    });
  }

  updateStockItem(id: string, item: Partial<StockItem>): void {
    const index = this.stockItems.findIndex(i => i.id === id);
    if (index !== -1) {
      const oldQuantity = this.stockItems[index].quantity;
      const newQuantity = item.quantity !== undefined ? item.quantity : oldQuantity;
      
      this.stockItems[index] = { ...this.stockItems[index], ...item };
      this.saveStockItems();

      // Log quantity change if it changed
      if (oldQuantity !== newQuantity) {
        this.addStockLog({
          id: Date.now().toString(),
          stockItemId: id,
          date: new Date().toISOString(),
          quantityChange: newQuantity - oldQuantity,
          newQuantity: newQuantity,
          reason: 'Manual quantity update'
        });
      }
    }
  }

  deleteStockItem(id: string): void {
    this.stockItems = this.stockItems.filter(item => item.id !== id);
    this.saveStockItems();
    // Also delete associated logs
    this.stockLogs = this.stockLogs.filter(log => log.stockItemId !== id);
    this.saveStockLogs();
  }

  private saveStockItems(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey('stockItems'), JSON.stringify(this.stockItems));
    }
  }

  // Stock Logs methods
  getStockLogs(itemId?: string): StockLog[] {
    if (itemId) {
      return this.stockLogs.filter(log => log.stockItemId === itemId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return this.stockLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private addStockLog(log: StockLog): void {
    this.stockLogs.push(log);
    this.saveStockLogs();
  }

  private saveStockLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey('stockLogs'), JSON.stringify(this.stockLogs));
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
      localStorage.setItem(this.getStorageKey('products'), JSON.stringify(this.products));
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
      localStorage.setItem(this.getStorageKey('employees'), JSON.stringify(this.employees));
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
      localStorage.setItem(this.getStorageKey('attendance'), JSON.stringify(this.attendance));
    }
  }

  getEmployeeAttendanceCount(employeeId: string, month: string, year: string): number {
    const attendance = this.getAttendance(employeeId, month, year);
    return attendance.filter(a => a.status === 'Present').length;
  }

  // Advance methods
  getAdvances(employeeId?: string, month?: string, year?: string): AdvanceRecord[] {
    let filtered = this.advances;
    if (employeeId) {
      filtered = filtered.filter(a => a.employeeId === employeeId);
    }
    if (month && year) {
      filtered = filtered.filter(a => {
        const dateStr = a.date;
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return false;
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
      });
    }
    return filtered;
  }

  addAdvance(advance: AdvanceRecord): void {
    this.advances.push(advance);
    this.saveAdvances();
  }

  deleteAdvance(id: string): void {
    this.advances = this.advances.filter(a => a.id !== id);
    this.saveAdvances();
  }

  private saveAdvances(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getStorageKey('advances'), JSON.stringify(this.advances));
    }
  }

  // Initialize from localStorage for current user
  init(): void {
    if (typeof window !== 'undefined') {
      // Get current user ID
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        this.currentUserId = user.id;
      }

      // Load user-specific data
      const savedSales = localStorage.getItem(this.getStorageKey('sales'));
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

        // Assign sequential invoice numbers (1, 2, 3, …) by date for legacy sales
        const needsInvoiceNumbers = this.sales.some(
          (s: Sale) => s.invoiceNumber === undefined || typeof s.invoiceNumber !== 'number'
        );
        if (needsInvoiceNumbers) {
          const sorted = [...this.sales].sort((a, b) => {
            const ta = new Date(a.date).getTime();
            const tb = new Date(b.date).getTime();
            if (Number.isNaN(ta) && Number.isNaN(tb)) return String(a.id).localeCompare(String(b.id));
            if (Number.isNaN(ta)) return 1;
            if (Number.isNaN(tb)) return -1;
            if (ta !== tb) return ta - tb;
            return String(a.id).localeCompare(String(b.id));
          });
          const idToInvoice = new Map<string, number>();
          sorted.forEach((s, i) => idToInvoice.set(s.id, i + 1));
          this.sales = this.sales.map((s) => ({
            ...s,
            invoiceNumber: idToInvoice.get(s.id) ?? s.invoiceNumber ?? 1,
          }));
        }

        // Save migrated sales
        this.saveSales();
      } else {
        // Reset to empty array if no data for this user
        this.sales = [];
      }

      const savedStock = localStorage.getItem(this.getStorageKey('stockItems'));
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
      } else {
        this.stockItems = [];
      }

      const savedProducts = localStorage.getItem(this.getStorageKey('products'));
      if (savedProducts) {
        this.products = JSON.parse(savedProducts);
      } else {
        // Initialize with default products for new users
        this.products = [];
        this.saveProducts();
      }

      const savedEmployees = localStorage.getItem(this.getStorageKey('employees'));
      if (savedEmployees) {
        this.employees = JSON.parse(savedEmployees);
      } else {
        this.employees = [];
      }

      const savedAttendance = localStorage.getItem(this.getStorageKey('attendance'));
      if (savedAttendance) {
        this.attendance = JSON.parse(savedAttendance);
      } else {
        this.attendance = [];
      }

      const savedStockLogs = localStorage.getItem(this.getStorageKey('stockLogs'));
      if (savedStockLogs) {
        this.stockLogs = JSON.parse(savedStockLogs);
      } else {
        this.stockLogs = [];
      }

      const savedAdvances = localStorage.getItem(this.getStorageKey('advances'));
      if (savedAdvances) {
        this.advances = JSON.parse(savedAdvances);
      } else {
        this.advances = [];
      }
    }
  }
}

export const store = new Store();
if (typeof window !== 'undefined') {
  store.init();
  
  // Reinitialize store when user changes (listen for storage events)
  window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
      store.init();
    }
  });
  
  // Also reinitialize on focus (in case user switched accounts in another tab)
  window.addEventListener('focus', () => {
    store.init();
  });
}

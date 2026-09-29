const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5230/api";

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
  employeeRole?: string;
  employeeNumber?: string;
}

export interface Customer {
  customerId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface Profile {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeNumber?: string;
  employeeRole?: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
}

export interface Address {
  addressId: string;
  customerId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  addressId: string;
  orderDate: string;
  orderType: string;
  orderStatus: string;

  // Loyalty
  usesLoyaltyFreeRefill: boolean;

  // Totals
  totalAmount: number;
  deliveryFee: number;
  deliveryDistanceKm?: number | null;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  addressId: string;
  orderType: "DELIVERY" | "COLLECTION";

  // Optional loyalty redemption.
  // Normal orders should leave this false or omit it.
  useLoyaltyFreeRefill?: boolean;

  notes?: string;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface CreateOrderItemPayload {
  orderId: string;
  productId: string;
  quantity: number;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
}

// =========================================================
// LOYALTY CARD
// =========================================================

export interface RefillLoyaltyCard {
  refillLoyaltyCardId: string;
  customerId: string;
  tickCount: number;
  freeRefillsAvailable: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RefillLoyaltyStatus {
  hasLoyaltyCard: boolean;
  tickCount: number;
  ticksRequired: number;
  freeRefillsAvailable: number;
  remainingTicks: number;
}

export interface RefillLoyaltyTransaction {
  refillLoyaltyTransactionId: string;
  orderId: string;
  orderItemId?: string | null;
  transactionType: "TICK_EARNED" | "FREE_REFILL_REDEEMED";
  litres: number;
  ticksAdded: number;
  freeRefillsAdded: number;
  freeRefillsUsed: number;
  createdAt: string;
}

// =========================================================
// RESPONSE PARSER
// =========================================================

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const rawText = await response.text();

  let data: unknown = null;

  if (rawText.trim()) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    } else {
      // Some ASP.NET Core responses may be plain text.
      // Try JSON first, then fall back to the raw text.
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
    }
  }

  if (!response.ok) {
    // -----------------------------------------------------
    // Plain-text backend message
    // -----------------------------------------------------
    if (typeof data === "string" && data.trim()) {
      const message = data.trim();

      // Make duplicate-registration errors user-friendly.
      if (
        response.status === 409 &&
        message.toLowerCase() === "email is already registered."
      ) {
        throw new Error(
          "This email address is already registered. Please use a different email address or log in.",
        );
      }

      throw new Error(message);
    }

    // -----------------------------------------------------
    // JSON object errors
    // -----------------------------------------------------
    if (typeof data === "object" && data !== null) {
      const errorData = data as {
        message?: unknown;
        detail?: unknown;
        title?: unknown;
        error?: unknown;
        errors?: unknown;
      };

      if (typeof errorData.message === "string" && errorData.message.trim()) {
        throw new Error(errorData.message);
      }

      if (typeof errorData.detail === "string" && errorData.detail.trim()) {
        throw new Error(errorData.detail);
      }

      if (typeof errorData.error === "string" && errorData.error.trim()) {
        throw new Error(errorData.error);
      }

      if (typeof errorData.title === "string" && errorData.title.trim()) {
        throw new Error(errorData.title);
      }

      // ASP.NET validation errors
      if (errorData.errors && typeof errorData.errors === "object") {
        const validationMessages = Object.values(
          errorData.errors as Record<string, unknown>,
        )
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter(
            (value): value is string =>
              typeof value === "string" && value.trim().length > 0,
          );

        if (validationMessages.length > 0) {
          throw new Error(validationMessages.join(" "));
        }
      }
    }

    // -----------------------------------------------------
    // Friendly fallback based on HTTP status
    // -----------------------------------------------------
    switch (response.status) {
      case 400:
        throw new Error(
          "The information provided is not valid. Please check your details and try again.",
        );

      case 401:
        throw new Error(
          "Your login details are incorrect or your session has expired.",
        );

      case 403:
        throw new Error("You do not have permission to perform this action.");

      case 404:
        throw new Error("The requested information could not be found.");

      case 409:
        throw new Error(
          "This request conflicts with existing information. Please check your details and try again.",
        );

      case 422:
        throw new Error(
          "The information provided could not be processed. Please check your details.",
        );

      case 429:
        throw new Error(
          "Too many requests were made. Please wait a moment and try again.",
        );

      case 500:
        throw new Error(
          "Something went wrong on the server. Please try again later.",
        );

      case 502:
      case 503:
      case 504:
        throw new Error(
          "The Swivel Water service is temporarily unavailable. Please try again shortly.",
        );

      default:
        throw new Error(
          "Something went wrong while processing your request. Please try again.",
        );
    }
  }

  return data as T;
}
// =========================================================
// BASIC REQUEST
// =========================================================

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  return parseResponse<T>(response);
}

// =========================================================
// AUTHENTICATION
// =========================================================

export async function registerCustomer(registerPayload: RegisterPayload) {
  return request<{
    message: string;
    email?: string;
  }>("/Auth/register", {
    method: "POST",
    body: JSON.stringify(registerPayload),
  });
}

export async function verifyOtp(email: string, otp: string) {
  return request<{ message: string }>("/Auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });
}

export async function customerLogin(email: string, password: string) {
  return request<AuthResponse>("/Auth/customer-login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function employeeLogin(employeeNumber: string, password: string) {
  return request<AuthResponse>("/Auth/employee-login", {
    method: "POST",
    body: JSON.stringify({
      employeeNumber,
      password,
    }),
  });
}

export async function adminLogin(
  email: string,
  staffNumber: string,
  password: string,
) {
  return request<AuthResponse>("/Auth/admin-login", {
    method: "POST",
    body: JSON.stringify({
      email,
      staffNumber,
      password,
    }),
  });
}

// =========================================================
// AUTHENTICATED REQUEST
// =========================================================

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  return request<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

// =========================================================
// CUSTOMERS
// =========================================================

export async function getCustomers(): Promise<Customer[]> {
  return authenticatedRequest<Customer[]>("/Customers");
}

// =========================================================
// ADDRESSES
// =========================================================

export async function getAddresses(): Promise<Address[]> {
  return authenticatedRequest<Address[]>("/Addresses");
}

// =========================================================
// PRODUCTS
// =========================================================

export interface Product {
  productId: string;
  productName: string;
  description?: string;
  price: number;
  stockQuantity: number;

  // BOTTLED / ACCESSORY / REFILL / REFILL_CARD
  productType: string;

  imageUrl?: string;
  isActive: boolean;
}

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>("/Products");
}

// =========================================================
// ORDERS
// =========================================================

export async function getOrders(): Promise<Order[]> {
  return authenticatedRequest<Order[]>("/Orders");
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return authenticatedRequest<Order>("/Orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// =========================================================
// ORDER ITEMS
// =========================================================

export async function createOrderItem(
  payload: CreateOrderItemPayload,
): Promise<OrderItem> {
  return authenticatedRequest<OrderItem>("/OrderItems", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const items = await authenticatedRequest<OrderItem[]>("/OrderItems");

  return items.filter((item) => item.orderId === orderId);
}

// =========================================================
// PAYMENTS
// =========================================================

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  return authenticatedRequest<Payment>("/Payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPayments(): Promise<Payment[]> {
  return authenticatedRequest<Payment[]>("/Payments");
}

// =========================================================
// PROFILE
// =========================================================

export async function getProfile(): Promise<Profile> {
  return authenticatedRequest<Profile>("/Profile");
}

export async function updateEmployeeProfile(payload: {
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<{
  message: string;
  firstName: string;
  lastName: string;
  phone: string;
}> {
  return authenticatedRequest<{
    message: string;
    firstName: string;
    lastName: string;
    phone: string;
  }>("/Profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function uploadProfileImage(file: File): Promise<{
  message: string;
  profileImageUrl: string;
}> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/Profile/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseResponse(response);
}

export async function deleteProfileImage(): Promise<{
  message: string;
}> {
  return authenticatedRequest<{
    message: string;
  }>("/Profile/image", {
    method: "DELETE",
  });
}

// =========================================================
// REFILL LOYALTY
// =========================================================

export async function getLoyaltyCard(): Promise<RefillLoyaltyCard> {
  return authenticatedRequest<RefillLoyaltyCard>("/RefillLoyalty");
}

export async function getLoyaltyStatus(): Promise<RefillLoyaltyStatus> {
  return authenticatedRequest<RefillLoyaltyStatus>("/RefillLoyalty/status");
}

export async function getLoyaltyHistory(): Promise<RefillLoyaltyTransaction[]> {
  return authenticatedRequest<RefillLoyaltyTransaction[]>(
    "/RefillLoyalty/history",
  );
}

// ======================================================
// EMPLOYEE DASHBOARD
// ======================================================

export type EmployeeDashboardData = {
  employee: {
    employeeId: string;
    employeeNumber: string;
    employeeRole: string;
    isActive: boolean;
  };

  summary: {
    ordersToday: number;
    ordersRequiringAttention: number;
    activeCustomers: number;
    bottledStock: number;
    refillLitres: number;
  };

  recentOrders: Array<{
    orderId: string;
    customer: string;
    type: string;
    amount: number;
    status: string;
    orderDate: string;
  }>;

  inventory: Array<{
    productId: string;
    productName: string;
    productType: string;
    stockQuantity: number;
    price: number;
  }>;

  customers: Array<{
    customerId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  }>;
};

export async function getEmployeeDashboard(): Promise<EmployeeDashboardData> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}/EmployeeDashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(message || "Could not load employee dashboard.");
  }

  return response.json();
}

// ======================================================
// EMPLOYEE SHIFTS
// ======================================================

export type EmployeeShift = {
  employeeShiftId: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
  notes: string | null;
};

export type EmployeeShiftsResponse = {
  currentShift: EmployeeShift | null;
  upcomingShifts: EmployeeShift[];
};

export async function getMyEmployeeShifts(): Promise<EmployeeShiftsResponse> {
  return authenticatedRequest<EmployeeShiftsResponse>("/EmployeeShifts/my");
}

// ======================================================
// DRIVER DELIVERIES
// ======================================================

export type DriverDelivery = {
  deliveryId: string;
  orderId: string;
  employeeId: string | null;
  deliveryStatus: string;
  scheduledDate: string | null;
  deliveredAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getDriverDeliveries(): Promise<DriverDelivery[]> {
  return authenticatedRequest<DriverDelivery[]>("/Deliveries");
}

export async function updateDriverDeliveryStatus(
  deliveryId: string,
  deliveryStatus: "OUT_FOR_DELIVERY" | "DELIVERED",
  notes?: string,
): Promise<void> {
  await authenticatedRequest<void>(`/Deliveries/${deliveryId}`, {
    method: "PUT",
    body: JSON.stringify({
      deliveryStatus,
      notes: notes?.trim() || null,
    }),
  });
}

// ======================================================
// DRIVER DASHBOARD
// ======================================================

export type DriverDashboardDeliveryItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
};

export type DriverDashboardDelivery = {
  deliveryId: string;
  orderId: string;
  deliveryStatus: string;
  scheduledDate: string | null;
  deliveredAt: string | null;
  notes: string | null;

  customer: {
    customerId: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  address: {
    addressId: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  order: {
    orderType: string;
    orderStatus: string;
    totalAmount: number;
    items: DriverDashboardDeliveryItem[];
  };
};

export type DriverDashboardData = {
  driver: {
    employeeId: string;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };

  summary: {
    todayDeliveries: number;
    completedToday: number;
    remainingToday: number;
  };

  deliveries: DriverDashboardDelivery[];
};

export async function getDriverDashboard(): Promise<DriverDashboardData> {
  return authenticatedRequest<DriverDashboardData>(
    "/Deliveries/driver-dashboard",
  );
}

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export type AdminDashboardData = {
  summary: {
    todaysOrders: number;
    todaysRevenue: number;
    registeredCustomers: number;
    pendingDeliveries: number;
  };

  recentOrders: Array<{
    orderId: string;
    customerName: string;
    orderType: string;
    amount: number;
    status: string;
    orderDate: string;
  }>;

  teamMembers: Array<{
    employeeId: string;
    name: string;
    role: string;
    status: string;
  }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  return authenticatedRequest<AdminDashboardData>("/AdminDashboard");
}
// ======================================================
// ADMIN CUSTOMERS
// ======================================================

export type AdminCustomer = {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  return authenticatedRequest<AdminCustomer[]>("/AdminCustomers");
}
// ======================================================
// ADMIN PRODUCTS
// ======================================================

export type AdminProduct = {
  productId: string;
  productName: string;
  description?: string;
  price: number;
  stockQuantity: number;
  productType: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductPayload = {
  productName: string;
  description?: string;
  price: number;
  stockQuantity: number;
  productType: "BOTTLED" | "REFILL" | "REFILL_CARD";
  imageUrl?: string;
  isActive: boolean;
};

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return authenticatedRequest<AdminProduct[]>("/AdminProducts");
}

export async function createAdminProduct(data: AdminProductPayload): Promise<{
  message: string;
  product: AdminProduct;
}> {
  return authenticatedRequest<{
    message: string;
    product: AdminProduct;
  }>("/AdminProducts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminProduct(
  productId: string,
  data: AdminProductPayload,
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/AdminProducts/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteAdminProduct(
  productId: string,
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/AdminProducts/${productId}`,
    {
      method: "DELETE",
    },
  );
}
// ======================================================
// ADMIN PAYMENTS
// ======================================================

export type AdminPayment = {
  paymentId: string;
  orderId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionReference?: string | null;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminPayments(): Promise<AdminPayment[]> {
  return authenticatedRequest<AdminPayment[]>("/AdminPayments");
}
// ======================================================
// ADMIN DELIVERIES
// ======================================================

export type AdminDelivery = {
  deliveryId: string;
  orderId: string;
  customerName: string;
  phone: string;

  address: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  driverName?: string | null;

  deliveryStatus: string;
  scheduledDate?: string | null;
  deliveredAt?: string | null;
  notes?: string | null;

  orderType: string;
  orderStatus: string;
  totalAmount: number;

  createdAt: string;
  updatedAt: string;
};

export async function getAdminDeliveries(): Promise<AdminDelivery[]> {
  return authenticatedRequest<AdminDelivery[]>("/AdminDeliveries");
}
// ======================================================
// ADMIN EMPLOYEES
// ======================================================

export type AdminEmployee = {
  employeeId: string;
  userId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  isOnDuty: boolean;
};

export async function getAdminEmployees(): Promise<AdminEmployee[]> {
  return authenticatedRequest<AdminEmployee[]>("/AdminEmployees");
}
// ======================================================
// ADMIN EMPLOYEE SHIFTS
// ======================================================

export type AdminEmployeeShift = {
  employeeShiftId: string;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  employeeRole: string;
  shiftStart: string;
  shiftEnd: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminEmployeeShifts(): Promise<AdminEmployeeShift[]> {
  return authenticatedRequest<AdminEmployeeShift[]>("/AdminEmployeeShifts");
}

export async function createAdminEmployeeShift(data: {
  employeeId: string;
  shiftStart: string;
  shiftEnd: string;
  status?: string;
  notes?: string;
}): Promise<{ message: string; employeeShiftId: string }> {
  return authenticatedRequest<{ message: string; employeeShiftId: string }>(
    "/AdminEmployeeShifts",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function updateAdminEmployeeShift(
  shiftId: string,
  data: {
    employeeId: string;
    shiftStart: string;
    shiftEnd: string;
    status?: string;
    notes?: string;
  },
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/AdminEmployeeShifts/${shiftId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

export async function cancelAdminEmployeeShift(
  shiftId: string,
): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>(
    `/AdminEmployeeShifts/${shiftId}`,
    {
      method: "DELETE",
    },
  );
}
// ======================================================
// ADMIN REPORTS
// ======================================================

export type AdminReportsData = {
  period: string;
  periodStart: string | null;
  periodEnd: string;

  sales: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    grossSales: number;
    averageCompletedOrderValue: number;
    salesByOrderType: Array<{
      orderType: string;
      sales: number;
    }>;
  };

  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    sales: number;
  }>;

  deliveries: {
    totalDeliveries: number;
    deliveredDeliveries: number;
    outForDelivery: number;
    pendingDeliveries: number;
    cancelledDeliveries: number;
    deliveryCompletionRate: number;
  };

  inventory: {
    activeProducts: number;
    bottledUnits: number;
    refillLitres: number;
    lowStockProducts: Array<{
      productId: string;
      productName: string;
      productType: string;
      stockQuantity: number;
    }>;
  };

  registeredCustomers: number;
};

export async function getAdminReports(
  period: "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL" = "MONTH",
): Promise<AdminReportsData> {
  return authenticatedRequest<AdminReportsData>(
    `/AdminReports?period=${period}`,
  );
}

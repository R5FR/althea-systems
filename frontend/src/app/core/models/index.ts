// ─── User & Auth ───────────────────────────────────────────────────────────
export type AccountStatus = 'Active' | 'Inactive' | 'Pending' | 'Banned';
export type Role = 'User' | 'Admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountStatus: AccountStatus;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// ─── Address ────────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressDto {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
}

// ─── PaymentMethod ──────────────────────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal';
  cardBrand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

// ─── Category ───────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  parentId?: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  children?: Category[];
  productCount?: number;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductStatus = 'Published' | 'Draft' | 'Archived';

export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
  displayOrder: number;
}

export interface Badge {
  label: string;
  type: 'promo' | 'new' | 'low-stock' | 'custom';
  color?: string;
}

export interface TechnicalSpec {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  reference?: string;
  shortDescription?: string;
  description: string;
  priceHt: number;
  tvaRate: number;
  vatRate?: number;
  priceTtc: number;
  stockQuantity: number;
  stock?: number;
  minStock?: number;
  status: ProductStatus;
  isActive?: boolean;
  slug: string;
  categoryId: string;
  category?: Category;
  images?: ProductImage[];
  imageUrls?: string[];
  mainImageUrl?: string;
  badges?: Badge[];
  isLargeProduct?: boolean;
  priority?: number;
  technicalSpecs?: TechnicalSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  reference?: string;
  priceHt: number;
  tvaRate: number;
  priceTtc: number;
  slug: string;
  categoryId: string;
  stockQuantity: number;
  stock?: number;
  imageUrl?: string;
  mainImageUrl?: string;
  badges?: Badge[];
  isLargeProduct?: boolean;
  isActive?: boolean;
  priority?: number;
}

export interface ProductSearchParams {
  q?: string;
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt' | 'availability' | 'priority' | string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateProductDto {
  name: string;
  description: string;
  priceHt: number;
  tvaRate: number;
  stockQuantity: number;
  slug?: string;
  categoryId: string;
  status?: ProductStatus;
  isLargeProduct?: boolean;
  priority?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl?: string;
  quantity: number;
  unitPriceTtc: number;
  unitPriceHt: number;
  tvaRate: number;
  total: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotalHt: number;
  totalTva: number;
  totalTtc: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled' | 'Refunded';
export type PaymentStatus = 'Pending' | 'Validated' | 'Failed' | 'Refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  productReferenceSnapshot?: string;
  productImageUrl?: string;
  unitPriceHt: number;
  unitTvaRate: number;
  unitPriceTtc: number;
  quantity: number;
  totalLineTtc: number;
  totalHt?: number;
  totalTtc?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  billingAddress?: Address;
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
  paymentLast4?: string;
  shippingCost?: number;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutDto {
  cartId: string;
  addressId?: string;
  paymentMethodId?: string;
  stripePaymentIntentId?: string;
  saveCard?: boolean;
  newAddress?: CreateAddressDto;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  totalTtc: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  issuedAt: string;
  pdfUrl?: string;
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export interface ContactMessageDto {
  email: string;
  subject: string;
  message: string;
}

// ─── Admin / Carousel ────────────────────────────────────────────────────────
export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  productId?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface HomepageConfig {
  carousel?: CarouselSlide[];
  carouselSlides?: CarouselSlide[];
  featuredText?: string;
  featuredTitle?: string;
  topProductIds?: string[];
  featuredProductIds?: string[];
  featuredCategoryIds?: string[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[];
  total?: number;
  pagination?: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ─── API Error ────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
  traceId?: string;
}

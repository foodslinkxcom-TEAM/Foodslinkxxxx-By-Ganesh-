# Hotel Order Management System by FoodsLinkX

A full-stack real-time hotel order management system built with Next.js, MongoDB, and Server-Sent Events (SSE).

## Features

### Customer Features
- Mobile-first menu browsing with categories and search
- Click menu items to view details and add customizations
- Shopping cart with quantity management
- Device-based order tracking (same device = same order)
- UPI QR code payment integration
- Order status tracking in real-time
- Automatic invoice generation after order placement
- Invoice download and printing options
- Feedback and rating system

### Hotel Staff Features
- Real-time order dashboard with SSE updates
- Order status management (Pending → Cooking → Served → Paid)
- Live order statistics
- Order history and analytics
- Invoice management and download for all orders
- Dedicated invoices page with filtering options

### Admin Features
- Hotel registration and verification
- Analytics dashboard (total orders, revenue, feedback)
- Hotel management and approval system

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Real-time**: Server-Sent Events (SSE)
- **Payment**: UPI QR Code Generation
- **Authentication**: JWT with HTTP-only cookies

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
* **MongoDB**: You'll need a running instance of MongoDB. You can use a local installation or a cloud service like MongoDB Atlas.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/hotel-order-management.git
   cd hotel-order-management
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env.local` file in the root of the project and add the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=a_strong_secret_key_for_jwt
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.


## Project Structure
The project is organized into the following directories:
\`\`\`
/app                  # Next.js App Router for pages and API routes
/components           # Reusable React components
/data                 # Mock data for testing and development
/hooks                # Custom React hooks
/lib                  # Core utilities, database models, and authentication
/public               # Static assets like images and fonts
/styles               # Global CSS styles
\`\`\`

## Usage

### Customer Flow

1. **Access Menu**: Visit `/hotels/[hotelId]` (e.g., `/hotels/123`)
2. **Browse Menu**: Search and filter items by category
3. **Add Items**: Click menu items to view details and add customizations
4. **Checkout**: Go to cart and proceed to payment
5. **Payment**: Scan UPI QR code and confirm payment
6. **Track Order**: View order status in real-time

### Hotel Staff Flow

1. **Access Dashboard**: Visit `/dashboard/hotels/[hotelId]`
2. **View Orders**: See all active orders with real-time updates
3. **Update Status**: Click "Mark as..." to update order status
4. **Track Stats**: Monitor pending, cooking, served, and paid orders

### Admin Flow

1. **Access Admin Panel**: Visit `/admin`
2. **Verify Hotels**: Approve or reject hotel registrations
3. **View Analytics**: See total orders, revenue, and hotel statistics

## Key Features Explained

### Device-Based Order Management

When a customer places an order from a device:
- The system generates a unique device ID stored in localStorage
- If the same device has an active order, new items are added to that order
- This prevents duplicate orders from the same table

### Real-time Updates with SSE

- Hotel dashboard connects to `/api/events/sse?hotelId=[id]`
- When an order is created or updated, all connected clients receive instant updates
- No polling required - true real-time updates

### UPI Payment Integration

- Generates UPI string: `upi://pay?pa=<upiId>&pn=<hotelName>&am=<amount>&tn=Order-<orderId>`
- Converts to QR code using qrcode library
- Staff manually confirms payment after customer completes transaction

## API Endpoints

### Hotels
- `GET /api/hotels` - List verified hotels
- `POST /api/hotels` - Register new hotel
- `GET /api/hotels/[id]` - Get hotel details
- `PATCH /api/hotels/[id]` - Update hotel

### Orders
- `GET /api/orders` - Get active order for device
- `POST /api/orders` - Create/add to order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order
- `PATCH /api/orders/[id]/pay` - Mark as paid
- `DELETE /api/orders/[id]` - Delete order

### Payment
- `POST /api/payment/qr` - Generate UPI QR code

### Feedback
- `POST /api/feedback` - Submit feedback

### Real-time
- `GET /api/events/sse` - SSE connection for real-time updates

### Admin
- `GET /api/admin/hotels` - List all hotels
- `PATCH /api/admin/hotels/[id]/verify` - Verify hotel
- `DELETE /api/admin/hotels/[id]` - Reject hotel
- `GET /api/admin/stats` - Get analytics

## Database Schema

### Hotels
\`\`\`javascript
{
  name: String,
  address: String,
  latitude: Number,
  longitude: Number,
  upiId: String,
  verified: Boolean,
  plan: String, // "free", "basic", "premium"
  planExpiry: Date,
  maxTables: Number,
  maxOrdersPerTable: Number,
  locationVerificationRadius: Number,
  menu: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    available: Boolean,
    image: String
  }],
  createdAt: Date
}
\`\`\`

### Orders
\`\`\`javascript
{
  hotelId: String,
  table: String,
  deviceId: String,
  items: [{
    _id: String,
    name: String,
    price: Number,
    quantity: Number,
    customization: String
  }],
  total: Number,
  status: "pending" | "cooking" | "served" | "paid",
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-hosted

1. Set up MongoDB instance
2. Deploy to your server (Node.js hosting)
3. Configure environment variables
4. Run `npm run build && npm start`

## Future Enhancements

- Email/SMS bill delivery
- Multiple payment methods
- Kitchen display system (KDS)
- Table management
- Staff role management
- Advanced analytics and reporting
- PWA support for offline menus
- Multi-language support

## License

MIT
\`\`\`

```json file="" isHidden

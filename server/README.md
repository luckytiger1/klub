# Klub Server

This is the backend server for the Klub app, a payment solution for restaurants.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory of the project with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

3. Set up the database schema:
   - Option 1: Run the SQL script in the Supabase dashboard
     - Go to the SQL Editor in the Supabase dashboard
     - Copy the contents of `schema.sql` and run it
   - Option 2: Run the setup script (Note: This may not work if you don't have the right permissions)
     ```bash
     npm run setup-db
     ```

## Running the Server

```bash
npm run start:js
```

The server will start on port 3001 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Health Check
- `GET /api/health`: Check if the server is running and if the database connection is working

### Restaurant Endpoints
- `GET /api/restaurant`: Get all restaurants
- `GET /api/restaurant/:id`: Get a restaurant by ID
- `POST /api/restaurant`: Create a new restaurant
- `PUT /api/restaurant/:id`: Update a restaurant
- `DELETE /api/restaurant/:id`: Delete a restaurant
- `POST /api/restaurant/:id/qr-codes`: Generate a QR code for a table

### User Endpoints
- `GET /api/user`: Get all users
- `GET /api/user/:id`: Get a user by ID
- `POST /api/user`: Create a new user
- `PUT /api/user/:id`: Update a user
- `DELETE /api/user/:id`: Delete a user

### Bill Endpoints
- `GET /api/bill`: Get all bills
- `GET /api/bill/:id`: Get a bill by ID (includes bill items)
- `POST /api/bill`: Create a new bill
- `PUT /api/bill/:id`: Update a bill
- `DELETE /api/bill/:id`: Delete a bill
- `GET /api/bill/:id/items`: Get items for a bill
- `POST /api/bill/:id/items`: Add items to a bill

### Payment Endpoints
- `GET /api/payment`: Get all payments
- `GET /api/payment/:id`: Get a payment by ID
- `POST /api/payment`: Create a new payment
- `PUT /api/payment/:id`: Update a payment
- `DELETE /api/payment/:id`: Delete a payment
- `GET /api/payment/bill/:billId`: Get payments for a bill
- `GET /api/payment/user/:userId`: Get payments for a user

## Database Schema

The database schema includes the following tables:

- `restaurants`: Stores information about restaurants
- `profiles`: Stores user profiles
- `qr_codes`: Stores QR codes for restaurant tables
- `bills`: Stores bills for restaurant tables
- `bill_items`: Stores items in a bill
- `payments`: Stores payments for bills

For more details, see the `schema.sql` file. 
# Klub App

A modern restaurant payment solution built with Next.js and React. Klub allows restaurant customers to scan QR codes, view bills, split payments, and more, while providing restaurant owners with powerful management tools.

## Features

### For Customers
- QR code scanning functionality
- Bill viewing and splitting interface
- Payment processing
- Receipt/confirmation screens
- User profile and payment history

### For Restaurants
- Order management system
- Payment tracking
- Analytics and reporting
- Table management
- QR code generation for tables

## Tech Stack

- **Frontend**: React.js with Next.js
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Charts**: Chart.js with react-chartjs-2
- **QR Code**: react-qr-reader for scanning, qrcode.react for generation

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/klub-app.git
   cd klub-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
klub-app/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── user/             # Customer-facing routes
│   │   ├── restaurant/       # Restaurant-facing routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── user/             # Customer-facing components
│   │   └── restaurant/       # Restaurant-facing components
│   ├── lib/                  # Utility functions and hooks
│   └── styles/               # Global styles
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
└── tailwind.config.js        # Tailwind CSS configuration
```

## Development

### Key Components

- **QRScanner**: Allows users to scan QR codes to access their bills
- **BillView**: Displays bill details and allows for payment/splitting
- **QRCodeGenerator**: Allows restaurants to generate QR codes for tables
- **AnalyticsDashboard**: Provides restaurants with sales and customer analytics

### Styling

The project uses Tailwind CSS for styling with custom components defined in `src/styles/globals.css`.

## Deployment

The application can be deployed to Vercel with a single command:

```bash
vercel
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [QRCode.react](https://github.com/zpao/qrcode.react) 
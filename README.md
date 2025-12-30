# React

A modern React-based project utilizing the latest frontend technologies and tools for building responsive web applications.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Redux Toolkit** - State management with simplified Redux setup
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Data Visualization** - Integrated D3.js and Recharts for powerful data visualization
- **Form Management** - React Hook Form for efficient form handling
- **Animation** - Framer Motion for smooth UI animations
- **Testing** - Jest and React Testing Library setup

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
   
2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## 📁 Project Structure

```
react_app/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── App.jsx         # Main application component
│   ├── Routes.jsx      # Application routes
│   └── index.jsx       # Application entry point
├── .env                # Environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## 🧩 Adding Routes

To add new routes to the application, update the `Routes.jsx` file:

```jsx
import { useRoutes } from "react-router-dom";
import HomePage from "pages/HomePage";
import AboutPage from "pages/AboutPage";

const ProjectRoutes = () => {
  let element = useRoutes([
    { path: "/", element: <HomePage /> },
    { path: "/about", element: <AboutPage /> },
    // Add more routes as needed
  ]);

  return element;
};
```

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.

## Google Analytics Integration

This project includes Google Analytics 4 (GA4) for tracking user behavior, subscription conversions, and feature adoption.

### Setup

1. Obtain your GA4 Measurement ID from Google Analytics:
   - Go to Admin > Data Streams > Select your stream
   - Copy the Measurement ID (format: G-XXXXXXXXXX)

2. Add the Measurement ID to your `.env` file:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. The analytics will be automatically enabled in production mode only.

### Features

- **Automatic Page View Tracking**: Tracks all navigation within the SPA
- **Subscription Conversion Tracking**: Monitors plan selection and subscription events
- **Feature Adoption Metrics**: Tracks usage of invoicing, expenses, reports, and tax features
- **User Behavior Analytics**: Monitors dashboard interactions, searches, and filters
- **Authentication Events**: Tracks login, logout, and registration events

### Testing

- **Development Mode**: Analytics logs to console but doesn't send data to GA4
- **Production Mode**: Full tracking enabled with real-time data
- **Debug Mode**: Enable in GA4 dashboard for DebugView access

### Event Categories

1. **Subscription Events**:
   - `view_subscription_plans`
   - `select_subscription_plan`
   - `subscription_conversion`
   - `toggle_billing_cycle`

2. **Feature Adoption Events**:
   - Invoice: `create_invoice`, `download_invoice`, `send_invoice`
   - Expenses: `add_expense`, `filter_expenses`, `export_expenses`
   - Reports: `view_report`, `export_report`, `change_report_date_range`
   - Clients: `add_client`, `view_client_details`, `edit_client`
   - Tax: `prepare_tax_declaration`, `submit_tax_declaration`

3. **Engagement Events**:
   - `dashboard_interaction`
   - `search`
   - `filter_usage`
   - `export_data`

4. **Authentication Events**:
   - `login`
   - `logout`
   - `sign_up`

### Viewing Analytics

1. Go to Google Analytics dashboard
2. Navigate to Reports > Realtime for live data
3. Check standard reports after 24-48 hours for historical data
4. Create custom reports using event parameters

## 📦 Deployment

Build the application for production:

```bash
npm run build
```

## 🙏 Acknowledgments

- Built with [Rocket.new](https://rocket.new)
- Powered by React and Vite
- Styled with Tailwind CSS

Built with ❤️ on Rocket.new
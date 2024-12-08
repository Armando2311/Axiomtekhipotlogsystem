# Axiomtek HiPot Test Log System

A modern, efficient web application for managing and tracking HiPot test results at Axiomtek. This system streamlines the process of recording, viewing, and managing test logs with PDF generation capabilities.

## 🚀 Features

- **Secure Authentication**
  - JWT-based authentication system
  - Protected routes and API endpoints
  - Role-based access control

- **Test Log Management**
  - Create new test logs with multiple serial numbers
  - Automatic PDF generation for test reports
  - View and download test logs in PDF format
  - Delete outdated or incorrect logs
  - Search and filter capabilities

- **User-Friendly Interface**
  - Modern, responsive design
  - Intuitive navigation
  - Real-time feedback
  - Confirmation dialogs for critical actions

## 🛠️ Technology Stack

### Frontend
- **React + TypeScript**
  - Type safety and better developer experience
  - Component-based architecture for reusability
  - Strong ecosystem and community support

- **Vite**
  - Lightning-fast development server
  - Optimized build process
  - Modern development experience

- **Tailwind CSS**
  - Utility-first CSS framework
  - Rapid UI development
  - Highly customizable design system

### Backend
- **Node.js + Express**
  - Fast and efficient server runtime
  - Easy to maintain and scale
  - Great for real-time applications

- **SQLite Database**
  - Lightweight and serverless
  - Perfect for single-instance applications
  - Easy backup and maintenance

### PDF Generation
- **jsPDF**
  - Client-side PDF generation
  - Customizable templates
  - Lightweight and efficient

### Authentication
- **JSON Web Tokens (JWT)**
  - Stateless authentication
  - Secure and scalable
  - Cross-domain compatibility

## 🏗️ Project Structure

```
/
├── src/                # Frontend source code
│   ├── components/     # Reusable React components
│   ├── contexts/       # React context providers
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions and API clients
│   └── utils/         # Helper functions
├── public/            # Static assets
└── server.js          # Backend Express server
```

## 🚀 Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/Armando2311/Axiomtekhipotlogsystem.git
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   # Terminal 1 - Backend
   node server.js

   # Terminal 2 - Frontend
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser

## 🔐 Environment Setup

The application requires the following environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 3002)

## 💡 Why These Technologies?

1. **React + TypeScript**
   - Strong type checking prevents runtime errors
   - Better IDE support and code completion
   - Easier maintenance and refactoring

2. **Vite**
   - Faster than Create React App
   - Better developer experience
   - Modern features out of the box

3. **SQLite**
   - Perfect for single-instance applications
   - No separate database server needed
   - Easy backup and version control

4. **Tailwind CSS**
   - Rapid UI development
   - No need for separate CSS files
   - Consistent design system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential. All rights reserved.

# Thesis Tracker Application

A comprehensive web application for managing and tracking thesis projects. This application facilitates collaboration between students and advisors with real-time messaging, document management, feedback systems, and scheduling tools.

## Features

- **Real-time Communication**
  - Instant messaging between students and advisors
  - Real-time notifications for important events
  - Socket.IO integration for live updates

- **Document Management**
  - PDF document viewer with annotation capabilities
  - Document version control
  - Comment and feedback system on specific parts of documents

- **Scheduling & Calendar**
  - Thesis milestone tracking
  - Meeting scheduling
  - Calendar integration with event reminders

- **Progress Tracking**
  - Visual representations of thesis progress
  - Milestone completion tracking
  - Task management for thesis components

- **User Management**
  - Role-based access control (students, advisors, administrators)
  - Customizable user profiles
  - Authentication and authorization

## Technology Stack

- **Frontend**
  - Next.js 15 (React framework)
  - React 19
  - TailwindCSS 4
  - SWR for data fetching
  - Socket.IO Client for real-time communication
  - React PDF for document viewing

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - Socket.IO for real-time features
  - NextAuth.js for authentication

- **Database**
  - PostgreSQL (production)
  - SQLite (development)

- **Testing**
  - Jest
  - React Testing Library

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/thesis-tracker-app.git
   cd thesis-tracker-app
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration

4. Set up the database
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
thesis-tracker-app/
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── server.js            # Custom server for Socket.IO integration
├── src/
│   ├── app/             # Next.js 15 app router components
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utility functions and hooks
│   │   ├── hooks/       # Custom React hooks
│   │   ├── validations/ # Zod schema validations
│   │   ├── db.ts        # Database client
│   │   ├── auth.ts      # Authentication configuration
│   │   └── utils.ts     # General utilities
│   ├── pages/           # Next.js page components (API routes)
│   └── types/           # TypeScript type definitions
└── tests/               # Test files
```

## Development Workflow

### Code Style and Linting

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Build for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Deployment

The application can be deployed to various platforms:

- Vercel (recommended for Next.js applications)
- Railway
- Heroku
- Self-hosted environments

Ensure that you set up the proper environment variables on your deployment platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for the deployment platform
- All open-source contributors to the libraries used in this project
"# Thesis-Tracker" 

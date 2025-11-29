# PR Tracker - Personal Record Tracking SaaS

A clean, mobile-friendly web application for tracking your powerlifting personal records and workout progress. Built with Next.js and Firebase, PR Tracker helps you log lifts, visualize progress, and stay motivated on your fitness journey.

🌐 **Live at:** [prtracker.org](https://prtracker.org/signup)

![PR Tracker](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## ✨ Recent Improvements

- **Complete Test Coverage**: 100% test coverage for all authentication functions (523+ lines of tests)
- **Performance Optimization**: Implemented SWR for intelligent data caching, reducing database reads by up to 80%
- **Code Quality**: Comprehensive refactoring for consistency and maintainability
- **Production Ready**: Custom domain connected and live at [prtracker.org](https://prtracker.org)

## 🚀 Features

### Core Functionality

- **Workout Logging**: Quickly log your workouts with exercises, sets, reps, and weights
- **PR Tracking**: Track personal records across all major lifts (squat, bench, deadlift, and more)
- **Progress Analytics**: Visualize your strength gains with comprehensive charts and insights
- **Past Workouts**: View and analyze your workout history
- **Weekly Summaries**: Get insights into your weekly progress, streaks, and achievements
- **User Profile Management**: Update your name, email, and password

### User Experience

- **Mobile-First Design**: Optimized for all devices and screen sizes
- **Clean UI**: Modern, gradient-based design with intuitive navigation
- **Efficient Data Fetching**: SWR-powered caching reduces load times and database costs
- **Real-time Updates**: Instant synchronization with Firebase
- **Authentication**: Secure user authentication with Firebase Auth
- **Settings Management**: Easy-to-use settings page for account management

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.2](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Firebase](https://firebase.google.com/)
  - Authentication
  - Firestore Database
  - Storage
- **Testing**: [Vitest](https://vitest.dev/) with React Testing Library
- **Data Fetching**: [SWR](https://swr.vercel.app/) for efficient caching and data synchronization
- **Deployment**: Firebase Hosting (Static Export)
- **Domain**: [prtracker.org](https://prtracker.org)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project with Authentication, Firestore, and Storage enabled

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd pr-saas
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Set up Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Set up Storage
   - Copy your Firebase config values to `.env.local`

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
pr-saas/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   │   ├── charts/       # Progress charts
│   │   ├── past-workouts/# Workout history
│   │   ├── settings/     # User settings
│   │   └── workout/      # Workout logging
│   ├── login/            # Authentication pages
│   ├── signup/           # Sign up page
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/               # Reusable UI components
│   └── workout/          # Workout-related components
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase configuration and functions
│   └── hooks/            # Custom React hooks
├── __tests__/           # Test files
└── public/              # Static assets
```

## 🧪 Testing

Run tests with:

```bash
npm test          # Run tests in watch mode
npm run test:run  # Run tests once
npm run test:ui   # Run tests with UI
```

## 🏗️ Building for Production

Build the application:

```bash
npm run build
```

This creates an optimized production build in the `out/` directory, ready for static hosting.

## 🚀 Deployment

### Live Site

The application is live at **[prtracker.org](https://prtracker.org)** and deployed via Firebase Hosting.

### Firebase Hosting

The project is configured for Firebase Hosting with static export:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase**

   ```bash
   npm run deploy
   ```

   Or manually:

   ```bash
   firebase deploy --only hosting
   ```

The custom domain `prtracker.org` is configured and connected to Firebase Hosting.

### GitHub Actions

The project includes GitHub Actions workflows for automated deployment:

- **Pull Request Workflow**: Creates preview deployments for PRs
- **Merge Workflow**: Deploys to production on merge to `main`

Make sure to set up the following GitHub Secrets:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_POWERLIFTING_PROJECT_B3393`

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server (not used with static export)
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run deploy` - Build and deploy to Firebase Hosting

## 🎨 Key Features in Detail

### Workout Logging

- Add custom exercises to your library
- Log sets, reps, and weights
- Track workout duration
- Save and review past workouts

### Progress Tracking

- Weekly summary with workout counts
- Personal record tracking
- Progress charts and visualizations
- Workout streaks and statistics

### User Management

- Secure authentication
- Profile management
- Email and password updates
- Account settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Firebase](https://firebase.google.com/)

---

**Note**: This is a static export Next.js application. All environment variables prefixed with `NEXT_PUBLIC_` are embedded at build time. Make sure to set these variables before building for production.

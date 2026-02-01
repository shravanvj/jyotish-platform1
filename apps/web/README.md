# Jyotish Platform - Web Application

A modern, full-featured Vedic Astrology web application built with Next.js 14, React 18, and TypeScript.

## Features

### Core Features
- **Birth Chart Generation** - Generate accurate Vedic birth charts with South and North Indian styles
- **Panchang** - Daily Hindu calendar with Tithi, Nakshatra, Yoga, Karana, and more
- **Horoscopes** - Daily, weekly, monthly, and yearly predictions for all 12 rashis
- **Matchmaking (Kundali Milan)** - Compatibility analysis with Ashtakoot system
- **Muhurat Finder** - Find auspicious times for various activities

### User Features
- **User Authentication** - Email/password and Google OAuth
- **Profile Management** - Store multiple birth profiles
- **Report Generation** - Generate and download detailed PDF reports
- **API Keys** - Manage API access for developers

### Technical Features
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - Theme toggle with system preference support
- **Real-time Updates** - React Query for efficient data fetching
- **Type Safety** - Full TypeScript coverage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see `/apps/api`)

### Installation

```bash
# Navigate to web directory
cd apps/web

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your settings
```

### Configuration

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (NextAuth, etc.)
│   ├── about/             # About page
│   ├── chart/             # Birth chart page
│   ├── contact/           # Contact page
│   ├── dashboard/         # User dashboard
│   ├── horoscope/         # Horoscope page
│   ├── login/             # Login page
│   ├── matchmaking/       # Kundali matching
│   ├── muhurat/           # Muhurat finder
│   ├── panchang/          # Panchang calendar
│   ├── pricing/           # Pricing page
│   ├── profile/           # User profile/settings
│   ├── register/          # Registration page
│   ├── reports/           # Reports management
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # App providers
│
├── components/
│   ├── auth/              # Authentication components
│   ├── charts/            # Chart visualization components
│   │   ├── south-indian-chart.tsx
│   │   └── north-indian-chart.tsx
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (Header, Footer)
│   └── ui/                # Reusable UI components
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown.tsx
│       ├── error-boundary.tsx
│       ├── input.tsx
│       ├── loading.tsx
│       ├── modal.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── tabs.tsx
│       ├── theme-toggle.tsx
│       └── toast.tsx
│
├── contexts/              # React contexts
│   └── auth-context.tsx
│
├── hooks/                 # Custom React hooks
│   ├── index.ts          # Utility hooks
│   └── use-api.ts        # API query hooks
│
├── lib/                   # Utilities and configuration
│   ├── api.ts            # API client
│   ├── auth.ts           # NextAuth configuration
│   ├── query-client.tsx  # React Query setup
│   └── utils.ts          # Utility functions
│
├── store/                 # Zustand state management
│   └── index.ts
│
├── styles/               # Global styles
│   └── globals.css
│
├── types/                # TypeScript types
│   └── index.ts
│
└── middleware.ts         # Route protection middleware
```

## Pages Overview

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Landing page | No |
| `/login` | User login | Guest only |
| `/register` | User registration | Guest only |
| `/dashboard` | User dashboard | Yes |
| `/chart` | Birth chart generator | No |
| `/panchang` | Daily panchang | No |
| `/horoscope` | Horoscope predictions | No |
| `/matchmaking` | Kundali matching | No |
| `/muhurat` | Muhurat finder | No |
| `/profile` | User settings | Yes |
| `/reports` | Report management | Yes |
| `/pricing` | Pricing plans | No |
| `/about` | About us | No |
| `/contact` | Contact form | No |
| `/api-docs` | API documentation | No |
| `/terms` | Terms of service | No |
| `/privacy` | Privacy policy | No |

### Special Pages

- `/not-found.tsx` - Custom 404 error page
- `/error.tsx` - Runtime error boundary
- `/loading.tsx` - Global loading state

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI Primitives

## API Hooks

All API interactions use React Query hooks:

```typescript
// Birth Chart
const { mutate: calculateChart } = useBirthChartCalculation();

// Panchang
const { data: panchang } = useDailyPanchang(params);

// Horoscope
const { data: horoscope } = useDailyHoroscope('mesha');

// Matchmaking
const { mutate: calculateMatch } = useMatchmakingCalculation();

// Muhurat
const { mutate: searchMuhurat } = useMuhuratSearch();

// Profiles
const { data: profiles } = useProfiles();
const { mutate: createProfile } = useCreateProfile();

// Reports
const { data: reports } = useReports();
const { mutate: createReport } = useCreateReport();
```

## Authentication

Protected routes automatically redirect to login:

```typescript
// Using middleware (automatic)
// Routes in protectedRoutes array are protected

// Using component wrapper
import { ProtectedRoute } from '@/components/auth';

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}

// Using hook
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

## Theming

The app supports light and dark modes:

```typescript
import { ThemeToggle } from '@/components/ui';

// Use the theme toggle component
<ThemeToggle />
```

## Toast Notifications

```typescript
import { useToast } from '@/components/ui/toast';

function MyComponent() {
  const { addToast } = useToast();
  
  const showSuccess = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed successfully',
    });
  };
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

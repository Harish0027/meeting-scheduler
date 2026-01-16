# Scalar Schedule

A production-ready scheduling platform inspired by [Cal.com](https://cal.com), built with modern web technologies.

## 📋 Overview

Scalar Schedule is a full-stack meeting scheduler that allows users to:

- Create and manage event types with custom durations
- Set availability across different days and time slots
- Generate public booking links for others to book meetings
- Manage bookings with double-booking prevention
- View upcoming and past bookings

## ✨ Features

### Core Features

- **Event Type Management**

  - Create, edit, and delete event types
  - Unique URL slugs for each event
  - Duration and description customization
  - Dashboard listing of all events

- **Availability Management**

  - Set working days and hours
  - Per-day time slot configuration
  - Timezone support
  - Flexible scheduling

- **Public Booking Interface**

  - Cal.com-inspired UI design
  - Interactive calendar for date selection
  - Real-time availability checking
  - Form validation with Zod
  - Booking confirmation

- **Bookings Dashboard**

  - View upcoming and past bookings
  - Filter by status
  - Cancel bookings
  - Display booking details

- **Security & Validation**
  - Double-booking prevention
  - Zod schema validation (frontend & backend)
  - Type-safe API client
  - CORS enabled

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Zod** - Form validation
- **Zustand** - State management (when needed)
- **react-hot-toast** - Notifications
- **date-fns** - Date utilities

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Zod** - Request validation
- **TypeScript** - Type safety

### UI Components (shadcn/ui)

- Button
- Card
- Input
- Label
- Badge
- Dialog
- Calendar

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd meeting-scheduler
   ```

2. **Backend Setup**

   ```bash
   cd backend

   # Install dependencies
   npm install

   # Configure environment
   cp .env.example .env.local
   # Edit .env.local with your PostgreSQL URL

   # Setup database
   npx prisma migrate dev

   # Start development server
   npm run dev
   # Server runs on http://localhost:3001
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   # App runs on http://localhost:3000
   ```

### Environment Variables

**Backend (.env.local)**

```
DATABASE_URL=postgresql://user:password@localhost:5432/scalar_schedule
NODE_ENV=development
PORT=3001
```

**Frontend (.env.local)**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📡 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

The system uses a default admin user. No authentication flow is implemented for this version.

### Endpoints

#### Users

- `POST /users` - Create/get user
- `GET /users/profile` - Get current user
- `GET /users/:username` - Get user by username

#### Event Types

- `POST /event-types` - Create event type
- `GET /event-types/all` - List all event types
- `GET /event-types/:id` - Get event type details
- `PUT /event-types/:id` - Update event type
- `DELETE /event-types/:id` - Delete event type
- `GET /event-types/:username/:slug` - Get public event type

#### Availability

- `POST /availability` - Set availability for a day
- `GET /availability` - Get user availability
- `DELETE /availability/:dayOfWeek` - Delete availability

#### Bookings

- `POST /bookings/:username/:slug` - Create booking (public)
- `GET /bookings` - List bookings
- `GET /bookings/:id` - Get booking details
- `GET /bookings/upcoming` - Get upcoming bookings
- `GET /bookings/past` - Get past bookings
- `PUT /bookings/:id/cancel` - Cancel booking
- `GET /bookings/:username/:slug/slots` - Get available time slots

## 🔒 Validation

### Frontend Validation (Zod)

All forms use Zod for client-side validation:

- Event type forms
- Booking forms
- Availability forms

### Backend Validation (Zod)

Request bodies are validated using Zod schemas:

```typescript
createEventTypeSchema;
updateEventTypeSchema;
createBookingSchema;
setAvailabilitySchema;
```

### Double-Booking Prevention

- Time slots are checked in real-time
- Bookings use database transactions
- Overlapping slots are prevented at creation

## 🗄 Database Schema

### Models

**User**

- id, username (unique), email (unique)
- timezone, createdAt, updatedAt
- Relations: EventTypes, Availabilities, Bookings

**EventType**

- id, userId, title, description
- duration (in minutes), slug
- unique constraint on (userId, slug)
- Relations: User, Bookings

**Availability**

- id, userId, dayOfWeek (0-6)
- startTime, endTime (HH:MM format)
- unique constraint on (userId, dayOfWeek)
- Relations: User

**Booking**

- id, eventTypeId, userId
- bookerName, bookerEmail, bookerPhone
- startTime, endTime (DateTime)
- status (confirmed/cancelled), notes
- Relations: EventType, User

### Indexes

- User: username, email
- EventType: userId, slug
- Availability: userId
- Booking: userId, eventTypeId, startTime, bookerEmail

## 📐 Architecture

### Backend Architecture

```
src/
├── controllers/      # Route handlers
├── services/         # Business logic
├── routes/          # API routes
├── middlewares/     # Express middlewares
├── validators/      # Zod schemas
├── db/              # Database connection
└── index.ts         # Entry point
```

### Frontend Architecture

```
app/
├── dashboard/                    # Admin dashboard
├── event-types/[id]/            # Event type form
├── availability/                # Availability settings
├── bookings/                    # Bookings list
└── [username]/[slug]/           # Public booking page
components/
├── ui/                          # shadcn/ui components
lib/
├── api.ts                       # API client
├── store.ts                     # Zustand store
├── validations.ts               # Zod schemas
└── utils.ts                     # Utilities
```

## 🎨 UI/UX Design

- **Cal.com-inspired** clean and minimal design
- **Responsive** - Mobile, tablet, desktop
- **Accessible** - Semantic HTML, proper labels
- **Consistent** - Uniform spacing, typography, colors
- **Interactive** - Real-time validation, toast notifications
- **Optimized** - Fast load times, smooth interactions

## 🔐 Security Features

- Input validation with Zod
- SQL injection prevention (Prisma ORM)
- CORS enabled for cross-origin requests
- Type-safe API communication
- Environment variable protection
- Request/response error handling

## 📦 Deployment

### Backend (Production)

```bash
npm run build
npm start
```

### Frontend (Production)

```bash
npm run build
npm start
```

Both are ready for deployment on platforms like:

- Vercel (Frontend)
- Heroku, Railway, or AWS (Backend)

## 🧪 Testing the Application

1. **Create an event type**

   - Navigate to dashboard
   - Click "New Event"
   - Fill in details and create

2. **Set availability**

   - Go to "Availability" settings
   - Select days and set working hours
   - Save configuration

3. **Create a booking**

   - Get the public booking link
   - Select a date, time, and enter details
   - Confirm booking

4. **Manage bookings**
   - View bookings in the dashboard
   - See upcoming and past bookings
   - Cancel bookings if needed

## 📝 Assumptions

1. **Single Admin User** - One default admin user (email: admin@scalar-schedule.com)
2. **No Authentication** - No signup/login flow required
3. **Public Bookings** - Booking pages are publicly accessible
4. **Timezone Handling** - All times stored in UTC, frontend converts based on user timezone
5. **15-minute Slots** - Available time slots are generated in 15-minute intervals
6. **PostgreSQL** - Database is PostgreSQL (can be adapted for other databases)
7. **Transactional Bookings** - Bookings are atomic to prevent double-booking

## 🔧 Development

### Scripts

**Backend**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio
```

**Frontend**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 📝 Environment Setup for Development

1. Install PostgreSQL locally or use a cloud provider
2. Create a database called `scalar_schedule`
3. Set `DATABASE_URL` in backend `.env.local`
4. Run `npx prisma migrate dev`
5. The admin user is created automatically on first server start

## 🐛 Troubleshooting

**Port already in use**

```bash
# Change PORT in .env.local
PORT=3002
```

**Database connection error**

```bash
# Verify DATABASE_URL and PostgreSQL is running
psql -U postgres -d scalar_schedule
```

**API calls failing**

```bash
# Check NEXT_PUBLIC_API_URL in frontend .env.local
# Ensure backend is running on http://localhost:3001
```

## 📚 Key Libraries & Their Usage

| Library         | Purpose                      |
| --------------- | ---------------------------- |
| Prisma          | ORM for database operations  |
| Zod             | Schema validation            |
| Express         | REST API framework           |
| Next.js         | React framework with SSR     |
| Tailwind CSS    | Utility-first CSS            |
| Zustand         | Lightweight state management |
| react-hot-toast | Toast notifications          |
| date-fns        | Date manipulation            |

## 🎯 Performance Optimizations

- **Database Indexes** - On frequently queried fields
- **Pagination** - For large booking lists
- **Debouncing** - For form input validation
- **Caching** - Availability data can be cached
- **SSR** - Public booking pages for better SEO
- **Optimized Queries** - Eager loading of relations

## 🚀 Future Enhancements

- Email notifications on booking confirmation
- Calendar sync (Google Calendar, Outlook)
- Timezone auto-detection
- Custom branding for public pages
- Meeting reminders
- Video conferencing integration
- Recurring events
- Advanced analytics

## 📄 License

ISC

## 👥 Contributing

This is a Scalar SDE Intern assignment project.

---

**Built with ❤️ for Scalar**

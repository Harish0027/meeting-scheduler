# 📅 Scalar Schedule

[![GitHub Repo](https://img.shields.io/badge/GitHub-meeting--scheduler-blue?logo=github)](https://github.com/Harish0027/meeting-scheduler)

A production-ready meeting scheduling platform inspired by [Cal.com](https://cal.com), built with modern web technologies. This project demonstrates a full-stack implementation with user authentication, event management, availability scheduling, and booking functionality.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Caching Strategy](#caching-strategy)

---

## 🎯 Overview

Scalar Schedule allows users to:

- Create and manage event types with custom durations
- Set availability schedules across different days and time zones
- Generate public booking links for others to book meetings
- Manage bookings with double-booking prevention
- View, filter, and manage upcoming and past bookings

---

## 🏗️ System Architecture

---

## 🔄 User Flow Diagram

```
┌───────────────┐
│    Visitor    │
└───────┬───────┘
  │
  ▼
┌─────────────────────────────┐
│  Booking Link (Public URL)  │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Select Event Type & Date   │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  See Available Time Slots   │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Fill Booking Form          │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Submit Booking             │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Frontend (Next.js)         │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Backend (Express.js)       │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Cache (Upstash Redis)      │
└───────┬─────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Database (Neon/Postgres)   │
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│  Confirmation Page          │
└─────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                              MEETING SCHEDULER SYSTEM                                      │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                           FRONTEND (Next.js + React + TS)                            │  │
│  ├──────────────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                      │  │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │  │
│  │   │ Dashboard    │   │ Bookings     │   │ Availability │   │ Event Types  │        │  │
│  │   │   Page       │   │   Page       │   │   Page       │   │   Page       │        │  │
│  │   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘        │  │
│  │                                                                                      │  │
│  │   ┌──────────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                        Zustand Store (State Management)                        │ │  │
│  │   └──────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                      │  │
│  │   ┌──────────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                         API Service (lib/api.ts)                              │ │  │
│  │   └──────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                            BACKEND (Express + TypeScript)                            │  │
│  ├──────────────────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                                      │  │
│  │   ┌──────────────────────────────────────────────────────────────────────────────┐ │  │
│  │   │                         Express Application                                   │ │  │
│  │   ├──────────────────────────────────────────────────────────────────────────────┤ │  │
│  │   │  /api/users                                                                   │ │  │
│  │   │  /api/bookings                                                                │ │  │
│  │   │  /api/schedules                                                               │ │  │
│  │   │  /api/event-types                                                             │ │  │
│  │   └──────────────────────────────────────────────────────────────────────────────┘ │  │
│  │                                                                                      │  │
│  │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                          │  │
│  │   │ Redis Cache  │   │ Prisma ORM   │   │  Validation  │                          │  │
│  │   │ (Upstash)    │   │ (Postgres)   │   │  (Zod)       │                          │  │
│  │   └──────────────┘   └──────────────┘   └──────────────┘                          │  │
│  │                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                            │
│  ┌──────────────────────────────┐   ┌──────────────────────────────┐                    │
│  │        Upstash Redis         │   │        Neon/Postgres         │                    │
│  │        (Cloud Cache)         │   │        (Database)            │                    │
│  └──────────────────────────────┘   └──────────────────────────────┘                    │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│ Frontend │────▶│ Backend  │────▶│  Cache   │────▶│ Database │
│  Action  │     │(Next.js) │     │(Express) │     │ (Redis)  │     │(Postgres)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                │                │                │
     │   1. Click     │                │                │                │
     │───────────────▶│                │                │                │
     │                │  2. API Call   │                │                │
     │                │───────────────▶│                │                │
     │                │                │  3. Check      │                │
     │                │                │     Cache      │                │
     │                │                │───────────────▶│                │
     │                │                │                │                │
     │                │                │  4a. Cache Hit │                │
     │                │                │◀───────────────│                │
     │                │                │                │                │
     │                │                │  4b. Cache Miss - Query DB      │
     │                │                │───────────────────────────────▶│
     │                │                │                                 │
     │                │                │  5. Return Data + Update Cache  │
     │                │                │◀───────────────────────────────│
     │                │  6. Response   │                │                │
     │                │◀───────────────│                │                │
     │  7. UI Update  │                │                │                │
     │◀───────────────│                │                │                │
```

### Booking Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC BOOKING FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

  ┌─────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────┐
  │  Guest  │      │ Select Date │      │ Select Time │      │  Form   │
  │  Visits │─────▶│  Calendar   │─────▶│    Slot     │─────▶│  Fill   │
  │  Link   │      │             │      │             │      │         │
  └─────────┘      └─────────────┘      └─────────────┘      └────┬────┘
       │                  │                   │                    │
       │                  │                   │                    ▼
       │                  │                   │            ┌─────────────┐
       │                  │                   │            │   Confirm   │
       │                  │                   │            │   Booking   │
       │                  │                   │            └──────┬──────┘
       │                  │                   │                   │
       │                  │                   │                   ▼
       │                  │                   │            ┌─────────────┐
       │                  │                   │            │  Validation │
       │                  │                   │            │  • Overlap  │
       │                  │                   │            │  • Buffer   │
       │                  │                   │            │  • Max/Day  │
       │                  │                   │            └──────┬──────┘
       │                  │                   │                   │
       ▼                  ▼                   ▼                   ▼
  ┌───────────────────────────────────────────────────────────────────┐
  │                      ✅ BOOKING CONFIRMED                          │
  │                    Saved to Database + Email                       │
  └───────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| **Next.js 16**      | React framework with App Router |
| **React 19**        | UI library                      |
| **TypeScript**      | Type safety                     |
| **Tailwind CSS 4**  | Styling                         |
| **Zustand**         | Global state management         |
| **Zod**             | Form validation                 |
| **date-fns**        | Date utilities                  |
| **Lucide React**    | Icons                           |
| **react-hot-toast** | Notifications                   |

### Backend

| Technology        | Purpose                  |
| ----------------- | ------------------------ |
| **Node.js**       | Runtime environment      |
| **Express.js**    | Web framework            |
| **TypeScript**    | Type safety              |
| **Prisma**        | ORM for database         |
| **PostgreSQL**    | Primary database         |
| **Upstash Redis** | Caching layer (optional) |
| **Zod**           | Request validation       |

### UI Components (shadcn/ui)

- Button, Card, Input, Label, Badge
- Dialog, AlertDialog, Calendar
- Table, Pagination

---

## ✨ Features

### 🔐 User Management

- User registration and login
- Profile management with timezone support
- Cookie-based session management

### 📅 Event Type Management

- Create, edit, delete event types
- Custom durations (15, 30, 45, 60+ minutes)
- Unique URL slugs per event
- Link to availability schedules
- Toggle active/inactive status

### ⏰ Availability Management

- Multiple availability schedules per user
- Per-day time slot configuration
- Timezone support (IANA timezones)
- Default schedule assignment
- Duplicate and delete schedules

### 📆 Booking System

- Public booking page (`/:username/:event-slug`)
- Interactive calendar date picker
- Real-time slot availability
- Double-booking prevention
- Buffer time between meetings
- Max bookings per day limit
- Guest email support
- Location options (Video, In-person, Phone)

### 📊 Bookings Dashboard

- Filter by: Upcoming, Past, Cancelled
- Search by attendee name/email
- Filter by event type and date range
- Cancel and reschedule bookings
- Add guests to existing bookings
- Responsive mobile design

---

## 🗃️ Database Schema

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │    EventType    │       │    Schedule     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │       │ id (PK)         │
│ username        │  │    │ userId (FK)     │◀──┐   │ userId (FK)     │◀─┐
│ email           │  │    │ title           │   │   │ name            │  │
│ name            │  │    │ description     │   │   │ timezone        │  │
│ bio             │  │    │ duration        │   │   │ isDefault       │  │
│ timezone        │  │    │ slug            │   │   └────────┬────────┘  │
└────────┬────────┘  │    │ scheduleId (FK) │───┼────────────┘           │
         │           │    │ location        │   │                        │
         │           │    │ bufferTime      │   │   ┌─────────────────┐  │
         │           │    │ maxBookingsDay  │   │   │  ScheduleSlot   │  │
         │           │    │ isActive        │   │   ├─────────────────┤  │
         │           │    └────────┬────────┘   │   │ id (PK)         │  │
         │           │             │            │   │ scheduleId (FK) │──┘
         │           │             │            │   │ dayOfWeek       │
         │           │             ▼            │   │ startTime       │
         │           │    ┌─────────────────┐   │   │ endTime         │
         │           │    │     Booking     │   │   └─────────────────┘
         │           │    ├─────────────────┤   │
         │           │    │ id (PK)         │   │
         │           └───▶│ userId (FK)     │   │
         │                │ eventTypeId(FK) │◀──┘
         │                │ bookerName      │
         │                │ bookerEmail     │
         │                │ startTime       │
         │                │ endTime         │
         │                │ timeZone        │
         │                │ location        │
         │                │ guests[]        │
         │                │ status          │
         │                └─────────────────┘
         │
         │           ┌─────────────────┐
         │           │  Availability   │
         │           ├─────────────────┤
         └──────────▶│ id (PK)         │
                     │ userId (FK)     │
                     │ dayOfWeek       │
                     │ startTime       │
                     │ endTime         │
                     └─────────────────┘
```

---

## 🔌 API Endpoints

### Users

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/users/:username` | Get user by username |
| POST   | `/api/users`           | Create/login user    |
| PUT    | `/api/users/:id`       | Update user profile  |

### Event Types

| Method | Endpoint                      | Description                              |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | `/api/event-types`            | Get all event types (with userId filter) |
| GET    | `/api/event-types/:id`        | Get event type by ID                     |
| GET    | `/api/event-types/slug/:slug` | Get event type by slug                   |
| POST   | `/api/event-types`            | Create event type                        |
| PUT    | `/api/event-types/:id`        | Update event type                        |
| DELETE | `/api/event-types/:id`        | Delete event type                        |

### Schedules (Availability)

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/schedules`               | Get user's schedules |
| GET    | `/api/schedules/:id`           | Get schedule by ID   |
| POST   | `/api/schedules`               | Create schedule      |
| PUT    | `/api/schedules/:id`           | Update schedule      |
| POST   | `/api/schedules/:id/duplicate` | Duplicate schedule   |
| DELETE | `/api/schedules/:id`           | Delete schedule      |

### Bookings

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| GET    | `/api/bookings`                       | Get bookings (with filters) |
| GET    | `/api/bookings/:id`                   | Get booking by ID           |
| POST   | `/api/bookings/:username/:slug`       | Create booking              |
| PUT    | `/api/bookings/:id/cancel`            | Cancel booking              |
| PUT    | `/api/bookings/:id/reschedule`        | Reschedule booking          |
| PUT    | `/api/bookings/:id/location`          | Update location             |
| PUT    | `/api/bookings/:id/guests`            | Add guests                  |
| GET    | `/api/bookings/:username/:slug/slots` | Get available slots         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** (or use [Neon](https://neon.tech) cloud PostgreSQL)
- **npm** or **yarn**

### Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/Harish0027/meeting-scheduler.git
cd meeting-scheduler
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from example or create manually)
# Add your DATABASE_URL and optional Redis credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The backend will run on **http://localhost:3001**

#### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

The frontend will run on **http://localhost:3000**

#### 4. Access the Application

1. Open **http://localhost:3000** in your browser
2. Login or create an account
3. Create event types and set availability
4. Share your booking link: `http://localhost:3000/{username}/{event-slug}`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Server
NODE_ENV="development"
PORT=3001

# Caching (Optional - falls back to in-memory if not set)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📁 Project Structure

```
meeting-scheduler/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── controllers/           # Route handlers
│   │   │   ├── bookingController.ts
│   │   │   ├── eventTypeController.ts
│   │   │   ├── scheduleController.ts
│   │   │   └── userController.ts
│   │   ├── services/              # Business logic
│   │   │   ├── bookingService.ts
│   │   │   ├── eventTypeService.ts
│   │   │   ├── scheduleService.ts
│   │   │   └── userService.ts
│   │   ├── routes/                # API route definitions
│   │   ├── middlewares/           # Express middlewares
│   │   ├── utils/                 # Utility functions
│   │   │   ├── redis.ts           # Cache helpers
│   │   │   └── validations.ts     # Validation utilities
│   │   ├── validators/            # Zod schemas
│   │   ├── db/                    # Database client
│   │   ├── app.ts                 # Express app setup
│   │   └── index.ts               # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/                       # Next.js App Router pages
│   │   ├── dashboard/             # Dashboard page
│   │   ├── bookings/              # Bookings list page
│   │   ├── availability/          # Availability management
│   │   ├── event-types/           # Event type management
│   │   ├── settings/              # User settings
│   │   ├── login/                 # Login page
│   │   ├── [username]/[slug]/     # Public booking page
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Home page
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── app-shell.tsx          # Layout wrapper
│   │   ├── navbar.tsx             # Navigation
│   │   └── footer.tsx             # Footer
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── store.ts               # Zustand store
│   │   ├── utils.ts               # Utility functions
│   │   └── validations.ts         # Zod schemas
│   └── package.json
│
└── README.md
```

---

## 🗄️ Caching Strategy

The application uses **Upstash Redis** for caching with an in-memory fallback for local development.

### Cache Keys

| Key Pattern                        | TTL  | Description         |
| ---------------------------------- | ---- | ------------------- |
| `booking:{id}`                     | 120s | Single booking data |
| `bookings:user:{userId}:{filters}` | 60s  | User's booking list |

### Cache Invalidation

- **Create Booking**: Invalidates user's booking list cache
- **Cancel Booking**: Invalidates specific booking + user's list
- **Reschedule Booking**: Invalidates specific booking + user's list

### Fallback Behavior

If Redis is unavailable or not configured, the system automatically falls back to an in-memory Map store, ensuring the application continues to function.

---

## 🔒 Security Features

- **User Isolation**: Users can only see their own bookings, schedules, and event types
- **Booking Ownership**: Only the booker can cancel/reschedule their booking
- **Double-booking Prevention**: Server-side validation prevents overlapping bookings
- **Input Validation**: All inputs validated with Zod on both frontend and backend
- **CORS Configuration**: Controlled cross-origin access

---

## 📱 Responsive Design

The application is fully responsive with three breakpoints:

| Breakpoint  | Width      | Layout                                    |
| ----------- | ---------- | ----------------------------------------- |
| **Mobile**  | &lt;768px  | Bottom navigation, mobile-optimized cards |
| **Tablet**  | 768-1024px | Collapsed icon sidebar                    |
| **Desktop** | &gt;1024px | Full sidebar with labels                  |

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get event types
curl http://localhost:3001/api/event-types

# Get available slots for a specific date
curl "http://localhost:3001/api/bookings/username/event-slug/slots?date=2026-01-20"

# Create a booking
curl -X POST http://localhost:3001/api/bookings/username/event-slug \
  -H "Content-Type: application/json" \
  -d '{
    "bookerName": "John Doe",
    "bookerEmail": "john@example.com",
    "startTime": "2026-01-20T10:00:00Z",
    "endTime": "2026-01-20T10:30:00Z",
    "timeZone": "Asia/Calcutta"
  }'
```

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)

1. Set environment variables (DATABASE_URL, UPSTASH_REDIS_REST_URL, etc.)
2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend (Vercel)

1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
3. Deploy automatically on push

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built as a demonstration of full-stack development with modern web technologies.

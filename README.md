# Alumni Network Platform

A full-stack networking platform for university alumni featuring user profiles, job boards, and event management, built with the **MERN stack** and styled with **Bootstrap 5**.

## Impact

Connected over **5,000 alumni** globally, resulting in a **30% increase** in mentorship pairings and job referrals within the first year.

## Features

- 🔐 **Secure Authentication** — JWT-based stateless auth with bcrypt password hashing and rate limiting
- 👤 **Alumni Profiles** — Searchable directory with filtering by name, company, major, and skills
- 💼 **Job Board** — Post and browse job opportunities; apply directly through the platform
- 📅 **Event Management** — Create and RSVP to networking events, workshops, and reunions
- 📊 **Aggregation Pipelines** — Mongoose aggregation for efficient data retrieval and pagination

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Database | MongoDB + Mongoose                |
| Backend  | Node.js + Express                 |
| Frontend | React 18 + React Router v6        |
| Styling  | Bootstrap 5 + React-Bootstrap     |
| Auth     | JSON Web Tokens (JWT) + bcryptjs  |

## Project Structure

```
alumni-network/
├── server/          # Express API server
│   ├── models/      # Mongoose models (User, Job, Event)
│   ├── routes/      # API routes (auth, users, jobs, events)
│   ├── middleware/  # JWT auth middleware
│   └── server.js   # App entry point
└── client/          # React frontend
    ├── public/      # Static assets
    └── src/
        ├── context/ # AuthContext (JWT state management)
        ├── components/ # Shared components (Navbar)
        ├── pages/   # Route-level page components
        └── utils/   # Axios API client
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Configuration

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/alumni-network
JWT_SECRET=your_strong_secret_here
PORT=5000
```

### Running

```bash
# Run both server and client concurrently
npm run dev

# Or run separately:
npm run server   # API on http://localhost:5000
npm run client   # React app on http://localhost:3000
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List alumni (search, filter, paginate) |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update current user profile |
| GET | `/api/users/:id` | Get user by ID |
| DELETE | `/api/users/:id` | Delete user (admin only) |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | List job postings (filter, search) |
| POST | `/api/jobs` | Create a job posting |
| GET | `/api/jobs/:id` | Get job details |
| PUT | `/api/jobs/:id` | Update job posting (owner) |
| DELETE | `/api/jobs/:id` | Delete job posting (owner/admin) |
| POST | `/api/jobs/:id/apply` | Apply for a job |
| GET | `/api/jobs/my/postings` | Get current user's job postings |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (filter by category/status) |
| POST | `/api/events` | Create an event |
| GET | `/api/events/:id` | Get event details |
| PUT | `/api/events/:id` | Update event (organizer) |
| DELETE | `/api/events/:id` | Delete event (organizer/admin) |
| POST | `/api/events/:id/attend` | Register attendance |
| DELETE | `/api/events/:id/attend` | Cancel attendance |
| GET | `/api/events/my/events` | Get current user's events |

## Security

- Passwords hashed with **bcryptjs** (cost factor 12)
- **JWT tokens** expire in 7 days
- **Rate limiting** on auth endpoints (20 req/15min) and API endpoints (200 req/15min)
- Sensitive fields (`password`) excluded from query results by default
- Input validation with **express-validator**

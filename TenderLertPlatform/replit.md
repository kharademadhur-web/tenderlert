# TenderLert - Smart Tender Alerts for Indian Businesses

## Overview

TenderLert is a SaaS platform that helps Indian businesses discover government tender opportunities by monitoring multiple procurement portals (GeM, eProcure, MahaTenders), categorizing tenders using AI, and delivering personalized email alerts to registered clients. The platform features both client-facing dashboards for viewing relevant tenders and admin dashboards for managing tenders, clients, and system operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite as the build tool and development server
- **Routing**: Wouter (lightweight client-side routing library)
- **UI Component Library**: Radix UI primitives with shadcn/ui design system (New York variant)
- **Styling**: TailwindCSS with custom design tokens following modern SaaS patterns (Linear's typography, Stripe's restraint, Notion's approachability)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **State Management**: 
  - Zustand with persist middleware for authentication state
  - TanStack Query (React Query) for server state management
- **Typography**: Inter font family with specific scale (48px hero down to 12px micro labels)

**Key Design Decisions**:
- Monorepo structure with `client/` directory containing all frontend code
- Path aliases configured (`@/` for client src, `@shared/` for shared types)
- SPA architecture with client-side routing and API integration
- Component-driven architecture with reusable UI primitives

### Backend Architecture

**Framework**: Express.js (Node.js) with TypeScript
- **Build Tool**: esbuild for fast server bundling
- **HTTP Server**: Native Node.js http module wrapping Express
- **Authentication**: JWT-based authentication with Bearer tokens
  - Token storage in client via Zustand persist
  - Auth middleware for protected routes (`requireAuth`, `requireAdmin`)
  - Password hashing with bcrypt
- **API Design**: RESTful endpoints under `/api` namespace
  - `/api/auth/*` - Authentication (signup, login)
  - `/api/clients/*` - Client management and registration
  - `/api/tenders/*` - Tender CRUD operations
  - `/api/contact` - Contact form submissions
  - `/api/admin/*` - Admin operations

**Key Design Decisions**:
- Separation of concerns with dedicated modules:
  - `routes.ts` - API endpoint definitions
  - `storage.ts` - Database abstraction layer (IStorage interface)
  - `middleware/auth.ts` - Authentication logic
  - `services/` - External integrations (AI, webhooks)
- Development mode uses Vite middleware for HMR
- Production serves static files from `dist/public`
- Custom logging with timestamps and request duration tracking

### Database Architecture

**ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Connection**: WebSocket-based connection pooling via `@neondatabase/serverless`
- **Schema Location**: `shared/schema.ts` (shared between client and server for type safety)

**Data Models**:
1. **users** - Authentication and authorization (clients/admins)
   - Fields: id, email, password (hashed), name, role, createdAt
2. **clients** - Extended client profiles
   - Fields: id, userId (FK), companyName, phone, categoryInterested, createdAt
3. **tenders** - Government tender data
   - Fields: id, portalName, bidNumber, title, quantity, department, stateLocation, itemCategory, bidType, estimatedValue, bidStartDate, bidEndDate, deliveryLocation, emdAmount, minAnnualTurnover, sourceUrl, aiCategory, createdAt
4. **emailLogs** - Email delivery tracking
5. **contactSubmissions** - Contact form entries

**Key Design Decisions**:
- Schema defined using Drizzle with PostgreSQL-specific types
- Zod schemas generated from Drizzle schemas for runtime validation
- Storage abstraction (IStorage interface) allows for future database provider changes
- Relations defined for joins between users and clients
- Decimal types for monetary values (estimatedValue, emdAmount, minAnnualTurnover)

### Authentication & Authorization

**Strategy**: JWT-based stateless authentication
- Tokens signed with JWT_SECRET (falls back to SESSION_SECRET environment variable)
- 7-day token expiration
- Token stored client-side in localStorage via Zustand persist
- Role-based access control (client vs admin roles)

**Auth Flow**:
1. User signs up → password hashed with bcrypt → user created with "client" role
2. User logs in → credentials verified → JWT token generated and returned
3. Subsequent requests → Bearer token in Authorization header → middleware verifies token
4. Admin routes protected by `requireAdmin` middleware (checks role === "admin")

**Key Design Decisions**:
- Chose JWT over session-based auth for stateless scalability
- Client-side token storage allows easy mobile/desktop app expansion
- Auth state managed globally via Zustand for easy access across components

### AI/ML Integration

**Service**: Groq API for tender categorization
- **Model**: llama-3.1-70b-versatile
- **Purpose**: Classify tenders into predefined business categories
- **Categories**: Construction, IT Services, Medical Supplies, Office Supplies, Consulting, Vehicle/Transport, Security Services, Catering/Food, Electrical Work, Civil Work, Printing/Stationery, Furniture, Laboratory Equipment, Agricultural, Other

**Implementation**:
- Service located in `server/services/aiCategorizer.ts`
- Accepts tender title, department, and itemCategory as inputs
- Low temperature (0.1) for consistent classification
- Fallback to keyword-based categorization if API key not configured
- Support for batch categorization

**Key Design Decisions**:
- Groq chosen for fast inference and cost-effectiveness
- System prompt ensures single-category responses
- Graceful fallback ensures system works without AI API
- AI category stored in database for future reference and improvement

## External Dependencies

### Third-Party Services

1. **Groq API** (AI Categorization)
   - Environment variable: `GROQ_API_KEY`
   - Used for tender categorization using LLM
   - Fallback to keyword matching if not configured

2. **n8n Webhooks** (Automation Integration)
   - Environment variables: `N8N_REGISTER_WEBHOOK`, `N8N_CONTACT_WEBHOOK`
   - Sends registration and contact form data to external automation workflows
   - Non-blocking - system continues if webhooks fail
   - Located in `server/services/webhooks.ts`

3. **Neon PostgreSQL** (Database)
   - Environment variable: `DATABASE_URL`
   - Serverless PostgreSQL database
   - WebSocket-based connection for serverless environments

### Key Libraries

**Frontend**:
- `@radix-ui/*` - Unstyled, accessible UI primitives (20+ components)
- `@tanstack/react-query` - Server state management
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation
- `wouter` - Lightweight routing (~1.2KB)
- `zustand` - Lightweight state management
- `date-fns` - Date formatting and manipulation
- `lucide-react` - Icon library

**Backend**:
- `drizzle-orm` + `drizzle-kit` - Type-safe ORM and migrations
- `express` - Web framework
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `zod` - Runtime schema validation

**Build Tools**:
- `vite` - Frontend build tool and dev server
- `esbuild` - Backend bundler (fast compilation)
- `tsx` - TypeScript execution for dev mode
- `tailwindcss` + `autoprefixer` - CSS processing

### Environment Configuration

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` or `SESSION_SECRET` - Token signing key (falls back to default in dev)
- `GROQ_API_KEY` - Groq API key (optional, has fallback)
- `N8N_REGISTER_WEBHOOK` - n8n webhook URL for registrations (optional)
- `N8N_CONTACT_WEBHOOK` - n8n webhook URL for contact forms (optional)
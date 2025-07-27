# Varmepumpetilsynet - Heat Pump Service Platform

## Overview

Varmepumpetilsynet is a comprehensive web application that connects heat pump customers with certified installers in Norway. The platform provides subscription-based services for heat pump maintenance tracking, installer management, and administrative oversight. It's built as a full-stack TypeScript application with a modern React frontend and Express.js backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React 18 with TypeScript, utilizing Vite as the build tool for optimal development experience and performance. The UI is crafted with shadcn/ui components built on top of Radix UI primitives, styled with Tailwind CSS for a modern, accessible design system.

Key frontend decisions:
- **React with TypeScript**: Provides type safety and better developer experience
- **Vite**: Fast build tool with hot module replacement for efficient development
- **shadcn/ui + Radix UI**: Pre-built, accessible components reducing development time
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Wouter**: Lightweight client-side routing (3kb vs React Router's larger bundle)
- **TanStack React Query**: Robust data fetching and caching solution

### Backend Architecture
The backend follows a RESTful API design using Express.js with TypeScript. It implements a layered architecture separating concerns between routing, business logic, and data access.

Key backend decisions:
- **Express.js**: Mature, flexible web framework for Node.js
- **TypeScript**: Type safety across the entire stack
- **Drizzle ORM**: Type-safe database operations with excellent TypeScript integration
- **PostgreSQL**: Robust relational database suitable for complex business logic
- **Neon Database**: Serverless PostgreSQL for scalable cloud deployment

### Authentication System
Uses custom authentication system with bcrypt password hashing and session-based storage in PostgreSQL.

Key features:
- Username/password authentication with bcrypt hashing
- Session-based login state management
- Password reset functionality with email tokens
- Role-based access control (customer, installer, admin)
- Admin account management capabilities

Rationale: Custom authentication provides full control over user management, allowing admin oversight of installer accounts and password management without external dependencies.

## Key Components

### Database Schema
- **Users**: Core user information with role-based access (customer, installer, admin)
- **Customers**: Customer-specific profile data and subscription status
- **Installers**: Company information, certifications, and approval status
- **Heat Pumps**: Equipment tracking with service history
- **Service Areas**: Geographic coverage for installer services
- **Sessions**: Secure session storage for authentication

### API Routes
- **Authentication**: `/api/auth/*` - User login/logout, session management
- **Customers**: `/api/customers` - Customer registration and profile management
- **Installers**: `/api/installers` - Installer registration, approval, and management
- **Heat Pumps**: `/api/heat-pumps` - Equipment registration and service tracking
- **Contacts**: `/api/contacts` - Customer-installer communication
- **Payments**: `/api/payments` - Stripe integration for subscriptions

### User Roles & Access Control
- **Customers**: Can register heat pumps, view service history, contact installers
- **Installers**: Can manage service areas, view customer requests, update service records
- **Admins**: Full system access, installer approval, subscription management

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC, sessions stored in PostgreSQL
2. **Role-based Routing**: Frontend routes users to appropriate portals based on their role
3. **Data Fetching**: React Query manages API calls with automatic caching and invalidation
4. **Form Submission**: Zod validation on both frontend and backend ensures data integrity
5. **Real-time Updates**: Optimistic updates with React Query provide responsive user experience

## External Dependencies

### Payment Processing
- **Stripe**: Handles subscription payments and billing
- Integration includes customer creation, subscription management, and webhook handling
- Environment variables required: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

### Database
- **Neon Database**: Serverless PostgreSQL provider
- Connection via `@neondatabase/serverless` for edge-compatible database access
- Requires `DATABASE_URL` environment variable

### Geographic Data
- Norwegian county and municipality data hardcoded in the frontend
- Used for installer service area management and customer location tracking

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with hot module replacement
- Express server with tsx for TypeScript execution
- Database migrations via Drizzle Kit
- Replit integration with cartographer plugin for enhanced debugging

### Production Build
- Frontend: Vite builds optimized static assets
- Backend: esbuild creates bundled Node.js executable
- Database: Drizzle manages schema migrations
- Environment: Designed for deployment on platforms supporting Node.js with PostgreSQL

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key for frontend
- `SESSION_SECRET`: Secret for session encryption
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)

The architecture prioritizes type safety, developer experience, and scalability while maintaining simplicity in deployment and maintenance.

## Recent Changes

### July 18, 2025 - Custom Authentication System Implementation
- **Completed conversion from Replit Auth to custom authentication**
- **Implemented bcrypt password hashing with session-based storage**
- **Created admin account management system (admin/admin123)**
- **Fixed React hooks rendering issues in AuthPage component**
- **Resolved redirect loops and 404 errors with proper route handling**
- **Added dropdown profile menu with logout functionality**
- **Fixed UI color contrast issues in tabs component**
- **Status**: Custom authentication system fully operational and tested

### July 18, 2025 - GDPR-Compliant Installer Management System
- **Added installer activation/deactivation system with `active` field in database**
- **Implemented login blocking for deactivated installers with appropriate error messages**
- **Enhanced admin panel with comprehensive installer status management**
- **Added permanent deletion capabilities for both installers and customers (GDPR)**
- **Created status badges showing both approval and activation status**
- **Improved admin feedback with specific status messages for each action**
- **Status**: Complete GDPR-compliant user management system operational

### July 18, 2025 - Service Area Selection Improvements
- **Added "Velg alle" and "Fjern alle" buttons for rapid municipality selection**
- **Fixed service area API to support bulk updates with array of municipalities**
- **Removed annoying authentication popup messages during page transitions**
- **Temporarily hidden certification status (can be re-enabled later)**
- **Fixed duplicate municipality numbers in Norwegian location data (Rogaland)**
- **Enhanced UX for installers selecting coverage areas across multiple municipalities**
- **Status**: Service area management significantly improved and streamlined

### July 25, 2025 - Brand Name Correction
- **Changed app name from "VarmepumpeTilsynet" to "Varmepumpetilsynet" throughout codebase**
- **Updated all user-facing text to use correct capitalization**
- **Consistent branding across all pages and components**
- **Status**: Brand name correction completed

### January 25, 2025 - Anonymous Service Request System Implementation
- **Completed major architectural shift to anonymous customer service requests**
- **Created new serviceRequests and serviceRequestContacts database tables**
- **Built completely anonymous customer form at /customer (no login required)**
- **Customers can now submit service requests without creating accounts**
- **Implemented installer matching based on service areas and municipalities**
- **Updated installer portal to show relevant service requests in their coverage areas**
- **Fixed county and municipality dropdown data loading issues**
- **Admin panel now displays all service requests for oversight**
- **System supports complete service request lifecycle from submission to installer contact**
- **Status**: Anonymous service request system fully operational

### January 25, 2025 - Navigation Simplification
- **Removed /installer route entirely to eliminate redirect confusion**
- **Changed "Registrer som installatør" button to "Registrer eller logg inn"**
- **Home page installer button now goes directly to /auth instead of /installer**
- **Simplified user flow: customers use /customer (anonymous), installers use /auth (login)**
- **Status**: Navigation flow streamlined and simplified

### January 25, 2025 - Enhanced Admin Panel Management
- **Removed "Kunder" tab from admin panel to focus on core functionality**
- **Added comprehensive service request management with edit and delete capabilities**
- **Implemented modal dialog for editing service request details with ALL registration form fields**
- **Added superadmin delete functionality for both service requests and installers**
- **Created backend API endpoints for PUT/DELETE operations on service requests and installers**
- **Enhanced admin UI with clear edit/delete buttons and proper permission controls**
- **Removed "open" status field from service request display to simplify interface**
- **Added complete service request editing including fylke/kommune dropdowns, heat pump details, service type, and contact preferences**
- **Implemented duplicate installer validation preventing registration with existing company names or organization numbers**
- **Status**: Admin panel now provides full CRUD operations for service requests and installers with comprehensive form validation

### January 25, 2025 - Installer Search and Directory Features
- **Added third card on homepage for installer search functionality**
- **Created dedicated /search page for finding installers by location**
- **Customers can now browse installers before requesting service**
- **Implemented search by fylke/kommune with real-time results**
- **Added installer contact dialog with phone, email, and website information**
- **Direct contact buttons for phone calls and email**
- **Enhanced customer journey with installer discovery after service request submission**
- **Status**: Complete installer directory and search functionality operational

### January 25, 2025 - Installer Dashboard Implementation
- **Created new `/installer` page with comprehensive installer portal**
- **Fixed login redirect issue - installers now properly redirect to dashboard instead of non-existent page**
- **Added three-tab interface: Profil, Serviceområder, Forespørsler**
- **Profile tab displays company information, contact details, and approval/activation status**
- **Service areas tab allows installers to manage coverage areas by fylke/kommune with bulk selection**
- **Requests tab shows customer service requests in installer's coverage areas with direct contact options**
- **Fixed tab visibility issues with improved color contrast (gray background, white active state)**
- **Backend API endpoints added for installer profile and service request filtering**
- **Status**: Complete installer dashboard operational with full functionality

### January 26, 2025 - Complete Address Fields Implementation
- **Database schema extended with address, postalCode, and city fields for installers**
- **Installer registration form now includes all address fields (address, postal code, city)**
- **Installer dashboard profile section allows viewing and editing complete address information**
- **Admin panel displays and allows editing of installer address fields in both view and edit modes**
- **Backend storage automatically supports address field updates via spread operator**
- **All address data is consistently handled across registration, dashboard, and admin interfaces**
- **Map functionality can now use authentic address data for accurate marker placement**
- **Status**: Complete address field management system operational across all user interfaces

### January 26, 2025 - Critical Bug Fixes and System Stability
- **Fixed 403 Forbidden error: Added missing PUT /api/installers/me route for profile updates**
- **Resolved duplicate service areas: Implemented Array.from() deduplication grouped by county**  
- **Fixed password change functionality: Updated to correct PUT /api/user/password endpoint**
- **Resolved map crashes: Added null-safety checks for counties data in installer-map.tsx**
- **Enhanced postal code management: Excel-compatible import/export with tab/comma separation**
- **Fixed all TypeScript errors: Added comprehensive null-safety checks throughout codebase**
- **Improved map positioning: Enhanced coordinate generation using postal codes and address data**
- **Status**: All critical authentication, dashboard, and map functionality fully operational

### January 26, 2025 - Excel Export and UI Improvements
- **Fixed Excel export: Changed from CSV to true Excel format (.xlsx) with proper MIME type**
- **Enhanced installer dashboard: True Excel export for postal codes with proper file extension**
- **Improved admin panel: Excel export functionality updated for both installer and admin interfaces**
- **Fixed duplicate React keys: Implemented unique keys using county-municipality-index combinations**
- **Map detail window z-index fix: Details now display properly over map (z-[1000])**
- **Enhanced map positioning: Added comprehensive Norwegian postal code coordinates database**
- **Status**: Complete Excel functionality and improved map user experience operational

### January 26, 2025 - True Excel Format Implementation
- **Installed XLSX library: Added proper Excel file generation and reading capabilities**
- **True Excel export: Uses XLSX.writeFile() to generate authentic .xlsx files that open natively in Excel**
- **Excel import support: Can now read both .xlsx and .csv files using XLSX library**
- **Column width optimization: Excel files include proper column sizing for better readability**
- **Enhanced error handling: Separate validation for Excel vs CSV file processing**
- **Status**: Complete authentic Excel import/export functionality operational for both installer and admin interfaces

### January 26, 2025 - Map UI Improvements and Popup Cleanup
- **Removed duplicate popup: Eliminated overlapping contact information popups on map**
- **Simplified map markers: Single clean popup with company name and "Se detaljer" button**
- **Enhanced address display: Added postnummer and city to installer detail panel**
- **Improved user flow: Cleaner interaction between map markers and detail sidebar**
- **Better positioning accuracy: Backend already includes postalCode and city for map coordinates**
- **Status**: Clean, streamlined map interface with improved user experience

### January 26, 2025 - Precise GPS Coordinates Implementation
- **Fixed Eidsvoll Verk positioning: Used exact coordinates 60.3013°N, 11.1666°E for Sagvegen 2**
- **Accurate map placement: Resolved long-standing issue with installer location on map**
- **Minimal offset: Reduced random positioning offset to 0.0005 degrees for precision**
- **Enhanced debug logging: Added detailed coordinate tracking for troubleshooting**
- **Status**: Accurate GPS positioning achieved for Norwegian postal codes

### January 26, 2025 - Automatic Norwegian Address Coordinate Lookup System
- **Implemented backend API endpoint `/api/coordinates` for automatic address lookup**
- **Integration with Kartverket (Norwegian Mapping Authority) API for official coordinates**
- **Fallback to OpenStreetMap Nominatim for addresses not found in Kartverket**
- **Client-side coordinate caching to prevent repeated API calls for same addresses**
- **Automatic exact coordinate lookup for new installer addresses without manual intervention**
- **System tries exact address lookup first, falls back to postal code coordinates if needed**
- **Enhanced map positioning system handles async coordinate retrieval seamlessly**
- **Status**: Fully automated Norwegian address coordinate resolution system operational

### January 26, 2025 - Service Area Management System Fix
- **Fixed critical JSON parsing error in service area updates that prevented municipality selection**
- **Added missing PUT `/api/service-areas/me` endpoint for bulk service area updates**
- **Implemented `clearServiceAreas()` method for proper service area replacement**
- **Enhanced installer profile to display and edit county/municipality information**
- **Updated admin panel to show installer primary location (fylke/kommune) alongside service areas**
- **Fixed coordinate system accuracy with authentic Kartverket API integration**
- **Resolved duplicate function definitions and TypeScript errors in storage layer**
- **Status**: Complete service area management system operational with accurate Norwegian coordinates

### January 26, 2025 - Production Deployment Health Check Fixes
- **Added health check endpoint at root path `/` for deployment health checks**
- **Modified production setup script to prevent process.exit() calls in production environment**
- **Ensured application continues running after database setup instead of terminating**
- **Health check returns JSON response with status, message, and timestamp**
- **Production database setup runs without terminating the main application process**
- **Added `/health` endpoint for additional health monitoring**
- **Verified production build and deployment readiness with successful health checks**
- **Status**: All deployment issues resolved, application ready for production deployment

### January 26, 2025 - Service Area API Data Format Fix
- **Fixed service area creation API data format mismatch between frontend and backend**
- **Updated installer dashboard to send municipalities array with correct structure to PUT /api/service-areas/me**
- **Frontend now properly transforms selected municipalities to backend expected format: {municipalities: [{county, municipality}]}**
- **Resolved 400 Bad Request error in production when creating service areas**
- **Verified fix and rebuilt production-ready version**
- **Status**: Service area creation functionality now works correctly in both development and production

### January 26, 2025 - Production Frontend Routing Fix
- **Fixed root path (/) returning JSON health check instead of website in production**
- **Moved health check endpoints to dedicated paths: /health, /api/health, /.well-known/health**
- **Root path now properly serves the frontend application in production environment**
- **Users can now access the website normally at mini.digitool.no instead of seeing JSON response**
- **Health checks still available for deployment services at separate endpoints**
- **Status**: Frontend routing now works correctly in production deployment

### January 26, 2025 - User Documentation Creation
- **Created comprehensive user documentation in BRUKER_DOKUMENTASJON.md**
- **Documented all login credentials: admin/admin123 for administrator access**
- **Included complete app overview, functionality description, and technical architecture**
- **Added troubleshooting guide and important commands for future development**
- **Documented recent changes and current project status for easy onboarding**
- **Status**: Complete user documentation available for future reference

### January 27, 2025 - Replit Redirect Issue Fix and Domain Solution
- **Fixed critical production issue where users were redirected to Replit Shield login**
- **Removed problematic Replit dev banner script from client/index.html**
- **Deleted obsolete server/replitAuth.ts file containing old Replit OIDC authentication**
- **Production build now serves clean HTML without external Replit dependencies**
- **Identified Replit Shield limitation: custom domains automatically trigger Shield redirect**
- **Solution: Using standard Replit domain for public access**
- **Live URL**: https://dd05e8be-77b6-419a-9968-408662d0b455-00-33p9ad2mbam44.kirk.replit.dev
- **Status**: Website fully accessible on standard Replit domain without authentication requirements
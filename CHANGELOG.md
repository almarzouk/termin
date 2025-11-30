# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-30

### Added

#### Admin Dashboard
- Complete admin dashboard with 18+ pages
- Analytics dashboard with charts and KPIs
- User management with role assignment
- Clinic management (CRUD operations)
- Staff management and invitations
- Service management with categories
- Appointment calendar and management
- Review moderation system
- Subscription plan management
- Coupon system with generation
- Backup and restore functionality
- Activity logs tracking
- System settings configuration
- Notification management
- Report generation

#### Public Features
- Public clinic listing page with search and filters
- Individual clinic profile pages
- Service catalog display
- Doctor listings
- Patient review system with ratings
- Guest appointment booking
- Responsive design for all devices

#### Clinic Owner Features
- Clinic profile management
- Branch management
- Staff invitation system
- Service catalog management
- Working hours configuration
- Appointment management
- Analytics and reports
- Subscription handling

#### Patient Features
- Patient dashboard
- Appointment booking (with and without registration)
- Medical records access
- Prescription viewing
- Review submission
- Profile management

#### Technical Features
- Laravel 11 backend with modular architecture
- Next.js 16 frontend with App Router
- SQLite database (development)
- Laravel Sanctum authentication
- Role-based access control (RBAC)
- API-first architecture
- TypeScript for type safety
- Tailwind CSS styling
- shadcn/ui components
- Responsive design
- German localization (de-DE)

#### Database
- Complete migration system
- Comprehensive database seeders
- 32 sample reviews with ratings
- 26 medical services per clinic
- 4 sample clinics
- 8 staff members
- 8 patients
- Role and permission system

### Fixed
- Review model relationship (Patient instead of User)
- Appointment staff relationship naming
- Frontend TypeScript interfaces
- Unique constraint on patient-clinic reviews
- Navbar spacing on public pages
- Clinic profile routing

### Security
- UNIQUE constraint on reviews (patient_id + clinic_id)
- Role-based data filtering
- Sanctum token authentication
- CORS configuration
- Input validation

## [Unreleased]

### Planned
- Email notifications via SMTP
- SMS reminders
- Payment gateway integration
- Video consultation
- Mobile applications
- Multi-language support (English, Arabic)
- Two-factor authentication
- API rate limiting
- Advanced reporting
- PDF/Excel export

---

For more details, see the [README](README.md).

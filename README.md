# Mien Termin - Medical Appointment Management System

🏥 A comprehensive web-based appointment management system for medical clinics and healthcare facilities.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles & Permissions](#user-roles--permissions)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Patients

- 🔍 **Clinic Discovery**: Browse and search for clinics by city, specialty, or services
- 📅 **Easy Booking**: Book appointments with or without registration
- ⭐ **Reviews & Ratings**: Read reviews and ratings from other patients
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔔 **Notifications**: Receive appointment reminders and updates
- 📊 **Patient Dashboard**: Manage appointments, medical records, and prescriptions

### For Clinic Owners

- 🏢 **Clinic Management**: Manage multiple clinic branches and locations
- 👨‍⚕️ **Staff Management**: Add doctors, nurses, and administrative staff
- 🛠️ **Service Catalog**: Define and price medical services
- 📆 **Appointment Scheduling**: View and manage all clinic appointments
- 📈 **Analytics Dashboard**: Track revenue, patient counts, and performance metrics
- 💳 **Subscription Management**: Handle clinic subscription plans

### For Super Admin

- 🎛️ **System Control**: Full control over all clinics and users
- 📊 **Advanced Analytics**: System-wide statistics and reports
- 👥 **User Management**: Manage all system users and roles
- 🔧 **System Settings**: Configure system-wide settings
- 💾 **Backup & Restore**: Database backup and restoration
- 🔐 **Role & Permission Management**: Configure access control

### Additional Features

- 🌍 **Multilingual**: Currently supports German (de-DE)
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 🔒 **Secure Authentication**: Laravel Sanctum for API security
- 📝 **Medical Records**: Digital patient medical records system
- 💊 **Prescription Management**: Create and track prescriptions
- 🔔 **Smart Notifications**: Email and in-app notifications
- ⏰ **Working Hours**: Flexible doctor availability scheduling
- 📱 **Real-time Updates**: Live appointment status updates

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.0.4 (App Router with Turbopack)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### Backend

- **Framework**: Laravel 11.x
- **Language**: PHP 8.4+
- **Authentication**: Laravel Sanctum
- **Database**: SQLite (Development), MySQL/PostgreSQL (Production ready)
- **Architecture**: Modular structure with Controllers, Models, and Services

### Development Tools

- **Package Manager**: npm (Frontend), Composer (Backend)
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

## 💻 System Requirements

### Backend Requirements

- PHP >= 8.4
- Composer
- SQLite3 (or MySQL/PostgreSQL for production)
- Apache/Nginx web server

### Frontend Requirements

- Node.js >= 18.x
- npm >= 9.x

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Mien-Termin-app.git
cd Mien-Termin-app
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed

# Start Laravel development server
php artisan serve
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start Next.js development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Configuration

### Backend Configuration (.env)

```env
APP_NAME="Mien Termin"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### Frontend Configuration (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🗄️ Database Setup

### Initial Seeding

The database seeder creates:

- **1 Super Admin** (admin@system.de / password)
- **4 Clinics** with sample data
- **8 Staff members** (doctors, nurses, managers)
- **8 Patients**
- **26 Medical Services** per clinic
- **32 Patient Reviews** with ratings
- **Sample Appointments**

### Running Specific Seeders

```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=ReviewSeeder
php artisan db:seed --class=ClinicSeeder
```

### Database Migrations

```bash
# Run all pending migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Reset database and re-run all migrations
php artisan migrate:fresh

# Reset and seed
php artisan migrate:fresh --seed
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### Production Build

**Frontend:**

```bash
cd frontend
npm run build
npm start
```

**Backend:**
Configure your web server (Apache/Nginx) to serve the Laravel application.

## 📁 Project Structure

```
Mien-Termin-app/
├── backend/                    # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── Admin/     # Admin controllers
│   │   │       └── Api/       # API controllers
│   │   ├── Models/            # Eloquent models
│   │   └── Modules/           # Feature modules
│   │       ├── Analytics/
│   │       ├── Appointment/
│   │       ├── Auth/
│   │       ├── Clinic/
│   │       ├── Doctor/
│   │       ├── MedicalRecord/
│   │       ├── Notification/
│   │       ├── Patient/
│   │       ├── Review/
│   │       └── WorkingHours/
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeders/          # Database seeders
│   └── routes/
│       └── api.php           # API routes
│
├── frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── analytics/
│   │   │   ├── appointments/
│   │   │   ├── backups/
│   │   │   ├── clinics/
│   │   │   ├── coupons/
│   │   │   ├── dashboard/
│   │   │   ├── logs/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   ├── reviews/
│   │   │   ├── roles/
│   │   │   ├── services/
│   │   │   ├── settings/
│   │   │   ├── staff/
│   │   │   ├── subscriptions/
│   │   │   └── users/
│   │   ├── appointment/      # Appointment booking
│   │   ├── clinics/          # Public clinic pages
│   │   ├── dashboard/        # User dashboard
│   │   └── auth/             # Authentication pages
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   └── lib/
│       └── api.ts            # API client
│
└── README.md
```

## 🔌 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
GET    /api/auth/user              # Get current user
PUT    /api/auth/profile           # Update profile
PUT    /api/auth/password          # Change password
```

### Public Endpoints

```
GET    /api/public/clinics                    # List all active clinics
GET    /api/public/clinics/{slug}             # Get clinic details
GET    /api/subscription-plans                # Get subscription plans
```

### Clinic Management

```
GET    /api/clinics                           # List clinics
POST   /api/clinics                           # Create clinic
GET    /api/clinics/{id}                      # Get clinic
PUT    /api/clinics/{id}                      # Update clinic
DELETE /api/clinics/{id}                      # Delete clinic
GET    /api/clinics/{id}/statistics           # Get statistics
```

### Appointment Management

```
GET    /api/appointments                      # List appointments
POST   /api/appointments                      # Create appointment
GET    /api/appointments/{id}                 # Get appointment
PUT    /api/appointments/{id}                 # Update appointment
POST   /api/appointments/{id}/cancel          # Cancel appointment
POST   /api/appointments/{id}/confirm         # Confirm appointment
POST   /api/appointments/{id}/complete        # Complete appointment
POST   /api/appointments/check-availability   # Check availability
```

### Review Management

```
GET    /api/admin/reviews                     # List all reviews
GET    /api/admin/reviews/statistics          # Get review stats
GET    /api/admin/reviews/{id}                # Get review
POST   /api/admin/reviews/{id}/approve        # Approve review
POST   /api/admin/reviews/{id}/reject         # Reject review
DELETE /api/admin/reviews/{id}                # Delete review
```

### Analytics

```
GET    /api/analytics/dashboard/overview      # Dashboard overview
GET    /api/analytics/dashboard/kpis          # Key performance indicators
GET    /api/analytics/revenue                 # Revenue analytics
GET    /api/analytics/appointments            # Appointment analytics
GET    /api/analytics/patients                # Patient analytics
GET    /api/analytics/staff                   # Staff performance
```

## 👥 User Roles & Permissions

### Super Admin

- Full system access
- Manage all clinics and users
- System configuration
- View all analytics and reports

### Clinic Owner

- Manage own clinic(s)
- Manage staff and services
- View clinic analytics
- Manage appointments
- Subscription management

### Doctor

- View assigned appointments
- Access patient medical records
- Create prescriptions
- Update appointment status

### Patient

- Book appointments
- View own appointments
- Access medical records
- Write reviews
- Manage profile

## 📸 Screenshots

### Public Pages

- **Clinic Listing**: Browse all available clinics with search and filters
- **Clinic Profile**: View clinic details, services, doctors, and reviews
- **Appointment Booking**: Easy-to-use booking form for guests and registered users

### Admin Dashboard

- **Analytics**: Comprehensive charts and KPIs
- **Clinic Management**: Full CRUD operations
- **Staff Management**: Add and manage doctors and staff
- **Reviews Management**: Moderate patient reviews
- **Appointment Calendar**: Visual calendar view
- **Settings**: System-wide configuration

### User Dashboard

- **My Appointments**: View and manage upcoming appointments
- **Medical Records**: Access health records
- **Prescriptions**: View active prescriptions
- **Profile Settings**: Update personal information

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PSR-12 coding standards for PHP
- Use TypeScript for all frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Known Issues

- Badge SVG files missing (gdpr-compliant.svg, ssl-secure.svg) - cosmetic only
- Some API endpoints require authentication headers

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Complete admin dashboard with 18+ pages
- ✅ Public clinic browsing and profiles
- ✅ Appointment booking system (guest & registered)
- ✅ Review and rating system
- ✅ Analytics and reporting
- ✅ Staff and service management
- ✅ Notification system
- ✅ Medical records management
- ✅ Subscription management
- ✅ Role-based access control

## 🔮 Roadmap

- [ ] Email notifications (SMTP integration)
- [ ] SMS reminders
- [ ] Payment gateway integration
- [ ] Video consultation feature
- [ ] Mobile apps (iOS/Android)
- [ ] Multi-language support (English, Arabic)
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] Two-factor authentication
- [ ] Export to PDF/Excel

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

**Jumaa Almarrzouk**

- GitHub: [@almarzouk](https://github.com/almarzouk)

## 🙏 Acknowledgments

- [Laravel](https://laravel.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library

## 📧 Support

For support, email support@mientermin.de or open an issue on GitHub.

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

Made with ❤️ for better healthcare management

# Admin Dashboard - LMS Platform

## تشغيل المشروع / Run Project

```bash
# تثبيت المكتبات / Install Dependencies
npm install

# تشغيل بيئة التطوير / Run Development Server
npm run dev

# بناء للإنتاج / Build for Production
npm run build
npm start
```

## API Configuration

Update `.env` file:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

## Routes / المسارات

### Public Routes
- `/en/login` - English Login
- `/ar/login` - Arabic Login (RTL)

### Protected Routes (INSTRUCTOR only)
- `/en/admin` - Dashboard
- `/ar/admin` - لوحة التحكم

## Features / المميزات

✅ **Authentication** - JWT with refresh token
- Access token stored in memory (secure)
- Refresh token via HTTP-only cookie
- Automatic 401 handling and token refresh

✅ **Internationalization** - English + Arabic
- Full RTL/LTR support
- Direction switches automatically

✅ **API Integration**
- Centralized Axios client
- withCredentials: true
- Type-safe API calls

## Tech Stack

- Next.js 13.5+
- TypeScript
- TailwindCSS
- shadcn/ui
- next-intl (i18n)
- TanStack Query
- React Hook Form
- Axios

## File Structure

```
app/
├── [locale]/           # Internationalized routes
│   ├── login/          # Login page
│   └── admin/          # Protected admin dashboard
lib/
├── api/                # API service functions
├── api-client.ts       # Centralized Axios client
└── contexts/           # React contexts (auth)
types/
└── api.ts              # TypeScript types
i18n/
├── messages/           # Translations (en.json, ar.json)
└── request.ts          # next-intl config
```

## API Endpoints Used

### Auth
- POST `/auth/login` - Login
- POST `/auth/refresh` - Refresh access token
- GET `/auth/me` - Get current user
- POST `/auth/logout` - Logout

### Future Endpoints
Add more API endpoints in `lib/api/` as needed:
- Courses
- Payments
- Certificates
- etc.

## Security

🔒 **Token Storage**
- Access token: Memory only (never localStorage)
- Refresh token: HTTP-only cookie
- Auto-refresh on 401 errors

## Notes

- Login redirects to `/admin` dashboard
- Dashboard shows user info when API is connected
- All routes support English (`/en/`) and Arabic (`/ar/`)
- Protected routes check for `INSTRUCTOR` role

# Dynamic Form Builder & Scalable Form Submission System

A full-stack application that allows administrators to create, manage, publish, and collect responses through dynamic forms without developing individual form components.

## Technology Stack

**Frontend**
- React.js
- Redux Toolkit
- React Router DOM
- Axios
- CSS

**Backend**
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs
- Helmet
- Express Rate Limit

## Features

### Admin Dashboard
- View total forms.
- View published and draft forms.
- View total submissions.
- Dynamic statistics fetched from the backend.

### Form Management
- Create and manage forms.
- Add, edit, delete, and reorder fields.
- Save forms as Draft or Publish.
- Configure field labels, keys, placeholders, default values, and required settings.

### Supported Field Types
- Text
- Email
- Number
- Phone
- Textarea
- Date
- Select
- Radio
- Checkbox

### Public Form Submission
- Dynamically render published forms.
- Submit responses through a public form URL.
- Validate submitted data on the backend.
- Store dynamic answers in JSON format.

### Submission Management
- View form submissions.
- Paginate submission records.
- View individual submission details.
- Delete submissions.

### Security
- JWT-based authentication.
- Role-based authorization for admin routes.
- Password hashing using bcryptjs.
- Backend-side form validation.
- Parameterized SQL queries.
- Helmet security headers.
- Login rate limiting.
- Environment variables for configuration.

## Project Structure

```text
dynamic-form-builder/
│
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── docs/
│   │   └── DATABASE_DESIGN.md
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## Installation and Setup

### Prerequisites
- Node.js and npm
- MySQL or MariaDB
- XAMPP / WAMP or a standalone MySQL server

### 1. Clone the repository

```bash
git clone https://github.com/devSandhiyaS/dynamic-form-builder.git
cd dynamic-form-builder
```

### 2. Database Setup

1. Start MySQL using XAMPP or WAMP.
2. Open phpMyAdmin.
3. Import `backend/database/schema.sql`.
4. The database `dynamic_form_builder` and its tables will be created.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the following environment variables:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dynamic_form_builder
DB_PORT=3306
JWT_SECRET=your_secure_random_secret
```

Start the backend:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

### 5. Admin Login

An administrator account must exist in the `users` table with the `ADMIN` role. Configure the account securely in your local database before logging in.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |

### Forms

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forms` | Create form |
| GET | `/api/forms` | List forms |
| GET | `/api/forms/:id` | Get published form |
| GET | `/api/forms/admin/:id` | Get admin form |
| PUT | `/api/forms/:id` | Update form |
| DELETE | `/api/forms/:id` | Delete form |

### Form Fields

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forms/:formId/fields` | Add field |
| PUT | `/api/forms/:formId/fields/:fieldId` | Update field |
| DELETE | `/api/forms/:formId/fields/:fieldId` | Delete field |
| PUT | `/api/forms/:formId/fields/reorder` | Reorder fields |

### Submissions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/forms/:formId/submissions` | Submit public form |
| GET | `/api/forms/:formId/submissions` | List submissions |
| GET | `/api/forms/:formId/submissions/:submissionId` | Get submission |
| DELETE | `/api/forms/:formId/submissions/:submissionId` | Delete submission |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard statistics |

Admin endpoints require a valid JWT bearer token and administrator authorization, except public form retrieval and submission.

## Database Design

The application uses four primary tables:

- `users` – stores user and administrator information.
- `forms` – stores form details and publication status.
- `form_fields` – stores dynamic field definitions and configurations.
- `form_submissions` – stores submitted answers in JSON format.

Dynamic submission data is stored as JSON instead of creating separate database columns for every form field.

For more details, refer to [Database Design](backend/docs/DATABASE_DESIGN.md).

## Scalability Considerations

The application considers scalability through:

- Database indexes for frequently queried columns.
- Pagination for submission listing.
- Connection pooling for MySQL connections.
- JSON storage for flexible dynamic form responses.
- Backend validation to maintain data integrity.
- Rate limiting for login requests.

For larger workloads, the architecture can be extended with caching, background job queues, and additional database optimization.

## Testing

API endpoints can be tested using Postman.

The application supports testing authentication, form creation, field management, publishing, public submissions, and submission management.

## Repository

GitHub: https://github.com/devSandhiyaS/dynamic-form-builder

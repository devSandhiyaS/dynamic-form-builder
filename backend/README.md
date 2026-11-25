# Dynamic Form Builder & Scalable Form Submission System

## 1. Project Overview

The Dynamic Form Builder is a full-stack web application that allows administrators to create and manage dynamic forms without hardcoding individual form fields.

Administrators can create forms, configure different field types, manage fields, and publish forms. Public users can access published forms and submit their responses. Administrators can view, manage, and delete submitted responses.

## 2. Technology Stack

### Frontend
- React.js
- Redux Toolkit
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MySQL
- mysql2
- JWT Authentication
- bcryptjs
- Zod (installed; document its usage only if implemented)

### Development Tools
- Visual Studio Code
- XAMPP / phpMyAdmin
- Postman
- Git and GitHub

## 3. Main Features

### Admin Features
- Admin login using JWT authentication.
- Create and manage forms.
- Save forms as Draft or Publish.
- Add, update, delete and reorder form fields.
- Configure field labels, keys, placeholders, default values and required status.
- Configure options for Select, Radio and Checkbox fields.
- View submissions for a selected form.
- View individual submission details.
- Delete submissions.
- Paginated submission listing.

### Public User Features
- Access published forms through a dynamic URL.
- Render form fields based on the saved form definition.
- Enter and submit responses.
- Receive validation feedback.
- Submit responses without requiring admin authentication.

### Supported Field Types

- TEXT
- EMAIL
- NUMBER
- PHONE
- TEXTAREA
- DATE
- SELECT
- RADIO
- CHECKBOX

## 4. Project Structure

```text
dynamic-form-builder/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── forms/
│   │   │   └── submissions/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## 5. Installation and Setup

### Prerequisites

- Node.js and npm
- MySQL or XAMPP
- Git
- Postman

### Step 1: Clone the Repository

```bash
git clone <your-github-repository-url>
cd dynamic-form-builder
```

### Step 2: Configure the Database

1. Start Apache and MySQL using XAMPP.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Create a database named `dynamic_form_builder`.
4. Import `backend/database/schema.sql`.

### Step 3: Configure Backend Environment

Create `backend/.env` using `backend/.env.example` as a reference.

```env
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dynamic_form_builder
DB_PORT=3306

JWT_SECRET=replace_with_a_secure_random_secret
```

Use the credentials configured for your own MySQL installation.

### Step 4: Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

`http://localhost:5000`

### Step 5: Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## 6. Database Design

The application uses four main tables.

| Table | Purpose |
|---|---|
| users | Stores administrator and user account details |
| forms | Stores form title, description and publication status |
| form_fields | Stores dynamic field definitions for each form |
| form_submissions | Stores submitted responses for each form |

### Relationships

- One user can create multiple forms.
- One form can contain multiple fields.
- One form can receive multiple submissions.
- Form fields are deleted when their parent form is deleted.
- Submissions are deleted when their parent form is deleted.

### Dynamic Submission Storage

Form definitions are stored relationally in `forms` and `form_fields`.

Submitted answers are stored as JSON in `form_submissions.submitted_data`.

This approach allows administrators to create forms with different field combinations without creating or altering a separate database table for every form.

## 7. API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/login` | Admin login | Public |

### Form Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/forms` | Create a form | Admin |
| GET | `/forms` | List forms | Admin |
| GET | `/forms/admin/:id` | Get a form for editing | Admin |
| GET | `/forms/:id` | Get a published form | Public |
| PUT | `/forms/:id` | Update form details/status | Admin |
| DELETE | `/forms/:id` | Delete a form | Admin |

### Form Field Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/forms/:formId/fields` | Add a field | Admin |
| PUT | `/forms/:formId/fields/:fieldId` | Update a field | Admin |
| DELETE | `/forms/:formId/fields/:fieldId` | Delete a field | Admin |
| PUT | `/forms/:formId/fields/reorder` | Reorder fields | Admin |

### Submission Management

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/forms/:formId/submissions` | Submit a public form | Public |
| GET | `/forms/:formId/submissions` | List submissions with pagination | Admin |
| GET | `/forms/:formId/submissions/:submissionId` | Get a submission | Admin |
| DELETE | `/forms/:formId/submissions/:submissionId` | Delete a submission | Admin |

Admin endpoints require a valid JWT access token.

## 8. Validation and Security

- Backend validation checks submitted answers against the saved form definition.
- Required fields are validated on the backend.
- Email, number, phone and selection values are validated.
- Unknown field keys are rejected.
- SQL queries use parameterized values through mysql2.
- Passwords are checked using bcrypt.
- JWT authentication protects administrator endpoints.
- Role-based authorization restricts admin operations.
- Helmet adds HTTP security headers.
- Express rate limiting is applied to the login endpoint.
- Environment variables are used for database credentials and JWT secrets.
- Request body size is limited.

## 9. Scalability Considerations

### Handling Large Numbers of Forms

- Indexes on form status and creator columns support common form queries.
- Form field indexes support retrieving fields in display order.

### Handling Large Submission Volumes

- Submissions are stored separately from form definitions.
- An index on `(form_id, submitted_at)` supports retrieving submissions for a form in date order.
- Pagination limits the number of records returned per request.
- A connection pool manages concurrent database connections.

### High Concurrent Submissions

- The backend validates submissions before storing them.
- Database connection pooling helps reuse database connections.
- For larger production deployments, background queues can process non-critical tasks such as notifications.
- Database replication, caching and horizontal application scaling can be considered as traffic increases.

### Future Production Considerations

- Use a managed database with backups and monitoring.
- Introduce queue-based processing for heavy asynchronous tasks.
- Monitor API response times and database query performance.
- Add retention policies and archival for old submissions where required.

## 10. Testing

The APIs can be tested using the Postman collection included in the repository.

Recommended test scenarios:

1. Admin login with valid and invalid credentials.
2. Create a form and verify it is saved as Draft.
3. Add, update, delete and reorder fields.
4. Publish a form.
5. Access the published form without admin authentication.
6. Verify that Draft forms cannot be publicly accessed.
7. Submit valid and invalid responses.
8. Verify required-field and field-type validation.
9. Retrieve submissions using pagination.
10. View and delete individual submissions.
11. Verify that unauthorized users cannot access admin endpoints.

## 11. Environment and Repository Notes

- Do not commit `.env` files or real credentials.
- Keep `.env.example` in the repository.
- Use a secure JWT secret outside local development.
- Import the database schema before starting the application.
- Change or replace any development admin credentials before deployment.

## 12. License

This project was developed as a technical assessment project.
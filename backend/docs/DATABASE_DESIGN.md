# Database Design – Dynamic Form Builder

## 1. Overview

The application uses a relational MySQL database with four main tables:

1. `users`
2. `forms`
3. `form_fields`
4. `form_submissions`

The design separates form metadata, dynamic field definitions and submitted responses.

## 2. Table Design

### users

Stores administrator and user account information.

| Column | Description |
|---|---|
| id | Primary key |
| name | User's name |
| email | Unique email address |
| password | Hashed password |
| role | ADMIN or USER |
| created_at | Account creation time |
| updated_at | Last update time |

The email column has a unique constraint to prevent duplicate accounts.

### forms

Stores the forms created by administrators.

| Column | Description |
|---|---|
| id | Primary key |
| title | Form title |
| description | Form description |
| status | DRAFT or PUBLISHED |
| created_by | Foreign key referencing users.id |
| created_at | Creation time |
| updated_at | Last update time |

The `created_by` foreign key identifies the administrator who created the form.

### form_fields

Stores the dynamic field definitions belonging to each form.

| Column | Description |
|---|---|
| id | Primary key |
| form_id | Foreign key referencing forms.id |
| label | Field label displayed to the user |
| field_key | Unique key within the form |
| field_type | Type of input field |
| placeholder | Input placeholder |
| default_value | Default field value |
| options | JSON containing selection options |
| validation_rules | JSON containing validation configuration |
| is_required | Indicates whether the field is mandatory |
| display_order | Field display sequence |
| created_at | Creation time |
| updated_at | Last update time |

A unique constraint on `(form_id, field_key)` prevents duplicate field keys within the same form.

The `(form_id, display_order)` index helps retrieve fields in their configured order.

### form_submissions

Stores responses submitted by public users.

| Column | Description |
|---|---|
| id | Primary key |
| form_id | Foreign key referencing forms.id |
| submitted_data | JSON containing submitted answers |
| submitted_at | Submission timestamp |

The `(form_id, submitted_at)` index supports retrieving submissions for a particular form in date order.

## 3. Entity Relationships

- One user can create multiple forms.
- One form can contain multiple fields.
- One form can receive multiple submissions.
- Deleting a form cascades deletion to its associated fields and submissions.
- Deleting a user is restricted while forms created by that user exist.

## 4. Why JSON Is Used for Submitted Answers

Dynamic forms can have different fields and different combinations of input types.

Creating a separate database column for every possible form field would make the database difficult to maintain. It would also require schema changes whenever an administrator created a new field.

Instead, the application stores submitted answers as JSON in `form_submissions.submitted_data`.

Example:

```json
{
  "emp_name": "Sandhiya",
  "email": "sandhiya@example.com",
  "phone_number": "9876543210",
  "department": "Development"
}
```

This allows different forms to store different answer structures without changing the database schema.

The backend validates the submitted keys and values against the corresponding form field definitions before saving the response.

## 5. Indexing Strategy

The database uses indexes to improve common query operations:

- `users.email` – unique lookup during login.
- `forms.status` – filter forms by publication status.
- `forms.created_by` – retrieve forms created by an administrator.
- `form_fields(form_id, display_order)` – retrieve ordered fields for a form.
- `form_submissions(form_id, submitted_at)` – retrieve submissions for a form in date order.

## 6. Scalability Considerations

- Pagination prevents returning all submissions in one API response.
- Connection pooling reuses database connections.
- Separate form metadata and submission storage avoids creating a new table for each form.
- Indexes improve common filtering and retrieval operations.
- For larger deployments, database monitoring, backups, archival, replication and asynchronous background processing can be introduced.

## 7. Design Summary

This hybrid relational and JSON-based design provides structured management of forms and field definitions while allowing flexible storage of dynamic user responses.
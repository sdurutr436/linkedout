# API Reference

All endpoints require a valid session cookie (`linkedout_token`) unless marked as **public**.

Base URL: `http://localhost:3000` (configurable via `NEXT_PUBLIC_APP_URL`)

---

## Authentication

### `POST /api/auth/register` — Public

Create a new user account.

**Request body**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Response `201`**
```json
{ "ok": true, "user": { "id": "...", "email": "...", "name": "..." } }
```
Sets `linkedout_token` cookie.

---

### `POST /api/auth/login` — Public

Log in with existing credentials.

**Request body**
```json
{ "email": "string", "password": "string" }
```

**Response `200`** — Sets `linkedout_token` cookie.

---

### `POST /api/auth/logout`

Clear the session cookie.

**Response `200`** `{ "ok": true }`

---

### `GET /api/auth/me`

Return the current authenticated user.

**Response `200`**
```json
{ "user": { "id": "...", "email": "...", "name": "..." } }
```

---

## Profile

### `GET /api/profile`

Return the current user's profile.

### `PUT /api/profile`

Update profile. All fields optional.

**Request body**
```json
{
  "cvContent": "string",
  "cvFileName": "string",
  "titulaciones": "string",
  "experiencia": "string",
  "linkedinEmail": "string",
  "linkedinPassword": "string",
  "infojobsEmail": "string",
  "infojobsPassword": "string",
  "preferences": {
    "keywords": "string",
    "location": "string",
    "jobType": "fulltime | parttime | contract | internship",
    "salaryMin": "string"
  }
}
```

---

## Jobs

### `POST /api/jobs`

Search job listings on LinkedIn or Infojobs.

**Request body**
```json
{
  "platform": "linkedin | infojobs",
  "keywords": "string",
  "location": "string",
  "jobType": "string",
  "maxResults": 20
}
```

**Response `200`**
```json
{
  "jobs": [
    {
      "id": "linkedin-123",
      "title": "string",
      "company": "string",
      "location": "string",
      "salary": "string | null",
      "description": "string",
      "url": "string",
      "platform": "linkedin | infojobs",
      "isEasyApply": true
    }
  ]
}
```

---

## CV

### `POST /api/cv/optimize`

Generate an AI-optimized CV for a specific job offer.

**Request body**
```json
{
  "jobTitle": "string",
  "company": "string",
  "jobDescription": "string"
}
```

**Response `201`**
```json
{ "cv": { "id": "...", "jobTitle": "...", "company": "...", "content": "# Markdown...", "createdAt": "..." } }
```

---

### `GET /api/cv/optimize`

List all optimized CVs for the current user.

---

### `GET /api/cv/[id]`

Download the optimized CV as Markdown.

**Query params**
- `?format=pdf` — Download as PDF instead

---

## Applications

### `GET /api/applications`

List all applications for the current user.

### `POST /api/applications`

Record a new application (also syncs to Google Sheets if configured).

**Request body**
```json
{
  "company": "string",
  "position": "string",
  "platform": "linkedin | infojobs",
  "jobUrl": "string",
  "jobId": "string",
  "salary": "string",
  "contactPerson": "string",
  "companySummary": "string",
  "optimizedCVId": "string"
}
```

### `PATCH /api/applications/[id]`

Update application status.

**Request body**
```json
{ "status": "enviado | rechazado | aceptado" }
```

### `DELETE /api/applications/[id]`

Delete an application.

---

## Error Responses

All error responses follow this shape:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing or invalid fields) |
| 401 | Not authenticated |
| 404 | Resource not found |
| 429 | Rate limit exceeded (60 req/min/IP) |
| 500 | Server error |

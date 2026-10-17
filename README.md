# Student Management System

A full-stack Student Portal System developed using ReactJS, Node.js, Express.js, and MySQL.

The system allows students to create accounts, log in, manage their profiles, view available courses, enroll in courses, and view their grades. It also includes an admin panel for managing courses and student grades.

## Project Features

### Student Features

- Create a student account
- Login using email and password
- Secure authentication using JWT
- View and update student profile
- View available courses
- Enroll in active courses
- View registered courses
- Remove course enrollment
- View grades and academic average
- Logout securely

### Admin Features

- Admin role authorization
- Add new courses
- View all courses
- Update courses
- Delete courses
- View student enrollments
- Add student grades
- Update student grades
- Delete student grades

## Technologies Used

### Frontend

- ReactJS
- React Router
- JavaScript
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- CORS
- dotenv

### Database

- MySQL
- MySQL Workbench
- mysql2

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

## Database Structure

The system uses four related tables:

- `users`
- `courses`
- `enrollments`
- `grades`

### Relationships

```text
users → enrollments ← courses
              ↓
            grades
```

## Project Structure

```text
student-portal-system
│
├── backend
│   ├── config
│   ├── middleware
│   ├── routes
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   └── package.json
│
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/22030084-code/student-portal-system.git
```

Open the project folder:

```bash
cd student-portal-system
```

### 2. Configure MySQL

Create a MySQL database named:

```sql
CREATE DATABASE student_portal_db;
```

The database must contain the following tables:

```text
users
courses
enrollments
grades
```

### 3. Configure the Backend Environment

Create a file named `.env` inside the `backend` folder.

Add the following configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=student_portal_db
JWT_SECRET=YOUR_SECRET_KEY
```

Do not upload the `.env` file to GitHub.

### 4. Install and Run the Backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

Test the database connection:

```text
http://localhost:5000/api/test-db
```

### 5. Install and Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## Main API Routes

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Users

```text
GET /api/users/profile
PUT /api/users/profile
```

### Courses

```text
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

### Enrollments

```text
GET    /api/enrollments
GET    /api/enrollments/my-courses
POST   /api/enrollments/:courseId
DELETE /api/enrollments/:id
```

### Grades

```text
GET    /api/grades
GET    /api/grades/my-grades
POST   /api/grades/:enrollmentId
PUT    /api/grades/:id
DELETE /api/grades/:id
```

## Screenshots

Screenshots of the following pages will be added:

- Home Page
- Student Login
- Student Profile
- Courses Page
- My Courses Page
- Grades Page
- Admin Courses Panel
- Admin Grades Panel
- MySQL Database Tables

## Security Features

- Passwords are encrypted using bcryptjs
- Protected routes use JWT authentication
- Administrative operations require an admin role
- Environment variables are stored inside `.env`
- SQL queries use parameterized values
- Input validation and error handling are implemented

## Future Improvements

- Email notifications
- Password reset
- Course search and filtering
- Attendance management
- Student dashboard statistics
- Online deployment
- Mobile application

## Contribution Statement

This project was completed individually by:

**Abdel Rahman Othman**

## Course Information

```text
Course: CSCI426 – Advanced Web Programming
Project: Student Portal System
Semester: Summer 2025–2026
```

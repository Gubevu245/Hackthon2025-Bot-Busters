# NaTeSA - Nazareth Tertiary Students Association

NaTeSA is a web application for managing the Nazareth Tertiary Students Association, a non-profit organization for tertiary students who are members of the Nazareth Baptist Church EBuhleni.

## Features

- **Member Management**: Add, edit, and delete members. Move members to alumni status.
- **Events Management**: Create and manage events for the association.
- **News Management**: Publish and manage news articles.
- **Resources Management**: Upload and share resources like documents, presentations, and links.
- **User Authentication**: Secure login and registration system with role-based access control.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Hackthon2025-Bot-Busters.git
   cd Hackthon2025-Bot-Busters
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Create a PostgreSQL database:
   ```
   createdb natesa_db
   ```

4. Configure the database connection in `backend/pg.js`.

5. Run database migrations:
   ```
   npm run migrate
   ```

6. Start the backend server:
   ```
   npm start
   ```
   The server will run on http://localhost:3000 by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd ../frontend
   ```

2. Open the HTML files directly in your browser or use a simple HTTP server:
   ```
   npx http-server
   ```
   The frontend will be available at http://localhost:8080 by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Request body: `{ name, email, password, role, branch_id }`
  - Response: `{ id, name, email, role, token }`

- `POST /api/auth/login` - Login a user
  - Request body: `{ email, password }`
  - Response: `{ id, name, email, role, token }`

- `GET /api/auth/me` - Get current user info
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, name, email, role, branch_id }`

### Users/Members

- `GET /api/users` - Get all users
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of user objects

- `GET /api/users/:id` - Get a specific user
  - Headers: `Authorization: Bearer <token>`
  - Response: User object

- `POST /api/users` - Create a new user
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ name, email, password, role, branch_id }`
  - Response: Created user object

- `PUT /api/users/:id` - Update a user
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ name, email, role, branch_id }`
  - Response: Updated user object

- `DELETE /api/users/:id` - Delete a user
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

### Alumni

- `GET /api/alumni` - Get all alumni
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of alumni objects

- `GET /api/alumni/:id` - Get a specific alumni
  - Headers: `Authorization: Bearer <token>`
  - Response: Alumni object

- `POST /api/alumni` - Create a new alumni record
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ user_id, branch_id, graduation_date, degree, current_status }`
  - Response: Created alumni object

- `PUT /api/alumni/:id` - Update an alumni record
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ graduation_date, degree, current_status }`
  - Response: Updated alumni object

- `DELETE /api/alumni/:id` - Delete an alumni record
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

### Branches

- `GET /api/branches` - Get all branches
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of branch objects

- `GET /api/branches/:id` - Get a specific branch
  - Headers: `Authorization: Bearer <token>`
  - Response: Branch object

- `POST /api/branches` - Create a new branch
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ name, university, location }`
  - Response: Created branch object

### Events

- `GET /api/events` - Get all events
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of event objects

- `GET /api/events/:id` - Get a specific event
  - Headers: `Authorization: Bearer <token>`
  - Response: Event object

- `POST /api/events` - Create a new event
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, startDate, endDate, location, description, status }`
  - Response: Created event object

- `PUT /api/events/:id` - Update an event
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, startDate, endDate, location, description, status }`
  - Response: Updated event object

- `DELETE /api/events/:id` - Delete an event
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

### News

- `GET /api/news` - Get all news articles
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of news objects

- `GET /api/news/:id` - Get a specific news article
  - Headers: `Authorization: Bearer <token>`
  - Response: News object

- `POST /api/news` - Create a new news article
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, publishDate, author, content, status }`
  - Response: Created news object

- `PUT /api/news/:id` - Update a news article
  - Headers: `Authorization: Bearer <token>`
  - Request body: `{ title, publishDate, author, content, status }`
  - Response: Updated news object

- `DELETE /api/news/:id` - Delete a news article
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

### Resources

- `GET /api/resources` - Get all resources
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of resource objects

- `GET /api/resources/:id` - Get a specific resource
  - Headers: `Authorization: Bearer <token>`
  - Response: Resource object

- `POST /api/resources` - Create a new resource
  - Headers: `Authorization: Bearer <token>`
  - Request body: FormData with `{ title, type, category, description, file or url }`
  - Response: Created resource object

- `PUT /api/resources/:id` - Update a resource
  - Headers: `Authorization: Bearer <token>`
  - Request body: FormData with `{ title, type, category, description, file or url }`
  - Response: Updated resource object

- `DELETE /api/resources/:id` - Delete a resource
  - Headers: `Authorization: Bearer <token>`
  - Response: Success message

## License

This project is licensed under the MIT License.

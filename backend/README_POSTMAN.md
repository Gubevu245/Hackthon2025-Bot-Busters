# NaTeSA API Postman Collection

This repository contains a Postman collection for testing the NaTeSA backend API endpoints.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- NaTeSA backend server running locally or on a remote server

### Importing the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "File" and choose the `NaTeSA_API_Collection.json` file from this repository
4. Click "Import"

### Setting Up Environment Variables

The collection uses environment variables to make it easier to switch between different environments (e.g., local, staging, production).

1. In Postman, click on the "Environments" tab in the left sidebar
2. Click on "Create Environment"
3. Name your environment (e.g., "NaTeSA Local")
4. Add the following variables:
   - `baseUrl`: The base URL of your API (e.g., `http://localhost:3000`)
   - `authToken`: Leave this empty for now; it will be populated automatically after login

5. Click "Save"
6. Select your new environment from the dropdown in the top right corner of Postman

## Using the Collection

### Authentication

1. First, use the "Register User" request to create a new user
2. Then, use the "Login" request to authenticate and get a token
3. The login response will include a token. Copy this token and set it as the value for the `authToken` environment variable

### Testing Endpoints

The collection is organized into folders based on the different entities in the system:

- **Authentication**: Register, login, and get current user
- **Users**: CRUD operations for users
- **Branches**: CRUD operations for branches, plus related endpoints
- **Alumni**: CRUD operations for alumni records
- **Events**: CRUD operations for events, plus related endpoints
- **News**: CRUD operations for news articles, plus related endpoints
- **Resources**: CRUD operations for resources, plus related endpoints

Each request includes:
- Appropriate HTTP method
- URL with path parameters where needed
- Headers (including Authorization for protected endpoints)
- Example request body for POST/PUT requests
- Description of what the endpoint does

### Request Flow

For testing the full functionality, follow this general flow:

1. Register a user
2. Login to get a token
3. Create a branch
4. Create events, news, resources, etc. associated with the branch
5. Test the various GET endpoints to retrieve data
6. Test the PUT endpoints to update data
7. Test the DELETE endpoints to remove data

## Troubleshooting

- If you get 401 Unauthorized errors, make sure your `authToken` environment variable is set correctly
- If you get 404 Not Found errors, check that the API server is running and the endpoint path is correct
- If you get 500 Internal Server Error, check the server logs for more details

## Additional Notes

- Some endpoints require specific roles or permissions. Make sure the user you're authenticated as has the necessary permissions.
- The collection includes example request bodies, but you may need to modify them to match your specific data.
- For endpoints that require IDs (e.g., `/api/users/1`), replace the ID with an actual ID from your database.
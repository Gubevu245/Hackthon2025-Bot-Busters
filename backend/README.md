# NaTeSA Backend

This is the backend server for the NaTeSA (Nazareth Tertiary Students Association) application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
   ```
   PGDATABASE=postgres
   PGUSER=postgres
   PGPASSWORD=botbusters14
   PGHOST=natesa-botbusters-db.c1w04mc02xqr.eu-north-1.rds.amazonaws.com
   PGPORT=5432
   JWT_SECRET=natesa-secret-key
   ```

3. Seed the database with initial data:
   ```
   node seed.js
   ```
   This will create the necessary branch records in the database for all university branches.

4. Start the server:
   ```
   node server.js
   ```
   The server will run on port 3000 by default.

## API Documentation

The API documentation is available in the `NaTeSA_API_Collection.json` file, which can be imported into Postman for testing.

## Database Models

The application uses the following main models:

- User: Represents a NaTeSA member
- Branch: Represents a university branch
- Alumni: Represents a graduated member
- Event: Represents an event organized by NaTeSA
- News: Represents news articles
- Resource: Represents resources shared with members

## Branch Data

The seed script creates the following branch records:

1. Mangosuthu University of Technology (MUT Branch)
2. University of Zululand (UniZulu Branch)
3. Durban University of Technology (DUT Branch)
4. University of Johannesburg (UJ Branch)
5. University of the Free State (UFS Branch)
6. Nelson Mandela University (NMU Branch)
7. Cape Peninsula University of Technology (CPUT Branch)
8. University of the Western Cape (UWC Branch)
9. University of Cape Town (UCT Branch)
10. Rhodes University (Rhodes Branch)
11. University of Mpumalanga (UMP Branch)
12. Tshwane University of Technology (TUT Branch)
13. University of KwaZulu-Natal (UKZN Branch)
14. North-West University (NWU Branch)
15. University of Pretoria (UP Branch)
16. University of the Witwatersrand (Wits Branch)

These branch records are necessary for the user registration process to work correctly.
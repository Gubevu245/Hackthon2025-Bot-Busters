# Branch Test Data Scripts

These scripts add testing data to the `branches` table in the PostgreSQL database.

## Purpose

The scripts are designed to:
1. Create branch records if they don't exist
2. Update existing branch records with test data
3. Provide realistic member and alumni counts for testing

## Usage

### Node.js Script

To run the Node.js script:

```bash
cd backend
node test-data-branches.js
```

### SQL Script

To run the SQL script directly against the database:

```bash
cd backend
psql -h <hostname> -U <username> -d <database> -f test-data-branches.sql
```

Replace `<hostname>`, `<username>`, and `<database>` with your PostgreSQL connection details.

Example:
```bash
psql -h natesa-botbusters-db.c1w04mc02xqr.eu-north-1.rds.amazonaws.com -U postgres -d postgres -f test-data-branches.sql
```

You will be prompted for your password after running this command.

## What the Scripts Do

### Node.js Script

1. Connects to the PostgreSQL database using the credentials in your `.env` file
2. Checks if branch records already exist in the database
3. If no branches exist, creates all 16 university branches with test data
4. If branches exist, updates them with the test data
5. Displays a summary of all branches after the operation

### SQL Script

1. Checks if the branches table exists and creates it if it doesn't
2. Creates a temporary function to handle the insert or update operation
3. Inserts or updates each branch record with the test data
4. Displays a summary of the data and lists all branch records
5. Cleans up by dropping the temporary function

## Test Data

Both scripts add the following test data:

| ID | Branch Name | University | Member Count | Alumni Count |
|----|-------------|------------|--------------|--------------|
| 1  | MUT Branch  | Mangosuthu University of Technology | 120 | 45 |
| 2  | UniZulu Branch | University of Zululand | 85 | 32 |
| 3  | DUT Branch | Durban University of Technology | 150 | 60 |
| 4  | UJ Branch | University of Johannesburg | 200 | 75 |
| 5  | UFS Branch | University of the Free State | 110 | 40 |
| 6  | NMU Branch | Nelson Mandela University | 95 | 38 |
| 7  | CPUT Branch | Cape Peninsula University of Technology | 130 | 50 |
| 8  | UWC Branch | University of the Western Cape | 90 | 35 |
| 9  | UCT Branch | University of Cape Town | 180 | 70 |
| 10 | Rhodes Branch | Rhodes University | 75 | 30 |
| 11 | UMP Branch | University of Mpumalanga | 65 | 25 |
| 12 | TUT Branch | Tshwane University of Technology | 160 | 65 |
| 13 | UKZN Branch | University of KwaZulu-Natal | 190 | 72 |
| 14 | NWU Branch | North-West University | 105 | 42 |
| 15 | UP Branch | University of Pretoria | 175 | 68 |
| 16 | Wits Branch | University of the Witwatersrand | 185 | 73 |

## Notes

- The script uses the same database connection as the main application
- It does not drop or recreate tables (uses `force: false` with Sequelize)
- If you need to reset the database, you can modify the script to use `force: true` (use with caution)

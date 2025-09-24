-- SQL script to add testing data to the branches table in PostgreSQL
-- This script can be run directly against the database using psql or another SQL client

-- First, check if the branches table exists, create it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'branches') THEN
        CREATE TABLE branches (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            university VARCHAR(255) NOT NULL,
            province VARCHAR(255) NOT NULL,
            member_count INTEGER DEFAULT 0,
            alumni_count INTEGER DEFAULT 0
        );
    END IF;
END
$$;

-- Function to insert or update branch data
CREATE OR REPLACE FUNCTION upsert_branch(
    p_id INTEGER,
    p_name VARCHAR,
    p_university VARCHAR,
    p_province VARCHAR,
    p_member_count INTEGER,
    p_alumni_count INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Try to update first
    UPDATE branches
    SET 
        name = p_name,
        university = p_university,
        province = p_province,
        member_count = p_member_count,
        alumni_count = p_alumni_count
    WHERE id = p_id;
    
    -- If no rows were updated, insert a new record
    IF NOT FOUND THEN
        INSERT INTO branches (id, name, university, province, member_count, alumni_count)
        VALUES (p_id, p_name, p_university, p_province, p_member_count, p_alumni_count);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert or update branch test data
SELECT upsert_branch(1, 'MUT Branch', 'Mangosuthu University of Technology', 'KwaZulu-Natal', 120, 45);
SELECT upsert_branch(2, 'UniZulu Branch', 'University of Zululand', 'KwaZulu-Natal', 85, 32);
SELECT upsert_branch(3, 'DUT Branch', 'Durban University of Technology', 'KwaZulu-Natal', 150, 60);
SELECT upsert_branch(4, 'UJ Branch', 'University of Johannesburg', 'Gauteng', 200, 75);
SELECT upsert_branch(5, 'UFS Branch', 'University of the Free State', 'Free State', 110, 40);
SELECT upsert_branch(6, 'NMU Branch', 'Nelson Mandela University', 'Eastern Cape', 95, 38);
SELECT upsert_branch(7, 'CPUT Branch', 'Cape Peninsula University of Technology', 'Western Cape', 130, 50);
SELECT upsert_branch(8, 'UWC Branch', 'University of the Western Cape', 'Western Cape', 90, 35);
SELECT upsert_branch(9, 'UCT Branch', 'University of Cape Town', 'Western Cape', 180, 70);
SELECT upsert_branch(10, 'Rhodes Branch', 'Rhodes University', 'Eastern Cape', 75, 30);
SELECT upsert_branch(11, 'UMP Branch', 'University of Mpumalanga', 'Mpumalanga', 65, 25);
SELECT upsert_branch(12, 'TUT Branch', 'Tshwane University of Technology', 'Gauteng', 160, 65);
SELECT upsert_branch(13, 'UKZN Branch', 'University of KwaZulu-Natal', 'KwaZulu-Natal', 190, 72);
SELECT upsert_branch(14, 'NWU Branch', 'North-West University', 'North West', 105, 42);
SELECT upsert_branch(15, 'UP Branch', 'University of Pretoria', 'Gauteng', 175, 68);
SELECT upsert_branch(16, 'Wits Branch', 'University of the Witwatersrand', 'Gauteng', 185, 73);

-- Display a summary of the data
SELECT 
    COUNT(*) AS total_branches,
    SUM(member_count) AS total_members,
    SUM(alumni_count) AS total_alumni
FROM branches;

-- Display all branch records
SELECT * FROM branches ORDER BY id;

-- Drop the function as it's no longer needed
DROP FUNCTION IF EXISTS upsert_branch;
// seed.js - Script to seed the database with initial data

// Import the database models
const { sequelize, Branch } = require('./db');

// Define the branch data to be inserted
const branchData = [
  {
    id: 1,
    name: 'MUT Branch',
    university: 'Mangosuthu University of Technology',
    province: 'KwaZulu-Natal',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 2,
    name: 'UniZulu Branch',
    university: 'University of Zululand',
    province: 'KwaZulu-Natal',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 3,
    name: 'DUT Branch',
    university: 'Durban University of Technology',
    province: 'KwaZulu-Natal',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 4,
    name: 'UJ Branch',
    university: 'University of Johannesburg',
    province: 'Gauteng',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 5,
    name: 'UFS Branch',
    university: 'University of the Free State',
    province: 'Free State',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 6,
    name: 'NMU Branch',
    university: 'Nelson Mandela University',
    province: 'Eastern Cape',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 7,
    name: 'CPUT Branch',
    university: 'Cape Peninsula University of Technology',
    province: 'Western Cape',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 8,
    name: 'UWC Branch',
    university: 'University of the Western Cape',
    province: 'Western Cape',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 9,
    name: 'UCT Branch',
    university: 'University of Cape Town',
    province: 'Western Cape',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 10,
    name: 'Rhodes Branch',
    university: 'Rhodes University',
    province: 'Eastern Cape',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 11,
    name: 'UMP Branch',
    university: 'University of Mpumalanga',
    province: 'Mpumalanga',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 12,
    name: 'TUT Branch',
    university: 'Tshwane University of Technology',
    province: 'Gauteng',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 13,
    name: 'UKZN Branch',
    university: 'University of KwaZulu-Natal',
    province: 'KwaZulu-Natal',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 14,
    name: 'NWU Branch',
    university: 'North-West University',
    province: 'North West',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 15,
    name: 'UP Branch',
    university: 'University of Pretoria',
    province: 'Gauteng',
    member_count: 0,
    alumni_count: 0
  },
  {
    id: 16,
    name: 'Wits Branch',
    university: 'University of the Witwatersrand',
    province: 'Gauteng',
    member_count: 0,
    alumni_count: 0
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Sync the database (without force: true to avoid dropping tables)
    await sequelize.sync({ force: false });
    
    console.log('Database synchronized');
    
    // Check if branches already exist
    const existingBranches = await Branch.findAll();
    
    if (existingBranches.length > 0) {
      console.log(`Found ${existingBranches.length} existing branches. Skipping seed.`);
      return;
    }
    
    // Insert branch data
    await Branch.bulkCreate(branchData);
    
    console.log('Branch data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
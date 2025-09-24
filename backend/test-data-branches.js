// test-data-branches.js - Script to add testing data to the branches table

// Import the database models
const { sequelize, Branch } = require('./db');

// Define the branch test data to be inserted or updated
const branchTestData = [
  {
    id: 1,
    name: 'MUT Branch',
    university: 'Mangosuthu University of Technology',
    province: 'KwaZulu-Natal',
    member_count: 120,
    alumni_count: 45
  },
  {
    id: 2,
    name: 'UniZulu Branch',
    university: 'University of Zululand',
    province: 'KwaZulu-Natal',
    member_count: 85,
    alumni_count: 32
  },
  {
    id: 3,
    name: 'DUT Branch',
    university: 'Durban University of Technology',
    province: 'KwaZulu-Natal',
    member_count: 150,
    alumni_count: 60
  },
  {
    id: 4,
    name: 'UJ Branch',
    university: 'University of Johannesburg',
    province: 'Gauteng',
    member_count: 200,
    alumni_count: 75
  },
  {
    id: 5,
    name: 'UFS Branch',
    university: 'University of the Free State',
    province: 'Free State',
    member_count: 110,
    alumni_count: 40
  },
  {
    id: 6,
    name: 'NMU Branch',
    university: 'Nelson Mandela University',
    province: 'Eastern Cape',
    member_count: 95,
    alumni_count: 38
  },
  {
    id: 7,
    name: 'CPUT Branch',
    university: 'Cape Peninsula University of Technology',
    province: 'Western Cape',
    member_count: 130,
    alumni_count: 50
  },
  {
    id: 8,
    name: 'UWC Branch',
    university: 'University of the Western Cape',
    province: 'Western Cape',
    member_count: 90,
    alumni_count: 35
  },
  {
    id: 9,
    name: 'UCT Branch',
    university: 'University of Cape Town',
    province: 'Western Cape',
    member_count: 180,
    alumni_count: 70
  },
  {
    id: 10,
    name: 'Rhodes Branch',
    university: 'Rhodes University',
    province: 'Eastern Cape',
    member_count: 75,
    alumni_count: 30
  },
  {
    id: 11,
    name: 'UMP Branch',
    university: 'University of Mpumalanga',
    province: 'Mpumalanga',
    member_count: 65,
    alumni_count: 25
  },
  {
    id: 12,
    name: 'TUT Branch',
    university: 'Tshwane University of Technology',
    province: 'Gauteng',
    member_count: 160,
    alumni_count: 65
  },
  {
    id: 13,
    name: 'UKZN Branch',
    university: 'University of KwaZulu-Natal',
    province: 'KwaZulu-Natal',
    member_count: 190,
    alumni_count: 72
  },
  {
    id: 14,
    name: 'NWU Branch',
    university: 'North-West University',
    province: 'North West',
    member_count: 105,
    alumni_count: 42
  },
  {
    id: 15,
    name: 'UP Branch',
    university: 'University of Pretoria',
    province: 'Gauteng',
    member_count: 175,
    alumni_count: 68
  },
  {
    id: 16,
    name: 'Wits Branch',
    university: 'University of the Witwatersrand',
    province: 'Gauteng',
    member_count: 185,
    alumni_count: 73
  }
];

// Function to add test data to the database
async function addTestData() {
  try {
    // Sync the database (without force: true to avoid dropping tables)
    await sequelize.sync({ force: false });
    
    console.log('Database synchronized');
    
    // Check if branches already exist
    const existingBranches = await Branch.findAll();
    
    if (existingBranches.length === 0) {
      console.log('No existing branches found. Creating all branches with test data...');
      
      // Insert all branch data at once
      await Branch.bulkCreate(branchTestData);
      
      console.log('All branches created with test data successfully!');
    } else {
      console.log(`Found ${existingBranches.length} existing branches. Updating with test data...`);
      
      // Update each branch with test data
      for (const branchData of branchTestData) {
        const [branch, created] = await Branch.findOrCreate({
          where: { id: branchData.id },
          defaults: branchData
        });
        
        if (!created) {
          // Update existing branch with test data
          await branch.update(branchData);
          console.log(`Updated branch ID ${branchData.id}: ${branchData.name}`);
        } else {
          console.log(`Created branch ID ${branchData.id}: ${branchData.name}`);
        }
      }
      
      console.log('All branches updated with test data successfully!');
    }
    
    // Verify the data by fetching all branches
    const updatedBranches = await Branch.findAll({ order: [['id', 'ASC']] });
    
    console.log('\nBranch Test Data Summary:');
    console.log('------------------------');
    
    let totalMembers = 0;
    let totalAlumni = 0;
    
    updatedBranches.forEach(branch => {
      console.log(`ID: ${branch.id}, ${branch.name}, Members: ${branch.member_count}, Alumni: ${branch.alumni_count}`);
      totalMembers += branch.member_count;
      totalAlumni += branch.alumni_count;
    });
    
    console.log('------------------------');
    console.log(`Total Branches: ${updatedBranches.length}`);
    console.log(`Total Members: ${totalMembers}`);
    console.log(`Total Alumni: ${totalAlumni}`);
    
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the test data function
addTestData();
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database connection using environment variables
const sequelize = new Sequelize(
  process.env.PGDATABASE || 'postgres', 
  process.env.PGUSER || 'postgres', 
  process.env.PGPASSWORD || 'botbusters14', 
  {
    host: process.env.PGHOST || 'natesa-botbusters-db.c1w04mc02xqr.eu-north-1.rds.amazonaws.com',
    port: process.env.PGPORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false // Set to console.log to see SQL queries
  });

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Connection to database has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Import models
const User = require('./user')(sequelize, DataTypes);
const Branch = require('./branch')(sequelize, DataTypes);
const Alumni = require('./alumni')(sequelize, DataTypes);
const Event = require('./event')(sequelize, DataTypes);
const News = require('./news')(sequelize, DataTypes);
const Resource = require('./resource')(sequelize, DataTypes);
const Bot = require('./bot')(sequelize, DataTypes);
const Activity = require('./activity')(sequelize, DataTypes);
const Report = require('./report')(sequelize, DataTypes);
const Message = require('./message')(sequelize, DataTypes);

// Create a models object to pass to associate functions
const models = {
  User,
  Branch,
  Alumni,
  Event,
  News,
  Resource,
  Bot,
  Activity,
  Report,
  Message
};

// Call associate function for each model if it exists
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  ...models
};

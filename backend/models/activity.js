const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    // Add any additional fields that your application needs
  }, {
    timestamps: true,
    tableName: 'activities',
    // Add any model options here
  });

  // Define associations here if needed
  Activity.associate = (models) => {
    // Example association:
    // Activity.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Activity;
};

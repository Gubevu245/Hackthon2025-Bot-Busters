module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    // Define model attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    botId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'bots',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    evidence: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
      defaultValue: 'pending'
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    }
  }, {
    // Model options
    tableName: 'reports',
    timestamps: true
  });

  // Define associations
  Report.associate = (models) => {
    // A report belongs to a reporter (user)
    if (models.User) {
      Report.belongsTo(models.User, { as: 'reporter', foreignKey: 'reporterId' });
      Report.belongsTo(models.User, { as: 'assignee', foreignKey: 'assignedTo' });
    }
    
    // A report can be about a bot
    if (models.Bot) {
      Report.belongsTo(models.Bot, { foreignKey: 'botId' });
    }
  };

  return Report;
};
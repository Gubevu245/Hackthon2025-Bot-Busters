module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define('Bot', {
    // Define model attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    detection_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    last_activity: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'blocked', 'monitoring'),
      defaultValue: 'monitoring'
    },
    threat_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    detection_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    behavior_pattern: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    // Model options
    tableName: 'bots',
    timestamps: true
  });

  // Define associations
  Bot.associate = (models) => {
    // A bot can have many activities
    if (models.Activity) {
      Bot.hasMany(models.Activity, { foreignKey: 'botId' });
    }
    
    // A bot can have many reports
    if (models.Report) {
      Bot.hasMany(models.Report, { foreignKey: 'botId' });
    }
    
    // A bot can be associated with messages
    if (models.Message) {
      Bot.hasMany(models.Message, { foreignKey: 'botId' });
    }
  };

  return Bot;
};
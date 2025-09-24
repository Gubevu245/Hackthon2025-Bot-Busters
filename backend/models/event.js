module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    // Define model attributes based on the provided schema
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'upcoming'
    }
  }, {
    // Model options
    tableName: 'events',
    timestamps: true
  });

  // Define associations
  Event.associate = (models) => {
    // An event belongs to a branch
    if (models.Branch) {
      Event.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }
    
    // An event is created by a user
    if (models.User) {
      Event.belongsTo(models.User, { as: 'creator', foreignKey: 'created_by' });
    }
  };

  return Event;
};
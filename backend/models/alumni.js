module.exports = (sequelize, DataTypes) => {
  const Alumni = sequelize.define('Alumni', {
    // Define model attributes based on the provided schema
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    graduation_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: false
    },
    current_status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'alumni',
    timestamps: true
  });

  // Define associations
  Alumni.associate = (models) => {
    // An alumni belongs to a user
    if (models.User) {
      Alumni.belongsTo(models.User, { foreignKey: 'user_id' });
    }
    
    // An alumni belongs to a branch
    if (models.Branch) {
      Alumni.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }
  };

  return Alumni;
};
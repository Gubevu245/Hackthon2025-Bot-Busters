module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    // Define model attributes based on the provided schema
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    university: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    member_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    alumni_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    // Model options
    tableName: 'branches',
    timestamps: false
  });

  // Define associations
  Branch.associate = (models) => {
    // A branch has many users
    if (models.User) {
      Branch.hasMany(models.User, { foreignKey: 'branch_id' });
    }

    // A branch has many alumni
    if (models.Alumni) {
      Branch.hasMany(models.Alumni, { foreignKey: 'branch_id' });
    }

    // A branch has many events
    if (models.Event) {
      Branch.hasMany(models.Event, { foreignKey: 'branch_id' });
    }

    // A branch has many news
    if (models.News) {
      Branch.hasMany(models.News, { foreignKey: 'branch_id' });
    }
  };

  return Branch;
};

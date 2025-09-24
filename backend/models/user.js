module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    is_bec_member: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    nec_position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bec_position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    }
  }, {
    // Model options
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    }
  });

  // Define associations
  User.associate = (models) => {
    // A user belongs to a branch
    if (models.Branch) {
      User.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }

    // A user can have alumni information
    if (models.Alumni) {
      User.hasOne(models.Alumni, { foreignKey: 'user_id' });
    }

    // A user can create events
    if (models.Event) {
      User.hasMany(models.Event, { foreignKey: 'created_by' });
    }

    // A user can author news
    if (models.News) {
      User.hasMany(models.News, { foreignKey: 'author_id' });
    }
  };

  return User;
};

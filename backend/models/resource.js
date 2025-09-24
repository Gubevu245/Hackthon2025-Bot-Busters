module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
    // Define model attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
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
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'archived'),
      defaultValue: 'active'
    }
  }, {
    // Model options
    tableName: 'resources',
    timestamps: true
  });

  // Define associations
  Resource.associate = (models) => {
    // A resource belongs to a branch
    if (models.Branch) {
      Resource.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }
    
    // A resource is uploaded by a user
    if (models.User) {
      Resource.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploaded_by' });
    }
  };

  return Resource;
};
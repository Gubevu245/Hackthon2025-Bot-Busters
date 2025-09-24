module.exports = (sequelize, DataTypes) => {
  const News = sequelize.define('News', {
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
    content: {
      type: DataTypes.TEXT,
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
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    publish_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published'
    }
  }, {
    // Model options
    tableName: 'news',
    timestamps: true
  });

  // Define associations
  News.associate = (models) => {
    // A news item belongs to a branch
    if (models.Branch) {
      News.belongsTo(models.Branch, { foreignKey: 'branch_id' });
    }
    
    // A news item is authored by a user
    if (models.User) {
      News.belongsTo(models.User, { as: 'author', foreignKey: 'author_id' });
    }
  };

  return News;
};
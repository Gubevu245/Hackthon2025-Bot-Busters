module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    // Define model attributes
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isSpam: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    spamScore: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'messages',
    timestamps: true
  });

  // Define associations
  Message.associate = (models) => {
    // A message belongs to a sender (user)
    if (models.User) {
      Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
      Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
    }
    
    // A message might be associated with a bot
    if (models.Bot) {
      Message.belongsTo(models.Bot, { foreignKey: 'botId' });
    }
  };

  return Message;
};
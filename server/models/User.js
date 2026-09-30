const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      if (value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      }
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'therapist', 'admin'),
    defaultValue: 'user',
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    defaultValue: null,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeUpdate(user) {
      user.updatedAt = new Date();
    },
  },
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get safe JSON representation (without password)
User.prototype.getSafeJSON = function() {
  const user = Object.assign({}, this.get());
  delete user.password;
  return user;
};

module.exports = User;

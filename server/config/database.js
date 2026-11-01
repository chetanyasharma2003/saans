const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
const databaseHost = process.env.DB_HOST || (databaseUrl ? new URL(databaseUrl).hostname : 'localhost');
const isLocalDatabase = /^(localhost|127\.0\.0\.1|::1)$/.test(databaseHost);
const useSSL = process.env.DB_SSL
  ? process.env.DB_SSL.toLowerCase() === 'true'
  : process.env.NODE_ENV === 'production' && !isLocalDatabase;

// Support both DATABASE_URL (full connection string) and individual configs
const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: useSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: databaseHost,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'saans',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: useSSL
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected via Sequelize');

    // Import all models for sync
    require('../models/index');

    // Sync models (development only - use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database schemas synced');
    }
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
    console.warn('⚠️  Server will retry connection in 10 seconds...');
    setTimeout(connectDB, 10000);
    return false;
  }
};

module.exports = { sequelize, connectDB };

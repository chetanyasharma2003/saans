const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both DATABASE_URL (full connection string) and individual configs
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'dpg-dao5miuk1f9s73ap16g0-a',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'for_saans',
      username: process.env.DB_USER || 'for_saans_user',
      password: process.env.DB_PASSWORD,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
      },
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

require('dotenv').config();
const { sequelize } = require('./config/database');

require('./seed-starter-content')()
  .catch((error) => {
    console.error('Starter content seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });

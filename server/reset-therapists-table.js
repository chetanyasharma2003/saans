const { sequelize } = require('./config/database');
const Therapist = require('./models/Therapist-PG');

const resetTherapistsTable = async () => {
  try {
    console.log('🔄 Resetting therapists table...');

    // Drop all indexes on therapists table
    await sequelize.query(`
      DROP INDEX IF EXISTS "therapists_is_active_is_verified" CASCADE;
      DROP INDEX IF EXISTS "therapists_rating" CASCADE;
      DROP INDEX IF EXISTS "therapists_city" CASCADE;
      DROP INDEX IF EXISTS "therapists_specializations" CASCADE;
    `);
    console.log('✅ Dropped indexes');

    // Drop therapists table if it exists
    await sequelize.query('DROP TABLE IF EXISTS "therapists" CASCADE');
    console.log('✅ Dropped existing therapists table');

    // Sync the model to create it fresh
    await Therapist.sync({ force: false });
    console.log('✅ Recreated therapists table with correct schema');

    console.log('\n✨ Table reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting table:', error.message);
    process.exit(1);
  }
};

resetTherapistsTable();

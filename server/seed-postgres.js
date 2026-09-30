require('dotenv').config();
const { sequelize, connectDB } = require('./config/database');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding test users...');

    // Test user
    const testUser = await User.findOrCreate({
      where: { email: 'test@saans.com' },
      defaults: {
        email: 'test@saans.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Test user created:', testUser[0].email);

    // Admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@saans.com' },
      defaults: {
        email: 'admin@saans.com',
        password: 'AdminPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        isActive: true,
      },
    });

    console.log('✅ Admin user created:', adminUser[0].email);

    console.log('\n✅ Database seeded successfully!');
    console.log('📝 Test credentials:');
    console.log('   Email: test@saans.com');
    console.log('   Password: TestPassword123!');
    console.log('   Email: admin@saans.com');
    console.log('   Password: AdminPassword123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();

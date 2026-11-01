jest.mock('../../config/database', () => ({
  sequelize: {
    authenticate: jest.fn(),
    transaction: jest.fn(),
    close: jest.fn(),
  },
}));

jest.mock('../../models', () => ({
  Group: { findOrCreate: jest.fn() },
  Resource: { findOrCreate: jest.fn() },
  Story: { findOrCreate: jest.fn() },
  Therapist: { findOrCreate: jest.fn() },
  User: { findOrCreate: jest.fn() },
}));

const { sequelize } = require('../../config/database');
const { Group, Resource, Story, Therapist, User } = require('../../models');
const { seedDemoContent } = require('../../seed-demo-content');

describe('Demo content seed', () => {
  const previousDemoFlag = process.env.ENABLE_DEMO_DATA;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.ENABLE_DEMO_DATA;
    sequelize.transaction.mockImplementation((callback) => callback('transaction'));
    User.findOrCreate.mockResolvedValue([{ id: 'demo-user-id' }, true]);
    Therapist.findOrCreate.mockResolvedValue([{}, true]);
    Story.findOrCreate.mockResolvedValue([{}, true]);
    Group.findOrCreate.mockResolvedValue([{}, true]);
    Resource.findOrCreate.mockResolvedValue([{}, true]);
  });

  afterAll(() => {
    if (previousDemoFlag === undefined) delete process.env.ENABLE_DEMO_DATA;
    else process.env.ENABLE_DEMO_DATA = previousDemoFlag;
  });

  test('refuses to seed unless demo mode is explicitly enabled', async () => {
    await expect(seedDemoContent()).rejects.toThrow('Set ENABLE_DEMO_DATA=true');
    expect(sequelize.authenticate).not.toHaveBeenCalled();
  });

  test('creates clearly fictional profiles and content idempotently when enabled', async () => {
    process.env.ENABLE_DEMO_DATA = 'true';

    await seedDemoContent();

    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(User.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'saans-demo-content@demo.invalid' },
      transaction: 'transaction',
    }));
    expect(Therapist.findOrCreate).toHaveBeenCalledTimes(3);
    expect(Therapist.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
      defaults: expect.objectContaining({
        isVerified: false,
        bio: expect.stringContaining('[DEMO PROFILE ONLY]'),
      }),
    }));
    expect(Story.findOrCreate).toHaveBeenCalledTimes(3);
    expect(Story.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
      defaults: expect.objectContaining({
        authorName: 'SAANS demo member (fictional)',
        title: expect.stringContaining('DEMO STORY'),
      }),
    }));
    expect(Group.findOrCreate).toHaveBeenCalledTimes(3);
    expect(Resource.findOrCreate).toHaveBeenCalledTimes(3);
  });
});

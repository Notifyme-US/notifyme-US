'use strict';

const { users } = require('../../../server/models');
const bearerAuth = require('../../../server/auth/middleware/bearer');

let testUser;

beforeAll(async () => {
  try {
    await users.sync();
    testUser = await users.create({
      username: 'testUser',
      password: 'pass',
      name: 'tester',
      email: 'test@test.com',
      phone: '800 867 5309',
      city: 'testville',
      state: 'TS',
      zip: '10101',
    });
  } catch (error) {
    console.log(error.message);
    return;
  }
  console.log(testUser);
});

afterAll(async () => {
  await users.drop();
});

describe('Basic auth middleware', () => {
  it('fails on signin as expected', async () => {
    let req = {
      headers: {
        authorization: `Bearer banana`,
      },
    };
    let res = {
      status: jest.fn(),
    };
    let next = jest.fn();

    await bearerAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

  });
  test('passes appropriately', async () => {
    let req = {
      headers: {
        authorization: `Bearer ${testUser.token}`,
      },
    };
    let res = {};
    let next = jest.fn();

    await bearerAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

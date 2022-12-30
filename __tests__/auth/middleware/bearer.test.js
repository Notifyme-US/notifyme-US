'use strict';

const bearerAuth = require('../../../../server/auth/middleware/bearer');

const { db, users } = require('../../../../server/models');

let testUser;
beforeAll(async () => {
  await db.sync();
  testUser = await users.create({
    username: 'testUser',
    password: 'pass',
  });
});

afterAll(async () => {
  await db.drop();
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

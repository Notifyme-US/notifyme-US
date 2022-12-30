'use strict';

const { users } = require('../../../server/models');
const basicAuth = require('../../../server/auth/middleware/basic');

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
        authorization: 'Basic Password',
      },
    };
    let res = {
      status: jest.fn(),
      send: jest.fn(),
    };
    let next = jest.fn();
    await basicAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

  });
  it('passes appropriately', async () => {
    let req = {
      headers: {
        authorization: 'Basic dGVzdFVzZXI6cGFzcw==',
      },
    };
    let res = {
      send: jest.fn(),
    };
    let next = jest.fn();

    await basicAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});

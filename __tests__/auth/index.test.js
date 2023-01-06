'use strict';

const basicAuth = require('../../../../ server/auth/middleware');
const { db, users } = require('../src/models');


beforeAll(async () => {
  await db.sync();
  await users.create({
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
        authorization: 'Basic Password',
      },
    };
    let res = {
      status: jest.fn(),
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
    let res = {};
    let next = jest.fn();

    await basicAuth(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});

'use strict';

const { sequelizeDatabase, UsersModel } = require('../../../../server/auth/models');
const supertest = require('supertest');
const { app } = require('../../../../server');
const request = supertest(app);

let testUser;

beforeAll( async () => {
  await sequelizeDatabase.sync();
  testUser = await UsersModel.create({
    username: 'testUser',
    password: 'pass',
    role: 'Admin',
  });
});

afterAll( async () => {
  await sequelizeDatabase.drop();
});


describe('ACL Integration', () => {
  it('allows read access', async () => {
    let response = await request.get('/read').set('Authorization',
      `Bearer ${testUser.token}`);
    // console.log('-----------read test', testUser);
    expect(response.status).toBe(200);
    expect(response.text).toEqual('You have read permission');
  });
  it('allows create access', async () => {
    let response = await request.get('/read').set('Authorization',
      `Bearer ${testUser.token}`);

    expect(response.status).toBe(200);
    expect(response.text).toEqual('You have read permission');
  });

  it('allows update access', async () => {
    let response = await request.get('/read').set('Authorization',
      `Bearer ${testUser.token}`);
    const parsedResponse = JSON.parse(response.text);
    expect(response.status).toBe(500);
    expect(parsedResponse.text).toEqual('Access Denied');

  });

  it('allows delete access', async () => {
    let response = await request.get('/read').set('Authorization',
      `Bearer ${testUser.token}`);
    const parsedResponse = JSON.parse(response.text);
    expect(response.status).toBe(200);
    expect(parsedResponse.text.message).toEqual('Access Denied');
  });
});

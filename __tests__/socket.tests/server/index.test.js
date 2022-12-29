'use strict';

const { db, users } = require('../src/models');
const supertest = require('supertest');
const { server } = require('../src/server');
const request = supertest(server);

let testUser;
let studentUser;

beforeAll( async () => {
  await db.sync();
  testUser = await users.create({
    username: 'testUser',
    password: 'pass',
    role: 'Admin',
  });
  studentUser = await users.create({
    username: 'testUser2',
    password: 'pass',
    role: 'Mod',
  });

});

afterAll( async () => {
  await db.drop();
});

describe('API / Auth Server Integration', () => {

  it('handles invalid request', async () => {
    const response = await request.get('/chat');
    expect(response.status).toEqual(404);
  });

  it('allows assignments to be created', async () => {
    let response = await request.post('/chat/channel').set('Authorization', `Bearer ${testUser.token}`).send({
      name: 'lab 01',
      due_date: 'tomorrow',
      scope: 'lab',
    });
    expect(response.status).toEqual(201);
    expect(response.body.name).toEqual('chat');
  });

  it('allows read access', async () => {
    let response = await request.get('/chat/channel').set('Authorization', `Bearer ${testUser.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].name).toEqual('lab 01');
  });

  it('allows read one access', async () => {
    let response = await request.get('/chat/channel/1').set('Authorization', `Bearer ${testUser.token}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual('lab 01');
  });

  it('allows channel delete by Admin', async () => {
    let response = await request.delete('/chat/channel/1').set('Authorization', `Bearer ${testUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(1);
  });


});

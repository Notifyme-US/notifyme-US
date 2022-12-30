'use strict';

const { server } = require('../../server/server');
const { users } = require('../../server/models');
const supertest = require('supertest');
const request = supertest(server);

console.log(process.env.NODE_ENV);

beforeAll( async () => {
  try {
    await users.sync();
  } catch (error) {
    console.log(error.message);
    return;
  }
});

afterAll( async () => {
  await users.drop();
});

/**
  * Note: testing here does not work as initially expected because our signup/signin handlers make an additional db call with the assumption that the roles table is seeded. I was unable to find a way to programatically seed the in-memory db in JS (within this test). In order to make test pass,
  * TODO - I need to refactor so the signin/signup outes just return the user and a separate handler queries the db for the user's rooms based on their role
*/


describe('Auth Tests', () => {
  it('allows user to signup with a POST to the /signup route', async () => {
    let response = await request.post('/signup').send({
      username: 'testUser',
      password: 'pass',
      name: 'tester',
      email: 'test@test.com',
      phone: '800 867 5309',
      city: 'testville',
      state: 'TS',
      zip: '10101',
    });
    console.log(response);
    const { user } = response.body;
    expect(response.status).toBe(201);
    expect(user.username).toEqual('testUser');
    expect(user.password).toBeTruthy();
    expect(user.password).not.toEqual('pass');
    expect(user.token).toBeTruthy();
    expect(user.role).toEqual('member');
  });

  it('allows user to signin with a POST to the /signin route', async () => {
    let response = await request.post('/signin').set('Authorization', 'Basic dGVzdFVzZXI6cGFzcw==');

    expect(response.status).toBe(200);
    expect(response.body.user.username).toEqual('testUser');
    expect(response.body.user.password).toBeTruthy();
    expect(response.body.user.password).not.toEqual('pass');
  });

  it('allows user to get users from /users route', async () => {
    let signinResponse = await request.post('/signin').set('Authorization', 'Basic dGVzdFVzZXI6cGFzcw==');
    let token = signinResponse.body.token;

    let response = await request.get('/users').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    console.log(response.body);
    expect(response.body[0]).toEqual('testUser');
  });

});

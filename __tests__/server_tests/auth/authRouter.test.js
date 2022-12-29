'use strict';


const { server } = require('../../server');
const { db } = require('../../server/models');
const supertest = require('supertest');
const request = supertest(server);

beforeAll( async () => {
  await db.sync();
});

afterAll( async () => {
  await db.drop();
});

let token;
let user;

describe('Auth Tests', () => {
  it('allows user to signup with a POST to the /signup route', async () => {
    let response = await request.post('/signup').send(
      {
        username: 'testUser',
        password: 'pass',
        role: 'Instructor',
      });
    expect(response.status).toBe(201);
    expect(response.body.user.username).toEqual('testUser');
    expect(response.body.user.password).toBeTruthy();
    expect(response.body.user.password).not.toEqual('pass');
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

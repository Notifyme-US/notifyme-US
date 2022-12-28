module.exports = [
  {
    path: '/users',
    acl: {
      admin: ['create', 'read', 'update', 'delete'],
      mod: ['read', 'update'],
      member: [],
    },
  },
  {
    path: '/roles',
    acl: {
      admin: ['create', 'read', 'update', 'delete'],
      mod: ['create', 'read'],
      member: [],
    },
  },
  {
    path: '/rooms',
    acl: {
      admin: ['create', 'read', 'update', 'delete'],
      mod: ['read'],
      member: [],
    },
  },
];

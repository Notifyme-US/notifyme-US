module.exports = [
  {
    path: '/users',
    acl: {
      Instructor: ['create', 'read', 'update', 'delete'],
      TA: ['create', 'read', 'update', 'delete'],
      Student: ['create', 'read', 'update', 'delete'],
    },
  },
  {
    path: '/assignments',
    acl: {
      Instructor: ['create', 'read', 'update', 'delete'],
      TA: ['read', 'update'],
      Student: [],
    },
  },
  {
    path: '/submissions',
    acl: {
      Instructor: ['create', 'read', 'update', 'delete'],
      TA: ['read', 'update'],
      Student: ['create', 'read'],
    },
  },
];

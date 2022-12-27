'use strict';

const perms = require('./routePermissions');

module.exports = (capability) => {

  return (req, res, next) => {
    try {
      let model = req.params.model;
      let role = req.user.role;
      let modelACL = perms.find(v => v.path === `/${model}`).acl;
      let roleRights = modelACL[role];
      console.log('🚀 ~ file: acl.js:16 ~ return ~ roleRights', roleRights);

      if(!roleRights.includes(capability)) {
        next('Access Denied');
      }
      next();
    } catch(e) {
      next('Invalid Login');
    }
  };
};

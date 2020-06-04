const CustomError = require('../errors/CustomError');
const codes = require('../errors/code');
const Permission = require('../models/permission');
const roleService = require('../services/role');
const asyncMiddleware = require('./async');

async function authorize(req, res, next) {
  const { account } = req;
  const {
    method,
    route: { path: routePath },
  } = req;

  const permission = await Permission.findOne({
    backendKey: { method, routePath },
  });

  if (!permission) throw new CustomError(codes.PERMISSION_NOT_FOUND);

  const isRoleContainPermission = await roleService.isPermissionBelongsToRole(
    account.roleId,
    permission._id,
  );
  if (isRoleContainPermission) return next();
  throw new CustomError(codes.FORBIDDEN);
}

module.exports = asyncMiddleware(authorize);

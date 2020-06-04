const camelCase = require('camelcase-keys');
const asyncMiddleware = require('./async');
const CustomError = require('../errors/CustomError');
const codes = require('../errors/code');
const authService = require('../services/auth');

async function auth(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) throw new CustomError(codes.UNAUTHORIZED);

  const [tokenType, accessToken] = authorization.split(' ');
  if (tokenType !== 'Bearer') throw new Error();

  const { data, account } = await authService.verifyAccessToken(accessToken);
  const { accountId } = camelCase(data, { deep: true });
  req.accountId = accountId;
  req.account = account;
  if (['/auths/logout', '/auths/verify'].includes(req.path)) {
    req.accessToken = accessToken;
  }

  return next();
}

async function authSmartDialog(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) throw new CustomError(codes.UNAUTHORIZED);

  const [tokenType, accessToken] = authorization.split(' ');
  if (tokenType !== 'Bearer') throw new Error();

  const { userId } = await authService.verifySmartDialogAccessToken(
    accessToken,
  );
  req.userId = userId;
  return next();
}

module.exports = {
  auth: asyncMiddleware(auth),
  authSmartDialog: asyncMiddleware(authSmartDialog),
};

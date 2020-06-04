const { param, body, oneOf, validationResult } = require('express-validator');
const CustomError = require('../errors/CustomError');
const errorCodes = require('../errors/code');

const apiTypes = {
  BLOCK_USER: 'BLOCK_USER',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
  ADD_ROLE: 'ADD_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  ADD_PERMISION: 'ADD_PERMISSION',
  UPDATE_PERMISSION: 'UPDATE_PERMISSION',
};

function validate(api) {
  switch (api) {
    case apiTypes.BLOCK_USER:
      return [
        param('userId')
          .exists()
          .withMessage('"user_id" is required')
          .isMongoId()
          .withMessage('"user_id" invalid'),
        body('block')
          .exists()
          .withMessage('"body" is required')
          .isBoolean()
          .withMessage('"block" is boolean'),
      ];
    case apiTypes.CHANGE_PASSWORD:
      return [
        body('password')
          .exists()
          .withMessage('"password" is required')
          .isString()
          .trim(),
        body('newPassword')
          .exists()
          .withMessage('"new_password" is required')
          .isString()
          .trim(),
      ];
    case apiTypes.LOGIN:
    case apiTypes.REGISTER:
      return [
        body('email')
          .exists()
          .withMessage('"email" is required')
          .isEmail(),
        body('password')
          .exists()
          .withMessage('"password" is required')
          .trim(),
      ];
    case apiTypes.ADD_ROLE:
      return [
        body('name')
          .exists()
          .withMessage('"name" is required'),
      ];
    case apiTypes.UPDATE_ROLE:
      return [
        oneOf([
          body('name').exists(),
          body('permissionIds')
            .exists()
            .isArray(),
        ]),
      ];
    case apiTypes.ADD_PERMISION:
      return [
        body('name').exists(),
        oneOf([body('backendKey').exists(), body('frontendKey').exists()]),
      ];
    case apiTypes.UPDATE_PERMISSION:
      return [
        oneOf([
          body('name').exists(),
          body('backendKey').exists(),
          body('frontendKey').exists(),
        ]),
      ];
    default:
      return [];
  }
}

function getValidateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError(errorCodes.BAD_REQUEST, errors.array().shift().msg);
  }
  next();
}

module.exports = {
  apiTypes,
  validate,
  getValidateResult,
};

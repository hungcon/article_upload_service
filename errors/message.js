const codes = require('./code');

function getErrorMessage(code) {
  switch (code) {
    case codes.USER_WITH_EMAIL_ALREADY_EXISTS:
      return 'User with email already exists';
    case codes.BOT_IS_STOPPED:
      return 'Bot is stopped';
    case codes.PERMISSION_NOT_FOUND:
      return 'Permission is not found';
    default:
      return null;
  }
}

module.exports = getErrorMessage;

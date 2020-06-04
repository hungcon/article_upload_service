/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable consistent-return */

// const fs = require('fs');

// const { mkDirByPathSync } = require('../utils/file');

// const DESTINATION = 'public';
// const AUDIO_FOLDER = 'audios';

// const upload = async (bytes, title, cleanArticleId) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month =
//     today.getMonth() + 1 < 10
//       ? `0${today.getMonth() + 1}`
//       : today.getMonth() + 1;
//   const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

//   const destination = `./${DESTINATION}/${AUDIO_FOLDER}/${year}/${month}/${day}`;

//   mkDirByPathSync(destination);

//   const fileName = `${cleanArticleId}.wav`;

//   const file = `${destination}/${fileName}`;

//   fs.writeFile(file, bytes, function(err) {
//     if (err) {
//       console.log('save file error ', err);
//       return console.log(err);
//     }
//     console.log('save file done ');
//   });
//   return file;
// };

// module.exports = { upload };
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const request = require('request');
const FileType = require('file-type');

const CustomError = require('../errors/CustomError');
const errorCodes = require('../errors/code');
const { mkDirByPathSync } = require('../utils/file');
const { generateRandomString } = require('../utils/random');

const DESTINATION = 'public';
const IMAGES_FOLDER = 'images';
const AUDIO_FOLDER = 'audios';
const VIDEO_FOLDER = 'videos';
const OTHER_FOLDER = 'others';

const filetypes = /jpeg|jpg|png|gif|mp3|wma|wav|acc|m4a|flac|mp4|mpg|mpeg|mov|wmv|flv|f4v|plain|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet/;
const fileExts = /jpeg|jpg|png|gif|mp3|wma|wav|acc|m4a|flac|mp4|mpg|mpeg|mov|wmv|flv|f4v|txt|pdf|doc|docx|ppt|pptx|xls|xlsx/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const today = new Date();
    const year = today.getFullYear();
    const month =
      today.getMonth() + 1 < 10
        ? `0${today.getMonth() + 1}`
        : today.getMonth() + 1;
    const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();

    let destination = `${DESTINATION}/${OTHER_FOLDER}/${year}/${month}/${day}`;

    if (/image/.test(file.mimetype))
      destination = `${DESTINATION}/${IMAGES_FOLDER}/${year}/${month}/${day}`;

    if (/audio/.test(file.mimetype))
      destination = `${DESTINATION}/${AUDIO_FOLDER}/${year}/${month}/${day}`;

    if (/video/.test(file.mimetype))
      destination = `${DESTINATION}/${VIDEO_FOLDER}/${year}/${month}/${day}`;

    mkDirByPathSync(destination);

    return cb(null, destination);
  },
  filename: (req, file, cb) => {
    const filename = req.query.fileName;
    return cb(null, filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const mimetype = filetypes.test(file.mimetype);
    const extname = fileExts.test(
      path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(
      new CustomError(
        errorCodes.INVALID_FILE_TYPE,
        `File upload only support the following filetypes: ${filetypes}`,
      ),
    );
  },
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

async function uploadUrl(url) {
  const today = new Date();
  const year = today.getFullYear();
  const month =
    today.getMonth() + 1 < 10
      ? `0${today.getMonth() + 1}`
      : today.getMonth() + 1;
  const day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
  const destination = `${DESTINATION}/${IMAGES_FOLDER}/${year}/${month}/${day}`;

  mkDirByPathSync(destination);

  return new Promise((resolve, reject) => {
    request({ url, encoding: null }, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        try {
          const { ext, mime } = await FileType.fromBuffer(body);
          const mimetype = filetypes.test(mime);
          const extname = fileExts.test(ext);
          if (mimetype && extname) {
            const pathFile = `${destination}/${generateRandomString(
              16,
            )}.${ext}`;

            fs.writeFileSync(pathFile, body, {
              encoding: null,
            });
            resolve(pathFile);
          } else {
            throw new CustomError(
              errorCodes.INVALID_FILE_TYPE,
              `File upload only support the following filetypes: ${filetypes}`,
            );
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(error);
      }
    });
  });
}

module.exports = { upload, uploadUrl };

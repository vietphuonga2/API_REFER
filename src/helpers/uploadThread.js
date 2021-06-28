const { workerData, parentPort } = require('worker_threads');
const async = require('async');
const AWS = require('aws-sdk');
const { aws_config } = require('../utils/constant');

AWS.config.update({
  accessKeyId: aws_config.ACCESS_KEY,
  secretAccessKey: aws_config.SECRET_KEY,
  region: aws_config.REGION,
});

const s3 = new AWS.S3();

// let data = workerData.file;

const queue = async.queue((data) => {
  const params = {
    Bucket: aws_config.BUCKET,
    Body: Buffer.from(data.buffer),
    Key: data.filename,
    ACL: 'public-read',
    ContentType: data.mimetype,
  };

  s3.upload(params, (err) => {
    if (err) {
      parentPort.postMessage({
        status: 'error',
        data: err,
      });
    } else {
      parentPort.postMessage({
        status: 'success',
        data: {
          key: data.fieldname,
          url: aws_config.AWS_URL + data.filename,
        },
      });
    }
  }).on('httpUploadProgress', (e) => {
    parentPort.postMessage({
      status: 'loading',
      data: {
        filename: data.filename,
        loaded: e.loaded,
      },
    });
  });
}, 5);

workerData.files.forEach((file) => {
  queue.push(file);
});

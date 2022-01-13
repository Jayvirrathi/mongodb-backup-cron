const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

const DB_NAME = 'test';
const HOST = '';
const USERNAME = '';
const PASSWORD = '';
const AUTH_DB = '';
let DATE = Date.now();

let ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}_${DATE}.gzip`);

// Basic mongo dump and restore commands, they contain more options you can have a look at man page for both of them.
// 1. mongodump --db=test --archive=./test_1642055040452.gzip --gzip
// 2. mongorestore --archive=test_1642055040452.gzip --gzip

// 1. Cron expression for every 1 minutes - */1 * * * *
// 2. Cron expression for every night at 00:00 hours (0 0 * * * )

// Scheduling the backup every 1 minutes (using node-cron)
cron.schedule('*/1 * * * *', () => {
  backupMongoDB();
  // backupRemoteMongoDB();
});

function backupMongoDB() {
  DATE = Date.now();
  ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}_${DATE}.gzip`);
  const child = spawn('mongodump', [`--db=${DB_NAME}`, `--archive=${ARCHIVE_PATH}`, '--gzip']);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data);
  });
  child.stderr.on('data', (data) => {
    console.log('stderr:\n', Buffer.from(data).toString());
  });
  child.on('error', (error) => {
    console.log('error:\n', error);
  });
  child.on('exit', (code, signal) => {
    if (code) console.log('Process exit with code:', code);
    else if (signal) console.log('Process killed with signal:', signal);
    else console.log('Backup is successfull ✅');
  });
}

function backupRemoteMongoDB() {
  DATE = Date.now();
  ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}_${DATE}.gzip`);

  const URI = `mongodb://${USERNAME}:${PASSWORD}@${HOST}/?authSource=${AUTH_DB}`;
  const child = spawn('mongodump', [`--uri=${URI}`, `--db=${DB_NAME}`, `--archive=${ARCHIVE_PATH}`, '--gzip']);

  child.stdout.on('data', (data) => {
    console.log('stdout:\n', data);
  });
  child.stderr.on('data', (data) => {
    console.log('stderr:\n', Buffer.from(data).toString());
  });
  child.on('error', (error) => {
    console.log('error:\n', error);
  });
  child.on('exit', (code, signal) => {
    if (code) console.log('Process exit with code:', code);
    else if (signal) console.log('Process killed with signal:', signal);
    else console.log('Backup is successfull for Remote DB ✅');
  });
}

const { spawn } = require('child_process');
const path = require('path');
const cron = require('node-cron');

const DB_NAME = 'test';
const ARCHIVE_PATH = path.join(__dirname, 'public', `${DB_NAME}.gzip`);

// 1. Cron expression for every 5 seconds - */5 * * * * *
// 2. Cron expression for every night at 00:00 hours (0 0 * * * )
// Note: 2nd expression only contains 5 fields, since seconds is not necessary

// Scheduling the backup every 5 seconds (using node-cron)
cron.schedule('*/5 * * * * *', () => backupMongoDB());

function backupMongoDB() {
  const child = spawn('mongodump', [
    `--db=${DB_NAME}`,
    `--archive=${ARCHIVE_PATH}`,
    '--gzip'
  ]);

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

const { spawnService, killService } = require('./dist-electron/main.cjs'); // wait, we can't import this directly easily if it's bundled.

// Let's just write a plain node script
const { spawn } = require('child_process');
const path = require('path');

const command = path.join(__dirname, 'runtime', 'apache', 'bin', 'httpd');
const commandArgs = ['-D', 'FOREGROUND', '-f', path.join(__dirname, 'config', 'apache', 'httpd.conf')];

console.log('Spawning apache...');
const child = spawn(command, commandArgs, {
  cwd: __dirname,
  detached: false
});

child.stdout.on('data', d => console.log('stdout:', d.toString()));
child.stderr.on('data', d => console.log('stderr:', d.toString()));

child.on('close', code => console.log('Apache closed with code:', code));

setTimeout(() => {
  console.log('Killing apache...');
  child.kill('SIGTERM');
  console.log('Kill signal sent');
  setTimeout(() => {
    console.log('Exiting test');
    process.exit(0);
  }, 2000);
}, 3000);

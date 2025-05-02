// This script runs the production build with required environment variables
const { spawn } = require('child_process');
const path = require('path');

// Set all required environment variables
process.env.NEXTAUTH_SECRET = 'a_very_long_secret_value_for_nextauth';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.AUTH_TRUST_HOST = 'true';

// Log the server start
console.log('Starting production server with environment variables:');
console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('- AUTH_TRUST_HOST:', process.env.AUTH_TRUST_HOST);

// Path to the standalone server.js
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

// Spawn the server process with the environment variables
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

// Handle process exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
}); 
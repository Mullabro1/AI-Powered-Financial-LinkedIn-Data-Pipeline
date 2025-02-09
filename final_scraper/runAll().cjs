// runAll.js
const execSync = require('child_process').execSync;

// Define the reference value (can be passed dynamically as a command-line argument)
const referenceValue = process.argv[2]; // Reference value is the second argument passed when running the script

if (!referenceValue) {
  console.log('Please provide a reference value as a command-line argument.');
  process.exit(1);  // Exit if no reference value is provided
}

console.log('Starting execution of all scripts...');


// Execute dead.js
console.log('Executing dead.js...');
execSync('node dead.js', { stdio: 'inherit' });

// Pass the reference value to ref.js
console.log('Executing ref.js...');
execSync(`node ref.js "${referenceValue}"`, { stdio: 'inherit' });



// Execute clean.js
console.log('Executing clean.js...');
execSync('node clean.cjs', { stdio: 'inherit' });

console.log('All scripts executed.');

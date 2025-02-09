import express from 'express';
import { exec } from 'child_process';  // Required to execute commands in the terminal

const app = express();
const port = 1235;

// Serve the HTML page with buttons (no logic here for redirection)
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Real-Time Scraping Progress</title>
      </head>
      <body>
        <h2>Monitor Scraping Progress</h2>
        
        <!-- Button to trigger redirection to port 3200 -->
        <button onclick="runCommand('link')">csv uploader</button>
        
        <!-- Button to trigger redirection to port 4500 -->
        <button onclick="runCommand('main')">linkedin scraper</button>
        
        <!-- Button to run Write Script on current server (Port 1235) -->
        <button onclick="runCommand('write')">db insert</button>
        
        <!-- Button to trigger redirection to port 6500 -->
        <button onclick="runCommand('read')">read db</button>
        <div id="output"></div>

        <script>
          async function runCommand(scriptType) {
            try {
              if (scriptType === 'link') {
                // Redirect to port 3200
                window.location.href = 'http://localhost:3200';
              } else if (scriptType === 'main') {
                // Redirect to port 4500
                window.location.href = 'http://localhost:4500';
              } else if (scriptType === 'write') {
                // Call server to run Write Script (write.js)
                const response = await fetch('/run-command?script=write');
                const data = await response.json();
                
                // Show result in the output div
                document.getElementById('output').innerHTML = data.message;
              }
              else if (scriptType === 'read') {
                // Redirect to port 6500
                window.location.href = 'http://localhost:6500';
              }
            } catch (error) {
              console.error('Error executing command:', error);
              document.getElementById('output').innerHTML = 'Error running the command.';
            }
          }
        </script>
      </body>
    </html>
  `);
});

// API route to run CLI commands (this is only for the Write Script)
app.get('/run-command', (req, res) => {
  const { script } = req.query;
  let command = '';

  // Only handle 'write' case here, other redirects happen on the client side
  if (script === 'write') {
    command = 'cd .. && node write.js'; // Assuming write.js is one directory above

    // Execute the write.js script
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
      }
      if (stderr) {
        return res.status(500).json({ message: `stderr: ${stderr}` });
      }
      // Return the output of the executed command
      return res.json({ message: stdout });
    });
    return; // End here after executing the write script
  }

  return res.status(400).json({ message: 'Invalid script type' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

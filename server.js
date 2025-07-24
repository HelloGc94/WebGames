const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

let userCount = 0;
const seenVisitors = new Set();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Set up write stream to file
const logFile = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });

// ✅ Override console.log and console.error
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  logFile.write(`[LOG] ${new Date().toISOString()} ${message}\n`);
  originalLog(...args);
};

console.error = (...args) => {
  const message = args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ');
  logFile.write(`[ERROR] ${new Date().toISOString()} ${message}\n`);
  originalError(...args);
};

app.post('/log-visit', express.json(), (req, res) => {
  console.log("Visitor log:", req.body);
  res.sendStatus(200);
});

// ✅ /log-error route
app.post('/log-error', (req, res) => {
  console.error('Client error:', req.body);
  res.sendStatus(200);
});

// ✅ /collect route
app.post('/collect', (req, res) => {
  const { visitorId, timestamp, sessionDuration, ...rest } = req.body;

  if (!seenVisitors.has(visitorId)) {
    seenVisitors.add(visitorId);
    userCount++;

    console.log(`New Visitor ID: ${visitorId}`);
    console.log('User Count:', userCount);
    console.log('Received user data:', {
      timestamp,
      ...rest
    });
  } else {
    console.log(`Returning Visitor ID: ${visitorId}`);
    console.log({ timestamp, sessionDuration });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

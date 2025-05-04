const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'client/src/components/setup-sheet/DailyView.tsx');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Replace all console statements with more robust regex that handles multiline statements
  let result = data;

  // Handle console.log statements
  result = result.replace(/console\.log\([\s\S]*?\);/g, '');

  // Handle console.warn statements
  result = result.replace(/console\.warn\([\s\S]*?\);/g, '');

  // Handle console.error statements
  result = result.replace(/console\.error\([\s\S]*?\);/g, '');

  // Write the result back to the file
  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('All console statements removed from DailyView.tsx');
  });
});

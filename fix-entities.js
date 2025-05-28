#!/usr/bin/env node
// fix-entities.js - Script to fix unescaped entities in React files

const fs = require('fs');
const path = require('path');

// List of files to process
const files = [
  'src/app/about/page.tsx',
  'src/app/community-guidelines/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/donate/page.tsx',
  'src/app/how-it-works/page.tsx',
  'src/app/privacy/page.tsx',
  'src/app/terms/page.tsx'
];

// Function to replace unescaped entities
function fixEntities(content) {
  return content
    .replace(/(\s)'(\s|[A-Za-z])/g, '$1&apos;$2') // Fix single quotes with spaces/letters after
    .replace(/([A-Za-z])'(\s|[A-Za-z,.])/g, '$1&apos;$2') // Fix single quotes in the middle of words
    .replace(/(\s)"(\s|[A-Za-z])/g, '$1&quot;$2') // Fix double quotes with spaces/letters after
    .replace(/([A-Za-z])"(\s|[A-Za-z])/g, '$1&quot;$2'); // Fix double quotes in the middle of words
}

// Process each file
files.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  // Read the file
  fs.readFile(fullPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }
    
    // Fix the content
    const fixedContent = fixEntities(data);
    
    // Write the fixed content back to the file
    fs.writeFile(fullPath, fixedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${filePath}:`, err);
        return;
      }
      
      console.log(`Fixed entities in ${filePath}`);
    });
  });
});

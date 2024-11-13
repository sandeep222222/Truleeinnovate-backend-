// db.js

const sqlite3 = require('sqlite3').verbose();

// Initialize a new database
const db = new sqlite3.Database('./candidate_management.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create the candidates table if it does not exist
    db.run(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
        experience INTEGER,
        skills TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  }
});

module.exports = db;

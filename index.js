const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());

// Add a new candidate
// Add multiple candidates
app.post('/candidates', (req, res) => {
  const candidates = req.body;

  // Start transaction for multiple inserts
  const sql = `INSERT INTO candidates (name, phone, email, gender, experience, skills) VALUES (?, ?, ?, ?, ?, ?)`;

  const insertPromises = candidates.map(candidate => {
    const skillsString = Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills;
    
    return new Promise((resolve, reject) => {
      db.run(sql, [candidate.name, candidate.phone, candidate.email, candidate.gender, candidate.experience, skillsString], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  });

  // Execute all insertions
  Promise.all(insertPromises)
    .then((insertedIds) => {
      res.status(201).json({
        message: `${insertedIds.length} candidates added successfully`,
        candidateIds: insertedIds
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});


// Get all candidates with pagination
app.get('/candidates', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const sql = `SELECT * FROM candidates LIMIT ? OFFSET ?`;

  db.all(sql, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Search candidates by name, phone, or email
app.get('/candidates/search', (req, res) => {
  const { query } = req.query;
  const sql = `SELECT * FROM candidates WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;

  db.all(sql, [`%${query}%`, `%${query}%`, `%${query}%`], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Filter candidates by gender, experience, or skills
app.get('/candidates/filter', (req, res) => {
  const { gender, experience, skills } = req.query;
  let sql = 'SELECT * FROM candidates WHERE 1=1';
  const params = [];

  if (gender) {
    sql += ' AND gender = ?';
    params.push(gender);
  }

  if (experience) {
    sql += ' AND experience = ?';
    params.push(parseInt(experience));
  }

  if (skills) {
    const skillList = skills.split(',').map(skill => `%${skill.trim()}%`);
    sql += ' AND (' + skillList.map(() => 'skills LIKE ?').join(' OR ') + ')';
    params.push(...skillList);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

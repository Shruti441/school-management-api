const db = require('../config/db');

// ADD SCHOOL
exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validation
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error('Error inserting school:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'School added successfully', id: result.insertId });
  });
};

// LIST SCHOOLS SORTED BY DISTANCE
exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLong = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLong)) {
    return res.status(400).json({ message: 'Valid latitude and longitude are required' });
  }

  const query = `
    SELECT *, 
    (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) 
    + sin(radians(?)) * sin(radians(latitude)))) AS distance 
    FROM schools 
    ORDER BY distance ASC
  `;

  db.query(query, [userLat, userLong, userLat], (err, results) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ schools: results });
  });
};

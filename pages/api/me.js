const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const jwt = require('jsonwebtoken');
const jwtSecret = 'SUPERSECRETE20220';  // Same secret key used for signing the JWT token
const url = 'your-mongodb-atlas-connection-string'; // Update with your MongoDB Atlas connection string
const dbName = 'simple-login-db';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function findUserById(db, userId, callback) {
  const collection = db.collection('user');
  collection.findOne({userId}, callback);
}

export default (req, res) => {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({error: true, message: 'Token is required'});
    }

    // Verify the JWT token
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        return res.status(401).json({error: true, message: 'Invalid or expired token'});
      }

      const userId = decoded.userId;

      client.connect(function(err) {
        assert.equal(null, err);
        console.log('Connected to MongoDB server =>');
        const db = client.db(dbName);

        // Fetch user information from DB using userId
        findUserById(db, userId, function(err, user) {
          if (err) {
            res.status(500).json({error: true, message: 'Error retrieving user information'});
            return;
          }

          if (!user) {
            res.status(404).json({error: true, message: 'User not found'});
            return;
          }

          res.status(200).json({
            email: user.email,  // Returning user email as example
          });
        });
      });
    });
  } else {
    // Handle any other HTTP method
    res.statusCode = 401;
    res.end();
  }
};

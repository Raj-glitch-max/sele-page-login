import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import assert from 'assert';

const jwtSecret = 'SUPERSECRETE20220';
const saltRounds = 10;
const url = 'mongodb+srv://raj-p:898rdp1242@deepfake-detection.hza0bt7.mongodb.net/?retryWrites=true&w=majority&appName=deepfake-detection'; // Use MongoDB Atlas URL if deploying to the cloud
const dbName = 'simple-login-db';

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function findUser(db, email) {
  const collection = db.collection('user');
  return collection.findOne({ email });
}

async function authUser(db, email, password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match;
}

export default async (req, res) => {
  if (req.method === 'POST') {
    // login
    try {
      assert.notEqual(null, req.body.email, 'Email required');
      assert.notEqual(null, req.body.password, 'Password required');
    } catch (bodyError) {
      return res.status(403).send(bodyError.message);
    }

    try {
      await client.connect();
      console.log('Connected to MongoDB server');
      const db = client.db(dbName);
      const { email, password } = req.body;

      const user = await findUser(db, email);
      if (!user) {
        return res.status(404).json({ error: true, message: 'User not found' });
      }

      const match = await authUser(db, email, password, user.password);
      if (match) {
        const token = jwt.sign(
          { userId: user.userId, email: user.email },
          jwtSecret,
          { expiresIn: '1h' } // Token expiry time
        );
        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: true, message: 'Auth Failed' });
      }
    } catch (err) {
      res.status(500).json({ error: true, message: 'Server Error' });
    } finally {
      await client.close();
    }
  } else {
    res.status(401).end(); // Handle any other HTTP method
  }
};

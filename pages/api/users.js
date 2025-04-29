import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import assert from 'assert';

const url = 'mongodb+srv://raj-p:898rdp1242@deepfake-detection.hza0bt7.mongodb.net/?retryWrites=true&w=majority&appName=deepfake-detection';
const dbName = 'simple-login-db';
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      assert(req.body.email, 'Email is required');
      assert(req.body.password, 'Password is required');

      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection('user');

      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: true, message: 'User already exists' });
      }

      await collection.insertOne({ email, password: hashedPassword });
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Signup API Error:', error); // Log full error
      res.status(500).json({ error: true, message: 'Server error', details: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};

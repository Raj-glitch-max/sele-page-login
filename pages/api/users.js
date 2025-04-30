import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import assert from 'assert';

const dbName = 'simple-login-db';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method Not Allowed' });
  }

  try {
    assert(req.body.email, 'Email is required');
    assert(req.body.password, 'Password is required');

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection('user');

    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: true, message: 'User already exists' });
    }

    await collection.insertOne({ email, password: hashedPassword });
    return res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('Signup Error:', error.message);
    return res.status(500).json({ error: true, message: 'Server Error', details: error.message });
  }
}

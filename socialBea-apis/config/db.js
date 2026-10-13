const mongoose = require('mongoose');

// Cache the database connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  // If we don't have a cached promise, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (!process.env.MONGODB_URI) {
      throw new Error('Please define MONGODB_URI environment variable');
    }

    console.log('Creating new database connection...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then(async (mongooseInstance) => {
      console.log('MongoDB connected successfully');
      try {
        const postsCollection = mongooseInstance.connection.collection('posts');
        const indexes = await postsCollection.indexes();
        for (const idx of indexes) {
          if (
            idx.name === 'comments.replies.replyID_1' ||
            idx.name === 'comments.commentID_1'
          ) {
            console.log(`Dropping problematic subdocument unique index: ${idx.name}`);
            await postsCollection.dropIndex(idx.name);
            console.log(`Successfully dropped index: ${idx.name}`);
          }
        }
      } catch (idxErr) {
        // Ignore if collection not yet created or already dropped
      }
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
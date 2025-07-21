const redis = require('redis');

const redisClient = redis.createClient({
  username: 'default',
  password: process.env.REDIS_PW,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  }
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
};

connectRedis();

module.exports = redisClient;
const { createClient } = require('redis')

const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    reconnectStrategy: (retries) => {
      if (retries > 10) return new Error('Redis reconnect failed')
      return Math.min(retries * 100, 3000)
    }
  }
})

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message))
redisClient.on('ready', () => console.log('Redis ready'))
redisClient.on('end', () => console.warn('Redis connection closed'))

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect()
  }
}

module.exports = redisClient
module.exports.connectRedis = connectRedis
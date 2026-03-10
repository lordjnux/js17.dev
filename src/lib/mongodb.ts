import { MongoClient, Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI ?? ""
const DB_NAME = "js17dev"

// In development, cache the client on the global object to survive HMR reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
}

function getClient(): MongoClient {
  if (!MONGODB_URI) throw new Error("MONGODB_URI env var is not set")

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(MONGODB_URI)
    }
    return global._mongoClient
  }

  // Production: module-level singleton
  if (!(global as { _mongoClient?: MongoClient })._mongoClient) {
    ;(global as { _mongoClient?: MongoClient })._mongoClient = new MongoClient(MONGODB_URI)
  }
  return (global as { _mongoClient?: MongoClient })._mongoClient!
}

export async function getDb(): Promise<Db> {
  const client = getClient()
  // connect() is idempotent — safe to call on every request
  await client.connect()
  return client.db(DB_NAME)
}

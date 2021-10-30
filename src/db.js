const { MongoClient } = require('mongodb')

const COLLECTION_NAME = process.env.DATABASE_COLLECTION_NAME

const client = new MongoClient(
  process.env.DATABASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true }
)

async function fetch (agencyName) {
  try {
    await client.connect()

    const db = client.db(process.env.DATABASE_NAME)
    const col = db.collection(COLLECTION_NAME)

    const documentCursor = col.find(
      { agencyName: agencyName },
      { projection: { propertyUrl: 1 } }
    )
    const properties = await documentCursor.toArray()

    return properties.map(property => property.propertyUrl)
  } catch (err) {
    console.log(err.stack)
  } finally {
    await client.close()
  }
}

async function store (agencyName, externalReferences) {
  try {
    await client.connect()

    const db = client.db(process.env.DATABASE_NAME)
    const col = db.collection(COLLECTION_NAME)

    const properties = externalReferences.map(externalReference => ({
      agencyName: agencyName,
      propertyUrl: externalReference
    }))

    const result = await col.insertMany(properties)
    console.log(`Successfully inserted ${result.insertedCount} items!`)

    return result
  } catch (err) {
    console.log(err.stack)
  } finally {
    await client.close()
  }
}

module.exports = {
  fetch: fetch,
  store: store
}

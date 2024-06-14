import { createId } from "@paralleldrive/cuid2";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

export const createClient = async (url: string) => {
  const client = new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();

  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });

  console.log("Pinged your deployment. You successfully connected to MongoDB!");

  return client;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

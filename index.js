const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("itznur07");

    // Collections

    const contactsCollection = db.collection("contacts");

    // ============================================

    // POST - Create a new contact
    app.post("/api/contacts", async (req, res) => {
      const { name, email, subject, message } = req.body;
      try {
        const result = await contactsCollection.insertOne({
          name,
          email,
          subject,
          message,
        });
        res.status(201).json(result.ops[0]);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // GET - Retrieve all contacts
    app.get("/api/contacts", async (req, res) => {
      try {
        const contacts = await contactsCollection.find().toArray();
        res.status(200).json(contacts);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // PUT - Update a contact
    app.put("/api/contacts/:id", async (req, res) => {
      const { id } = req.params;
      const { name, email, subject, message } = req.body;
      try {
        const result = await contactsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { name, email, subject, message } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.status(200).json({ message: "Contact updated successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // DELETE - Remove a contact
    app.delete("/api/contacts/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const result = await contactsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.status(200).json({ message: "Contact deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // ==============================================================

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});

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
    const blogsCollection = db.collection("blogs");

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
        res.status(201).json(result);
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

    // Create blog post endpoint
    app.post("/api/blogs", async (req, res) => {
      try {
        const { title, link, tag, cover, message } = req.body;

        const newBlog = new blogsCollection({
          title,
          link,
          tag,
          cover,
          message,
        });
        await newBlog.save();

        res.status(201).json({ insertedId: newBlog._id });
      } catch (error) {
        res.status(500).json({ error: "Failed to create blog post" });
      }
    });

    // Retrieve all blog posts endpoint
    app.get("/api/blogs", async (req, res) => {
      try {
        const blogs = await blogsCollection.find();
        res.status(200).json(blogs);
      } catch (error) {
        res.status(500).json({ error: "Failed to retrieve blog posts" });
      }
    });

    // Remove a blog post by ID endpoint
    app.delete("/api/blogs/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const deletedBlog = await blogsCollection.findByIdAndDelete(id);

        if (!deletedBlog) {
          return res.status(404).json({ error: "Blog post not found" });
        }

        res.status(200).json({ message: "Blog post deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete blog post" });
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

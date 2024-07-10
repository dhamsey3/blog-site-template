// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

// Initial content for home, about, and contact pages
const homeStartingContent = "Welcome to VersesVibez, a haven for poetry enthusiasts. Here, words flow freely and emotions are woven into every verse. Explore the beauty of language and the power of expression through our collection of poems. Whether you're a poet looking to share your work or a reader seeking inspiration, VersesVibez is your sanctuary. Dive into the world of poetry and let your soul be moved by the artistry of words.";
const aboutContent = "VersesVibez was born from a love of poetry and a desire to create a space where poets and poetry lovers can connect. Our mission is to celebrate the art of poetry by providing a platform for sharing, reading, and appreciating poems from around the world. At VersesVibez, we believe in the transformative power of poetry to heal, inspire, and bring people together. Join us in our journey to explore the depths of human emotion and creativity through the timeless art of poetry.";
const contactContent = "We'd love to hear from you! Whether you have a question, a suggestion, or just want to share your love for poetry, feel free to reach out. You can email us at versesvibes@gmail.com or connect with us on social media. Let's keep the conversation about poetry alive and vibrant. Your feedback and contributions are what make VersesVibez a thriving community. Thank you for being a part of our poetic journey.";

// Initialize Express app
const app = express();

// Set view engine to EJS for templating
app.set('view engine', 'ejs');

// Use body-parser to handle URL encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Connect to MongoDB using Mongoose
mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema for blog posts
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  imagePath: String
});

// Create a Mongoose model for blog posts
const Post = mongoose.model("Post", postSchema);

// Define the schema for contact messages
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

// Create a Mongoose model for contact messages
const Contact = mongoose.model("Contact", contactSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route for home page
app.get("/", function(req, res) {
  Post.find({}, function(err, posts) {
    res.render("home", { homeContent: homeStartingContent, posts: posts });
  });
});

// Route for compose page
app.get("/compose", function(req, res) {
  res.render("compose");
});

// Handle form submission from compose page
app.post("/compose", upload.single("postImage"), function(req, res) {
  const postTitle = req.body.postTitle;
  const postContent = req.body.postBody;
  const postImage = req.file ? "/uploads/" + req.file.filename : null;

  const newPost = new Post({
    title: postTitle,
    content: postContent,
    imagePath: postImage
  });

  newPost.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

// Route for about page
app.get("/about", function(req, res) {
  res.render("about", { aboutContent: aboutContent });
});

// Route for contact page
app.get("/contact", function(req, res) {
  res.render("contact", { contactContent: contactContent });
});

// Handle contact form submission
app.post("/submit-contact", function(req, res) {
  const newContact = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  newContact.save(function(err) {
    if (!err) {
      res.render("contact", { 
        contactContent: contactContent,
        successMessage: "Thank you for your message. We'll get back to you soon!"
      });
    } else {
      res.render("contact", { 
        contactContent: contactContent,
        errorMessage: "There was an error submitting your message. Please try again."
      });
    }
  });
});

// Route for individual post pages
app.get("/posts/:postId", function(req, res) {
  const reqPostId = req.params.postId;

  Post.findOne({ _id: reqPostId }, function(err, post) {
    res.render("post", { postTitle: post.title, postContent: post.content, postImage: post.imagePath });
  });
});

// Start the server on port 3000
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
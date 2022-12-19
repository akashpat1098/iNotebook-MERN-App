const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/NotesSchema");
const { body, validationResult } = require("express-validator");

// Notes 1 :Get all the notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error occur");
  }
});
//Note 2 : Create a new Note
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      // Taking values from body
      const { title, description, tag } = req.body;
      //Check error
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Save new notes
      const note = new Notes({ title, description, tag, user: req.user.id });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (e) {
      console.error(e.message);
      res.status(500).send("Internal server error occur");
    }
  }
);

//Note 3 : Update a  Note
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    // Taking values from body
    const { title, description, tag } = req.body;

    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // Find the note to be updated
    let note = await Notes.findById(req.params.id);
    // checking the node exits or not

    if (!note) {
      return res.status(404).send("Not Found");
    }
    // Checking that valid user is updating the notes
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error occur");
  }
});

//Note 4 : Delete a  Note
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted 
    let note =await  Notes.findById(req.params.id);
      // checking the node exits or not
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // Checking that valid user is deleteing the notes
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // Deleting th node
    note = await Notes.findByIdAndDelete(
      req.params.id);
    res.json({ "Sucess":"Note has been deleted successfully" });  
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Internal server error occur");
  }
});

module.exports = router;

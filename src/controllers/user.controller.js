const User = require("../models/user.model.js");

// Create and Save a new User
exports.create = (req, res) => {
   // Validate request
   if (!req.body) {
      res.status(400).send({
         message: "Content can not be empty!",
      });
   }

   // Create a User
   const user = new User({
      title: req.body.title,
      description: req.body.description,
      published: req.body.published || false,
   });

   // Save User in the database
   User.create(user, (err, data) => {
      if (err)
         res.status(500).send({
            message:
               err.message || "Some error occurred while creating the User.",
         });
      else res.send(data);
   });
};

// Retrieve all Users from the database (with condition).
exports.findAll = (req, res) => {
   const title = req.query.title;

   User.getAll(title, (err, data) => {
      if (err)
         res.status(500).send({
            message:
               err.message || "Some error occurred while retrieving users.",
         });
      else res.send(data);
   });
};

// Find a single User by Id
exports.findOne = (req, res) => {
   User.findById(req.params.id, (err, data) => {
      if (err) {
         if (err.kind === "not_found") {
            res.status(404).send({
               message: `Not found User with id ${req.params.id}.`,
            });
         } else {
            res.status(500).send({
               message: "Error retrieving User with id " + req.params.id,
            });
         }
      } else res.send(data);
   });
};

// find all published Users
exports.findAllPublished = (req, res) => {
   User.getAllPublished((err, data) => {
      if (err)
         res.status(500).send({
            message:
               err.message || "Some error occurred while retrieving users.",
         });
      else res.send(data);
   });
};

// Update a User identified by the id in the request
exports.update = (req, res) => {
   // Validate Request
   if (!req.body) {
      res.status(400).send({
         message: "Content can not be empty!",
      });
   }

   User.updateById(req.params.id, new User(req.body), (err, data) => {
      if (err) {
         if (err.kind === "not_found") {
            res.status(404).send({
               message: `Not found User with id ${req.params.id}.`,
            });
         } else {
            res.status(500).send({
               message: "Error updating User with id " + req.params.id,
            });
         }
      } else res.send(data);
   });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
   User.remove(req.params.id, (err, data) => {
      if (err) {
         if (err.kind === "not_found") {
            res.status(404).send({
               message: `Not found User with id ${req.params.id}.`,
            });
         } else {
            res.status(500).send({
               message: "Could not delete User with id " + req.params.id,
            });
         }
      } else res.send({ message: `User was deleted successfully!` });
   });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
   User.removeAll((err, data) => {
      if (err)
         res.status(500).send({
            message:
               err.message || "Some error occurred while removing all users.",
         });
      else res.send({ message: `All Users were deleted successfully!` });
   });
};

exports.generateOTP = (req, res) => {
   const { email } = req.body;
   User.generateOTP(email, (err, data) => {
      if (err) {
         res.status(500).json({ message: err.message });
      } else {
         res.json({ message: "OTP sent successfully", data });
      }
   });
};

exports.verifyOTP = (req, res) => {
   const { email, otp } = req.body;
   User.verifyOTP(email, otp, (err, result) => {
      if (err) {
         res.status(401).json({ message: err.message });
      } else {
         res.json({ message: result });
      }
   });
};

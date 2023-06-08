const sql = require("./db.js");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");

// constructor
const User = function (user) {
   this.title = user.title;
   this.description = user.description;
   this.published = user.published;
};

const transporter = nodemailer.createTransport({
   service: "Gmail",
   auth: {
      user: "rparthiban1612@gmail.com", // Replace with your email
      pass: "gczkwbncxswszvzq", // Replace with your password
   },
});

const users = {};

User.generateOTP = (email, callback) => {
   // Check if the user exists in the database
   const checkUserQuery = "SELECT * FROM users WHERE email = ?";
   sql.query(checkUserQuery, [email], (err, result) => {
      if (err) {
         console.error("Failed to execute database query:", err);
         callback(err);
         return;
      }

      if (result.length === 0) {
         callback(new Error("User not found"));
         return;
      }

      const secret = speakeasy.generateSecret();
      const otp = speakeasy.totp({
         secret: secret.base32,
         encoding: "base32",
      });

      const mailOptions = {
         from: "rparthiban1612@gmail.com", // Replace with your email
         to: email,
         subject: "OTP Verification",
         text: `Your OTP is ${otp}`,
      };

      users[email] = {
         otp,
         secret: secret.base32,
         timeout: Date.now() + 2 * 60 * 1000,
      };

      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
            console.error(error);
            callback(error);
         } else {
            const data = {
               email,
               otp,
               secret: secret.base32,
               timeout: Date.now() + 2 * 60 * 1000, // Timeout of 2 minutes
            };
            callback(null, data);
         }
      });
   });
};

// Verify OTP for a user
User.verifyOTP = (email, otp, callback) => {
   const getUserQuery = "SELECT * FROM users WHERE email = ?";
   sql.query(getUserQuery, [email], (err, result) => {
      if (err) {
         console.error("Failed to execute database query:", err);
         callback(err);
         return;
      }
      if (result.length === 0) {
         callback(new Error("User not found"));
         return;
      }

      const secret = users[email]?.secret;

      const timeout = users[email]?.timeout;

      if (Date.now() > timeout) {
         callback(new Error("OTP expired"));
         return;
      }
      const isValid = speakeasy.totp.verify({
         secret,
         encoding: "base32",
         token: otp,
         window: 2,
      });

      if (isValid) {
         callback(null, "OTP verified successfully");
      } else {
         callback(new Error("Invalid OTP"));
      }
   });
};

User.create = (newUser, result) => {
   sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(err, null);
         return;
      }
      // console.log("created user: ", { id: res.insertId, ...newUser });
      result(null, { id: res.insertId, ...newUser });
   });
};

User.findById = (id, result) => {
   sql.query(`SELECT * FROM users WHERE id = ${id}`, (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(err, null);
         return;
      }

      if (res.length) {
         console.log("found user: ", res[0]);
         result(null, res[0]);
         return;
      }

      result({ kind: "not_found" }, null);
   });
};

User.getAll = (title, result) => {
   let query = "SELECT * FROM users";

   if (title) {
      query += ` WHERE title LIKE '%${title}%'`;
   }

   sql.query(query, (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(null, err);
         return;
      }

      console.log("users: ", res);
      result(null, res);
   });
};

User.getAllPublished = (result) => {
   sql.query("SELECT * FROM users", (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(null, err);
         return;
      }
      console.log("users: ", res);
      result(null, res);
   });
};

User.updateById = (id, user, result) => {
   sql.query(
      "UPDATE users SET title = ?, description = ?, published = ? WHERE id = ?",
      [user.title, user.description, user.published, id],
      (err, res) => {
         if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
         }

         if (res.affectedRows == 0) {
            // not found User with the id
            result({ kind: "not_found" }, null);
            return;
         }

         console.log("updated user: ", { id: id, ...user });
         result(null, { id: id, ...user });
      }
   );
};

User.remove = (id, result) => {
   sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(null, err);
         return;
      }

      if (res.affectedRows == 0) {
         // not found User with the id
         result({ kind: "not_found" }, null);
         return;
      }

      console.log("deleted user with id: ", id);
      result(null, res);
   });
};

User.removeAll = (result) => {
   sql.query("DELETE FROM users", (err, res) => {
      if (err) {
         console.log("error: ", err);
         result(null, err);
         return;
      }

      console.log(`deleted ${res.affectedRows} users`);
      result(null, res);
   });
};

module.exports = User;

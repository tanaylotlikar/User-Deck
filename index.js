const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodoverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodoverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "server",
  password: "tanay#2006",
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  let q = "SELECT*FROM info";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result;
      res.render("home.ejs", { data });
      // Close the connection after the query is completed
    });
  } catch (err) {
    console.log(err);
    res.send(`error in DB)${err}`);
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT*FROM info WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result;
      res.render("edit.ejs", { data });
    });
  } catch (err) {
    console.log(err);
    res.send(`error in DB)${err}`);
  } 
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { username: foruser, password: forpass } = req.body;

  let q = `SELECT*FROM info WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let data = result[0];
      console.log(data);
      let pass = result[0].password;
      if (forpass != pass) {
        res.send("wrong");
      } else {
        let q2 = `UPDATE info SET name = '${foruser}' where id = '${id}' `;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/");
          });
        } catch (err) {
          console.log(err);
          res.send(`error in DB)${err}`);
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send(`error in DB)${err}`);
  }
});

app.get("/user/add", (_, res) => {
  res.render("new.ejs");
});

app.post("/user/add", (req, res) => {
  let { username: adduser, password: addpass, email: addemail } = req.body;
  let q = `INSERT INTO info (id, name, email, password) VALUES('${uuidv4()}', "${adduser}", "${addemail}", "${addpass}")`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.send(`error in DB)${err}`);
  }

  console.log(req.body);
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  res.render("delete.ejs", { id });
});

app.post("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let { email: delemail, password: delpass } = req.body;
  let q = `SELECT*FROM info WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      if (delpass !== result[0].password ^ delemail !== result[0].email) {
        res.send("wrong");
      } else {
        let q2 = `DELETE FROM info where id = '${id}' `;
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.redirect("/");
          });

        } catch (err) {
          console.log(err);
          res.send(`error in DB)${err}`);
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send(`error in DB)${err}`);
  }
});
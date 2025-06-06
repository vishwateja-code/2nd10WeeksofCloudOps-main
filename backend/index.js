import express from "express";
import mysql from "mysql";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));

// Ensure required env vars are set
const {
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_PORT,
  APP_PORT = 3000, // fallback port
} = process.env;

if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_PORT) {
  throw new Error("Missing required DB environment variables.");
}

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  database: "test",
});

app.get("/", (req, res) => {
  res.json("hello");
});

app.get("/books", (req, res) => {
  const q = "SELECT * FROM books";
  db.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed." });
    }
    return res.json(data);
  });
});

app.post("/books", (req, res) => {
  const q = "INSERT INTO books(`title`, `desc`, `price`, `cover`) VALUES (?)";
  const values = [req.body.title, req.body.desc, req.body.price, req.body.cover];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Insert failed.");
    }
    return res.json(data);
  });
});

app.delete("/books/:id", (req, res) => {
  const q = "DELETE FROM books WHERE id = ?";
  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Delete failed.");
    }
    return res.json(data);
  });
});

app.put("/books/:id", (req, res) => {
  const q =
    "UPDATE books SET `title` = ?, `desc` = ?, `price` = ?, `cover` = ? WHERE id = ?";
  const values = [req.body.title, req.body.desc, req.body.price, req.body.cover];

  db.query(q, [...values, req.params.id], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Update failed.");
    }
    return res.json(data);
  });
});

app.listen(APP_PORT, () => {
  console.log(`Server running on port ${APP_PORT}`);
});

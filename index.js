const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");

var urlEncodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlEncodedParser);

app.use(express.static("public"));

// Path to JSON file
const dbPath = path.join(__dirname, "tasks.json");

// Helper function to read data from JSON file
const readTasks = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([])); // Initialize file if it doesn't exist
  }
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

// Helper function to write data to JSON file
const writeTasks = (tasks) => {
  fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));
};

app.get("/", function (req, res) {
  const tasks = readTasks();
  res.render("todo", { tasks: tasks });
});

app.post("/", function (req, res) {
  const tasks = readTasks();
  const newTask = {
    id: Date.now().toString(),
    title: req.body.title,
    description: req.body.description,
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;

  // Read the tasks from tasks.json
  fs.readFile("tasks.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading tasks.json:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const tasks = JSON.parse(data);

    // Pass the tasks and the id to the edit.ejs template
    res.render("edit", { tasks: tasks, id: id });
  });
});

app.post("/edit/:id", function (req, res) {
  const id = req.params.id;

  fs.readFile("tasks.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading tasks");
    } else {
      const tasks = JSON.parse(data);
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          id: id, // Keep the same ID
          title: req.body.title,
          description: req.body.description
        };
        fs.writeFile("tasks.json", JSON.stringify(tasks, null, 2), err => {
          if (err) {
            console.error(err);
            res.status(500).send("Error saving task");
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.status(404).send("Task not found");
      }
    }
  });
});

app.get("/delete/:id", function (req, res) {
  const id = req.params.id;

  fs.readFile("tasks.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading tasks");
    } else {
      const tasks = JSON.parse(data);
      const updatedTasks = tasks.filter(task => task.id !== id);

      fs.writeFile("tasks.json", JSON.stringify(updatedTasks, null, 2), err => {
        if (err) {
          console.error(err);
          res.status(500).send("Error deleting task");
        } else {
          res.redirect("/");
        }
      });
    }
  });
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port 3000");
});

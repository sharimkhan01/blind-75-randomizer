// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// const PORT = 3000;
// const filePath = 'records.json';

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Ensure file exists
// function loadData() {
//   if (!fs.existsSync(filePath)) {
//     fs.writeFileSync(filePath, JSON.stringify({ questions: [] }, null, 2));
//   }
//   const content = fs.readFileSync(filePath, 'utf8');
//   try {
//     return JSON.parse(content || '{ "questions": [] }');
//   } catch {
//     return { questions: [] };
//   }
// }

// function saveData(data) {
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
// }

// app.get('/questions', (req, res) => {
//   const data = loadData();
//   res.json(data.questions);
// });

// app.post('/randomize', (req, res) => {
//   const data = loadData();
//   const used = new Set(data.questions.map(q => q.number));
//   if (used.size >= 75) return res.status(400).json({ message: 'All used' });

//   let num;
//   do {
//     num = Math.floor(Math.random() * 75) + 1;
//   } while (used.has(num));

//   const entry = { number: num, status: false, question: "", note: "" };
//   data.questions.push(entry);
//   saveData(data);
//   res.json(entry);
// });

// app.post('/complete', (req, res) => {
//   const { number } = req.body;
//   const data = loadData();
//   const item = data.questions.find(q => q.number === number);
//   if (!item) return res.status(404).json({ message: "Not found" });
//   item.status = true;
//   saveData(data);
//   res.json({ message: "Completed", item });
// });

// app.post('/question', (req, res) => {
//   const { number, question } = req.body;
//   const data = loadData();
//   const item = data.questions.find(q => q.number === number);
//   if (!item || item.question) return res.status(400).json({ message: "Cannot update" });
//   item.question = question;
//   saveData(data);
//   res.json(item);
// });

// app.post('/note', (req, res) => {
//   const { number, note } = req.body;
//   const data = loadData();
//   const item = data.questions.find(q => q.number === number);
//   if (!item) return res.status(404).json({ message: "Not found" });
//   item.note = note;
//   saveData(data);
//   res.json(item);
// });

// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = 'records.json';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load data with fallback
function loadData() {
  if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, 'utf8').trim() === '') {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ questions: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save data
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all questions
app.get('/questions', (req, res) => {
  const data = loadData();
  res.json(data.questions);
});

// Generate random number
app.post('/randomize', (req, res) => {
  const data = loadData();
  const usedNumbers = new Set(data.questions.map(q => q.number));

  if (usedNumbers.size >= 75) return res.status(400).json({ message: "All numbers used." });

  let num;
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (usedNumbers.has(num));

  const newEntry = { number: num, status: false, name: "", note: "" };
  data.questions.push(newEntry);
  saveData(data);

  res.json(newEntry);
});

// Mark as completed
app.post('/complete', (req, res) => {
  const { number } = req.body;
  const data = loadData();

  const question = data.questions.find(q => q.number === number);
  if (!question) return res.status(404).json({ message: "Number not found" });

  question.status = true;
  saveData(data);
  res.json({ message: "Marked as completed" });
});

// Add question name (only once)
app.post('/add-name', (req, res) => {
  const { number, name } = req.body;
  const data = loadData();

  const question = data.questions.find(q => q.number === number);
  if (!question) return res.status(404).json({ message: "Number not found" });

  if (question.name) return res.status(400).json({ message: "Name already set" });

  question.name = name;
  saveData(data);
  res.json({ message: "Name added" });
});

// Save or update note
app.post('/note', (req, res) => {
  const { number, note } = req.body;
  const data = loadData();

  const question = data.questions.find(q => q.number === number);
  if (!question) return res.status(404).json({ message: "Number not found" });

  question.note = note;
  saveData(data);
  res.json({ message: "Note saved" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

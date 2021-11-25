const express = require("express");
const PORT = process.env.PORT || 3001;
const path = require('path');
const app = express();

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
var __dirname = "/Users/auchie/Projects/my-app/"


var Datastore = require('nedb')
    , todos_db = new Datastore({ filename: 'todos', autoload: true });

var Datastore = require('nedb')
    , archived_db = new Datastore({ filename: 'archived', autoload: true });


app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/todo", (req, res) => {

    todos_db.find({}, function (err, docs) {

        const todos = docs.map((doc) => doc.body).filter((body) => body !== undefined);

        archived_db.find({}, function (err, docs) {
            const archived_todos = docs.map((doc) => doc.body).filter((body) => body !== undefined);
            res.json({ todos: todos, archived: archived_todos })
        })
    });
});

app.post("/todo/archive", jsonParser, (req, res) => {
    const todos = req.body;

    todos.forEach(todo => {
        archived_db.insert({ body: todo, created_at: new Date() });
        todos_db.update({ body: todo }, {}, {}, function (err, numReplaced) { });
    })

    res.json({ "ok": `${todos.length} todo(s) archived` });
})

app.post("/todo/unarchive", jsonParser, (req, res) => {
    const todos = req.body;

    todos.forEach(todo => {
        todos_db.insert({ body: todo, created_at: new Date() });
        archived_db.update({ body: todo }, {}, {}, function (err, numReplaced) { });
    })

    res.json({ "ok": `${todos.length} todo(s) unarchived` });
})

app.post("/todo/add", jsonParser, (req, res) => {

    const todos = req.body;

    todos.forEach(todo => {
        todos_db.insert({ body: todo, created_at: new Date() });
    });

    res.json({ "ok": `${todos.length} todo(s) added` });
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
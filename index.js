const fs = require('fs').promises;
const fileSystem = require('fs');
const express = require("express");
const cors = require("cors");
const _ = require("lodash");
const { json } = require('body-parser');
const uuid = require('uuid').v4;
const path = require('path');

const app = express();

app.use(express.json());

app.get("/outfit", (req, res) => {
    const tees = ["Black", "White", "Grey", "Navy Blue"];
    const jeans = ["Black", "Dark Grey", "Grey", "Dark Blue"];
    const shoes = ["Black", "Grey", "White"];
    res.json({
        't-shirt': _.sample(tees),
        'jeans': _.sample(jeans),
        'shoe': _.sample(shoes)
    });
});

app.get("/get-comment/:commentId", async (req, res) => {
    const commentId = req.params.commentId;
    let content;

    try {
        content = await fs.readFile(`data/comments/${commentId}.json`, "utf-8");

    } catch (err) {
        return res.status(404).json({
            'Error': commentId + ' Not Found'
        })
    }

    res.send(JSON.parse(content));
});

app.post("/post-comment", async (req, res) => {
    const id = uuid();
    const comment = req.body.comment;

    if (!comment) {
        return res.sendStatus(400);
    }

    var jsonData =
        '{"commentId": "' + id + '","comment": "' + comment + '","createdDateTime": "' + new Date().toISOString() + '"}';

    var fileContent = JSON.stringify(JSON.parse(jsonData));

    await fs.mkdir("data/comments", { recursive: true });
    await fs.writeFile(`data/comments/${id}.json`, fileContent);

    res.status(201).json({
        commentId: id
    });
});

app.get("/get-all-comments", (req, res) => {
    var array = [];
    const directoryPath = path.join(__dirname, '/data/comments');

    fileSystem.readdir(directoryPath, (err, files) => {
        if(err) {
            console.log("Unable to scan directory: " + err);
            return res.sendStatus(500);
        }

        files.forEach((file) => { array.push(file) });
        return res.send(array);
    });
});

app.put("/edit-comment/:commentId", async (req, res) => {
    const commentId = req.params.commentId;
    const comment = req.body.comment;
    
    let content = await fs.readFile(`data/comments/${commentId}.json`, "utf-8");

    const createdDateTime = JSON.parse(content).createdDateTime;
    const updatedDateTime = new Date().toISOString();

    if (!comment) {
        return res.sendStatus(400);
    }
    
    var jsonData =
        '{"commentId": "' + commentId + '","comment": "' + comment + '","createdDateTime": "'+ createdDateTime +'","updatedDateTime": "' + updatedDateTime + '"}';
    var fileContent = JSON.stringify(JSON.parse(jsonData));
    
    await fs.mkdir("data/comments", { recursive: true });
    await fs.writeFile(`data/comments/${commentId}.json`, fileContent);
    
    res.status(201).json({
        commentId,
        comment,
        createdDateTime,
        updatedDateTime
    });
});

app.delete("/delete-all-comments", (req, res) => {
    var array = [];
    const directoryPath = path.join(__dirname, '/data/comments');

    fileSystem.readdir(directoryPath, (err, files) => {
        if(err) {
            console.log("Unable to scan directory: " + err);
            return res.sendStatus(500);
        }

        files.forEach((file) => { 
            fs.unlink(directoryPath + "/" + file);
        });
        
    });
    return res.sendStatus(200);
});

app.listen(3000, () => console.log("API Server is running..."));
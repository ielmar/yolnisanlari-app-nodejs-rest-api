import express from 'express';
import bodyParser from 'body-parser';

import mysql from 'mysql';
import connection  from './lib/db';

// Set up the express app
const app = express();

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/v1/addUser', (req, res) => {
  if(!req.body.deviceId) {
    return res.status(400).send({
      success: 'false',
      message: 'missing some required information'
    });
  }

  var user = {
    // name: req.sanitize('name').escape().trim(),
    // email: req.sanitize('email').escape().trim(),
    device_id: req.sanitize('deviceId').escape().trim()
}
 
connection.query('INSERT INTO yolnisanlari_users SET ?', user, function(err, result) {
    //if(err) throw err
    if (err) {
        // req.flash('error', err)
          
        // render to views/user/add.ejs
        return res.status(400).send({
          success: 'false',
          message: 'some error from database'
        });
    } else {                
      return res.status(201).send({
        success: 'true',
        message: 'User added successfully',
        todo
      })
    }
})
});

// get all todos
app.get('/api/v1/todos', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully',
  })
});

app.get('/api/v1/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.map((todo) => {
    if (todo.id === id) {
      return res.status(200).send({
        success: 'true',
        message: 'todo retrieved successfully',
        todo,
      });
    } 
});

 return res.status(404).send({
   success: 'false',
   message: 'todo does not exist',
  });
});

app.delete('/api/v1/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  db.map((todo, index) => {
    if (todo.id === id) {
       db.splice(index, 1);
       return res.status(200).send({
         success: 'true',
         message: 'Todo deleted successfuly',
       });
    }
  });

    return res.status(404).send({
      success: 'false',
      message: 'todo not found',
    });

});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
import express from 'express';
import bodyParser from 'body-parser';

import mysql from 'mysql';
import connection  from './lib/db';

import dotenv from 'dotenv';
dotenv.config();

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

  console.log(req.header['CF-IPCountry'])

  var user = {
    // name: req.sanitize('name').escape().trim(),
    // email: req.sanitize('email').escape().trim(),
    device_id: req.body.deviceId,
    ip_address: (req.headers['x-forwarded-for'] || '').split(',').pop() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null)
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
        message: 'User added successfully'
      })
    }
  })
});

app.post('/api/v1/addContestInfo', (req, res) => {
  const { deviceId, testPoint, watchedVideo, seenInterstitial } = req.body

  console.log('deviceId '+ deviceId)
  console.log('testPoint '+ testPoint)
  console.log('watchedVideo '+ watchedVideo)
  console.log('seenInterstitial '+ seenInterstitial)

  var isValid = false

  // if(!req.body.deviceId && req.body.deviceId.length == 0) isValid = false
  // if(!req.body.watchedVideo && (req.body.watchedVideo != 0 || req.body.watchedVideo != 1)) isValid = false
  // if(!req.body.testPoint && (req.body.testPoint >= 0 || req.body.testPoint <= 100)) isValid = true
  // if(!req.body.seenInterstitial && (req.body.seenInterstitial == 0 || req.body.seenInterstitial == 1)) isValid = true

  if(deviceId){
    console.log('deviceId valid')
  }
  if(watchedVideo){
    console.log('watchedVideo valid')
  }
  if(testPoint){
    console.log('testPoint valid')
  }
  if(seenInterstitial){
    console.log('seenInterstitial valid')
  }


  if(deviceId && watchedVideo && testPoint && seenInterstitial){
    console.log('valid')
    isValid = true
  }

  if(!isValid) {

    return res.status(400).send({
      success: 'false',
      message: 'missing some required information'
    });
  }

  var contestInfo = {
    device_id: req.body.deviceId,
    test_date: new Date(),
    test_point: req.body.testPoint * (req.body.watchedVideo == 0? 1 : 5),
    watched_video: req.body.watchedVideo,
    seen_interstitial: req.body.seenInterstitial,
    ip_address: (req.headers['x-forwarded-for'] || '').split(',').pop() || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress ||
                (req.connection.socket ? req.connection.socket.remoteAddress : null)
  }
 
  connection.query('INSERT INTO yolnisanlari_contest_info SET ?', contestInfo, function(err, result) {
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
        message: 'Contest info added successfully'
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


const PORT = process.env.PORT; 

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
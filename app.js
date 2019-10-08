import express from 'express';
import bodyParser from 'body-parser';

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

  var user = {
    device_id: req.body.deviceId,
    registration_time: new Date(),
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

  var isValid = false

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
    device_id: deviceId,
    test_date: new Date(),
    test_point: testPoint * (watchedVideo == '0' ? 1 : 5),
    watched_video: parseInt(watchedVideo),
    seen_interstitial: seenInterstitial,
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

app.get('/api/v1/getServerTime', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: new Date(),
  })
});

// get daily winner
app.get('/api/v1/getDailyWinner', (req, res) => {

  connection.query('SELECT * FROM yolnisanlari_winners WHERE date(now()) - 1 = win_date AND daily = 1', function(err, result) {
    //if(err) throw err
    if (err) {
        // render to views/user/add.ejs
        return res.status(400).send({
          success: 'false',
          message: 'some error from database'
        });
    } else {     
      var winner = {
        device_id: result[0].device_id,
        win_date: result[0].win_date
      }           
      return res.status(201).send({
        success: 'true',
        message: 'Today`s winner is ready',
        winner
      })
    }
  })
  // res.status(400).send({
  //   success: 'false',
  //   message: 'some error from database'
  // })
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
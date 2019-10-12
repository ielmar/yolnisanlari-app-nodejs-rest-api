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
  var timeObj = {
    time: new Date(),
    is_beginning_of_week: false,
    is_beginning_of_month: false
  }
  res.status(200).send({
    success: 'true',
    message: new Date(),
  })
});

// get daily winner
app.post('/api/v1/getDailyWinner', (req, res) => {
  const { deviceId } = req.body

  console.log(req.body)

  var isValid = false

  if(deviceId){
    console.log('valid')
    isValid = true
  }

  if(!isValid) {

    return res.status(400).send({
      success: 'false',
      message: 'missing some required information'
    });
  }

  connection.query('SELECT device_id, CAST(win_date AS CHAR) win_date FROM yolnisanlari_winners WHERE date(now()) - 1 = win_date AND daily = 1 AND device_id = ?', deviceId, function(err, result) {
    //if(err) throw err
    if (err) {
        // render to views/user/add.ejs
        return res.status(400).send({
          success: 'false',
          message: 'some error from database'
        });
    } else {
      // check if the result is not empty
      if(result.length > 0) {
        // is winner
        console.log('result '+result[0].win_date)
        var winner = {
          device_id: result[0].device_id,
          win_date: result[0].win_date
        }           
        return res.status(201).send({
          success: 'true',
          message: 'Congrats! You are the winner!',
          winner
        })
      } else {
        var winner = {
          win_date: result[0].win_date
        }  
        // is not the winner
        res.status(400).send({
          success: 'false',
          message: 'You are not the winner. Maybe tomorrow :)'
        })
      }
    }
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
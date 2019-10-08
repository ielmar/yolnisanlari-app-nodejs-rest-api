import cron from 'node-cron';
import fs from 'fs';
import connection  from './lib/db';

// cron to select daily winner
cron.schedule("1 0 * * *", function() {
    console.log("running a task to select the winner for yesterday");

    connection.query('select device_id, date(test_date) AS win_date from (select *, sum(`test_point`) as total from yolnisanlari_contest_info where date(test_date) = date(now())-1 group by device_id having sum(`test_point`) >= 1000) t order by rand() limit 1', function(err, result) {
        if(err) throw err
        var winner_id = result[0].device_id
             
        var dailyWinner = {
            device_id: result[0].device_id,
            win_date: result[0].win_date,
            daily: 1
        }
        connection.query('INSERT INTO yolnisanlari_winners SET ?', dailyWinner, function(err, result) {
            if(err) throw err
            console.log(winner_id+' is the winner')
        })
    })
});
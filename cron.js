import cron from 'node-cron';
import fs from 'fs';
import mysql from 'mysql';
import connection  from './lib/db';

cron.schedule("1 0 * * *", function() {
    console.log("running a task every day at night");

    connection.query('select device_id from (select *, sum(`test_point`) as total from yolnisanlari_contest_info where date(test_date) = date(now())-1 group by device_id having sum(`test_point`) >= 1000) t order by rand() limit 1', function(err, result) {
        if(err) throw err
        if (err) {

              
        } else {                
            console.log(result[0].device_id)
        }
      })
});
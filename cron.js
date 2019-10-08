import cron from 'node-cron';
import fs from 'fs';
import mysql from 'mysql';
import connection  from './lib/db';

cron.schedule("* * * * *", function() {
    console.log("running a task every minute");
});
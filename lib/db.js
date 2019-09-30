var mysql=require('mysql');
var connection=mysql.createConnection({
  host:'144.76.61.53',
  user:'elitapps',
  password:'0Llt@aPrs1$',
  database:'elitapps'
});
connection.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected!:)');
  }
});  
module.exports = connection; 
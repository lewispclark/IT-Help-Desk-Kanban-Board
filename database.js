const mysql = require('mysql');
const config = require('./config')
//local mysql db connection

const conn = mysql.createConnection(config.db);

conn.connect((err) => {
    if (err) throw err;
    console.log("Database Connected!");
});


query = async (sql) => {
    return new Promise((resolve, reject)=>{
        conn.query(sql,  (error, elements)=>{
            if(error){
                return reject(error);
            }
            return resolve(elements);
        });
    });
}

module.exports = query;
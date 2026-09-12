import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
if(!process.env.DATABASE_URL){console.error('Missing DATABASE_URL');process.exit(1);}
const sql=await fs.readFile(new URL('../db/mysql-schema.sql',import.meta.url),'utf8');
const connection=await mysql.createConnection({uri:process.env.DATABASE_URL,multipleStatements:true});
await connection.query(sql);
await connection.end();
console.log('MySQL schema is ready.');

import mysql from "mysql2";
import * as dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset : 'utf8mb4'
});

//การใช้ utf8mb4 เพื่อให้สามารถเพิ่มข้อมูลเป็นรูป emoji และสามารถแสดงข้อมูลเป็น emoji ได้
//แต่ก็ต้องไปเปลี่ยน Collation ให้เป็น utf8mb4_unicode_ci ในตารางที่ต้องการทำ ที่ฐานข้อมูลด้วย
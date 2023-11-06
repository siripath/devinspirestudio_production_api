import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { WebSocketServer } from 'ws';
import fs from 'fs'; //fs เป็น libary ของ systems ไม่ต้องติดตั้ง packages
import path from 'path';
const __dirname = path.resolve();
import { db } from "./db.js";
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));//โค๊ดนี้เป็นการเรียกดูรูปภาพที่อยู่ในโฟลเดอร์ uploads ได้เช่น http://localhost:8800/uploads/2.webp
app.use(cors({
  credentials: true,  
  origin: process.env.CLIENT_URL,
  methods: ["POST","GET"],
}));
app.use(express.json());
app.use(cookieParser());

//*** Import Routes ***/
import authRoutes from "./routes/auth.js";
import messagesRoutes from "./routes/messages.js";
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';

//*** API ***
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);


const server = app.listen(`${process.env.PORT}`,()=>{
    console.log(`runnning at port ${process.env.PORT}`)
});

const wss = new WebSocketServer({server});
wss.on('connection', (connection, req) => {
  //console.log("connection some account");
  function notifyAboutOnlinePeople() {
      [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
          online: [...wss.clients].map(c => ({userId:c.userId,username:c.username})),
        }));
      });
  };

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlinePeople();
      console.log('dead');
    }, 1000);
  }, 5000);

  connection.on('pong', () => {
    clearTimeout(connection.deathTimer);
  });

  //อ่าน username และ id จากคุกกี้สำหรับการเชื่อมต่อนี้
  const cookies = req.headers.cookie;  
  if (cookies) {
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
    if (tokenCookieString) {
      const token = tokenCookieString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          //console.log(userData);
          const {userId, username} = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  };


  //รับการส่งข้อความ มาจาก ws แล้วนำมาบันทึกลง Database
  connection.on('message', async (message) => {   
    const messageData = JSON.parse(message.toString());
    //console.log(messageData);
    const {receiver, text_msg, file, media} = messageData;
    let filename = null;
    if (file) {
      //console.log('file size', file.data.length);
      const parts = file.name.split('.');
      const ext = parts[parts.length - 1];
      filename = Date.now() + '.'+ext;
      const path = __dirname + '/uploads/' + filename;
      const bufferData = new Buffer(file.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:'+path);
      });
    }

    let file_img_name = null;
    if (media) {
      //console.log('media size', media.data.length);
      const parts = media.name.split('.');
      const ext = parts[parts.length - 1];
      file_img_name = Date.now() + '.'+ext;
      const path = __dirname + '/uploads/images/' + file_img_name;
      const bufferData = new Buffer(media.data.split(',')[1], 'base64');
      fs.writeFile(path, bufferData, () => {
        console.log('file saved:'+path);
      });
    }
    if (receiver && (text_msg || file || media)) {
      
      //เป็นการเพิ่มข้อความที่ส่งลง Database ตาราง tbl_messages
      //console.log("บันทึกข้อความจาก " + connection.userId + "ถึง" + receiver)
      const sender = connection.userId;
      const fileAttach = file ? filename : null;
      const fileImgAttach = media ? file_img_name : null;
      const values = [sender,receiver,text_msg,fileAttach,fileImgAttach];     
      db.query("INSERT INTO tbl_messages (sender,receiver,text_msg,file,file_img) VALUES (?)",[values],function(err,data){
          if(err){
              console.log(err);            
          }else{        
            const msgId =  data.insertId;           
            db.query("select * FROM tbl_messages WHERE id =?",[msgId],function(err,result){
              
                  if(err){
                      console.log(err);
                  }else{
                    //return res.status(200).json({ msg: "อัพเดทสถานะเรียบร้อย"}); 
                    //console.log('created message' + " " + result[0].text_msg);  
                    console.log('created message'); 
                    //โค๊ดล่างนี้จะเป็นการเอาไปแสดงที่หน้าต่างคนรับข้อความ
                    [...wss.clients].filter(c => c.userId == receiver).forEach(c => c.send(JSON.stringify({
                      text_msg,
                      sender:connection.userId,
                      receiver,
                      file: file ? filename : null,
                      media_content: media ? media.content : null,
                      //id: result[0].id
                    }))); 
                                        
                  }                       
            });            
          }
      });                      
    }
  });

  //แจ้งเตือนทุกคนเกี่ยวกับคนออนไลน์ (เมื่อมีคนเชื่อมต่อ)
  notifyAboutOnlinePeople();
});
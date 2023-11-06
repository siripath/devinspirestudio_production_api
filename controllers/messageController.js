import { db } from "../db.js";

import jwt from "jsonwebtoken";

import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;


export const getMessagesformodal = async (req, res) => { 
  //ต้องใช้เป็น get ค่อยจะแสดงรูป Avatar ได้
  try {
    //const { from } = req.body;
    const from = req.params.id;
    //console.log("รหัสผู้ใช้งาน " + from)
    //db.query("SELECT * FROM tbl_messages m LEFT JOIN tbl_users u ON m.sender=u.id WHERE m.receiver = ? GROUP BY m.sender  DESC  LIMIT 4",[from],function(err,result){
      //เป็นการ GROUP BY โดยเลือกเอาข้อมูลหรือเร็คคอร์ดล่าสุดมาแสดง พร้อมเงื่อนใข receiver ต้องเท่ากับ รหัสของผู้เข้าระบบใช้งานนั้น
      //db.query("SELECT m.*,u.* FROM tbl_messages m  LEFT JOIN tbl_users u ON m.sender=u.id, (SELECT sender,max(createdAt) as createdAt FROM tbl_messages WHERE receiver=? GROUP BY sender) tblms WHERE m.sender=tblms.sender AND m.createdAt=tblms.createdAt ORDER BY sender DESC LIMIT 4",[from],function(err,result){
      db.query("SELECT m.*,u.* FROM tbl_messages m  LEFT JOIN tbl_users u ON m.sender=u.id, (SELECT sender,max(createdAt) as createdAt FROM tbl_messages WHERE receiver=? GROUP BY sender ) tblms WHERE m.sender=tblms.sender AND m.createdAt=tblms.createdAt ORDER BY m.id DESC LIMIT 4",[from],function(err,result){  
      if(err){
          console.log(err);                
      }else{
        // return res.json(result);
        res.write(JSON.stringify(result.map(function (msg){ 
          //console.log("รหัสผู้ส่งจากฐานข้อมูล " + msg.sender + " - " + "รหัสผู้รับจากการเข้าใข้งาน " + from);
          //console.log(msg.text)
          return {from: msg.name, avatar: msg.avatarImage, message: msg.text_msg, create: msg.createdAt}; 
        })));                        
      }
      res.end();
    });      
  } catch (ex) {
    console.log(ex);
  }

};

export const getMessages = async (req, res) => { 
    try {
      const {userId} = req.params;
      const userData = await getUserDataFromRequest(req);
      const ourUserId = userData.userId;     
      console.log("ดึงข้อความจาก " + userId + "ถึง" + ourUserId)
      db.query("SELECT * FROM tbl_messages WHERE sender IN ("+userId+","+ourUserId+")" + "AND receiver IN ("+userId+","+ourUserId+") ORDER BY id",function(err,result){
        if(err){               
            console.log(err);    
            if (err) return res.status(500).json(err);            
        }else{         
            res.status(200).json(result);       
        }
      });
    } catch (ex) {
      console.log(ex);
    }

};

export const addMessage = async (req, res) => { 
   try {
      const { from, to, message, fileAttName } = req.body;
      console.log(fileAttName)
      //  const data = await Messages.create({
      //    message: { text: message },
      //    users: [from, to],
      //    sender: from,
      //  });
      const creatAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const values = [req.body.from, req.body.to, req.body.message, req.body.fileAttName, creatAt, creatAt];
      db.query("INSERT INTO tbl_messages (sender,receiver,text_msg,file,createdAt,updatedAt) VALUES (?)",[values],function(err,data){
          if(err){
              console.log(err);            
          }else{
            //console.log(data);
            if (data) return res.json({ msg: "เพิ่มข้อความเรียบร้อยแล้ว." });
            else return res.json({ msg: "ไม่สามารถเพิ่มข้อความลงในฐานข้อมูล" });            
          }
      });      

   } catch (ex) {
     console.log(ex);
   }
};


async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject('no token');
    }
  });
}

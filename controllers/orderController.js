import { db } from "../db.js";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

export const getAllOrders = async (req, res) => { 
  try {        
    db.query("SELECT * FROM tbl_orders ORDER BY id",function(err,result){
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

export const getOrderformodal = async (req, res) => { 
  //ต้องใช้เป็น get ค่อยจะแสดงรูป Avatar ได้
  try {
    //const { from } = req.body;
    const from = req.params.id;   
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

export const getOrder = async (req, res) => { 
    try {        
      db.query("SELECT * FROM tbl_orders o LEFT JOIN tbl_order_details os ON o.orderno=os.orderno WHERE o.orderno=?",[req.params.orderno],function(err,result){
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

export const addOrder = async (req, res) => { 
   try {
      //const { name,email,phone,address,orderdate,total,orderno } = req.body;
      //console.log(name)     
      const values = [req.body.orderno, req.body.ordername, req.body.name, req.body.email, req.body.phone, req.body.address, req.body.orderdate, req.body.total];
      db.query("INSERT INTO tbl_orders (orderno,ordername,name,email,phone,address,orderdate,total) VALUES (?)",[values],function(err,data){
          if(err){
              console.log(err);            
          }else{
            //console.log(data);
            if (data) return res.json({ msg: "เลขที่สั่งซื้อ " + req.body.orderno + " ได้ทำการสั่งซื้อเรียบร้อยแล้ว" });
            else return res.json({ msg: "ไม่สามารถเพิ่มข้อความลงในฐานข้อมูล" });            
          }
      });      

   } catch (ex) {
     console.log(ex);
   }
};

export const addOrderDetails = async (req, res) => { 
  try {
     //const { name,email,phone,address,orderdate,total,orderno } = req.body;
     //console.log(req.body.product_id + " " + req.body.title)     
     const values = [req.body.orderno,req.body.title, req.body.product_id, req.body.qty];
     db.query("INSERT INTO tbl_order_details (orderno, title, product_id, qty) VALUES (?)",[values],function(err,data){
         if(err){
             console.log(err);            
         }else{
           //console.log(data);
           if (data) return res.json({ msg: "ทำการสั่งซื้อสินค้านี้สำเร็จแล้ว.." });
           else return res.json({ msg: "ไม่สามารถเพิ่มข้อความลงในฐานข้อมูล" });            
         }
     });      

  } catch (ex) {
    console.log(ex);
  }
};

export const getOrderNo = async (req, res) => { 
  try {    
    db.query("SELECT id,orderno FROM tbl_orders ORDER BY id DESC LIMIT 1",function(err,result){
      if(err){               
          console.log(err);    
          if (err) return res.status(500).json(err);            
      }else{   
        if (result.length > 0) {
          return res.json(result);
        } else {
          //console.log("No Record");
          //return res.json({ msg: "ยังไม่มีข้อมูลเลขที่ Orderno" });
          return res.json("No Record");
        }      
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
};

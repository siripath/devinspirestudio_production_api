import { db } from "../db.js";


export const getTestFirst = async (req, res) => { 
    try {    
      //console.log('req.io ->', req.io)    
      db.query("SELECT * FROM usertest_realtime",function(err,result){
        if(err){
            console.log(err);                
        }else{
          // return res.json(result);
          //console.log("ส่งเก็ตเฟริท");
          req.io.emit("getfirst",result);
          //req.io.emit("hasilnya",{data:result})
          res.write(JSON.stringify(result.map(function (msg){             
            return {testid: msg.id, testname: msg.name}; 
          })));                        
        }
        res.end();
      });      
    } catch (ex) {
      console.log(ex);
    }
};

export const addTest = async (req, res) => { 
   try {      
      //console.log(req.body);
      const values = [req.body.newInput];
      //console.log(values);
      db.query("INSERT INTO usertest_realtime (name) VALUES (?)",[values],function(err,data){
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

export const editTest = async (req, res) => { 
  try {      
     //console.log(req.body);
     const id = [req.body.id];
     const values = [req.body.enteredName];
     //console.log(values);
     db.query("UPDATE usertest_realtime SET name = ? WHERE id = (?)",[values,id],function(err,data){
         if(err){
             console.log(err);            
         }else{
           //console.log(data);
           if (data) return res.json({ msg: "อัพเดทข้อมูลเรียบร้อยแล้ว." });
           else return res.json({ msg: "ไม่สามารถอัพเทดข้อมูลในฐานข้อมูลได้" });            
         }
     });
  } catch (ex) {
    console.log(ex);
  }
};

export const delTest = async (req, res) => { 
  try {      
     //console.log(req.body);
     const values = [req.body.id];
     //console.log(values);
     db.query("DELETE FROM usertest_realtime WHERE id = (?)",[values],function(err,data){
         if(err){
             console.log(err);            
         }else{
           //console.log(data);
           if (data) return res.json({ msg: "ลบข้อมูลเรียบร้อยแล้ว." });
           else return res.json({ msg: "ไม่สามารถลบข้อมูลในฐานข้อมูลได้" });            
         }
     });
  } catch (ex) {
    console.log(ex);
  }
};


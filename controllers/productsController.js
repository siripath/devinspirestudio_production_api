import { db } from "../db.js";


export const getProductsFirst = async (req, res) => { 
    try {    
      //console.log('req.io ->', req.io) 
      //ต้อง as id ของ tbl_products ด้วยไม่อย่างนั้นมันจะไปดึง id ของ tbl_category มาเป็น id หลัก   
      db.query("SELECT *,p.id as id FROM tbl_products p LEFT JOIN tbl_category c ON p.cat_id=c.id WHERE product_typeid = 6",function(err,result){
        if(err){
            console.log(err);                
        }else{
          //return res.json(result);
          //console.log("ส่งเก็ตเฟริท");
          //req.io.emit("getproductfirst",result);
          res.write(JSON.stringify(result.map(function (product){             
            return {id: product.id, title: product.title, price: product.price, qty: product.qty, cat_id: product.cat_id}; 
          })));                        
        }
        res.end();
      });      
    } catch (ex) {
      console.log(ex);
    }
};

export const addProducts = async (req, res) => { 
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

export const editProducts = async (req, res) => { 
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
           //req.io.emit("products",{data})
           if (data) return res.json({ msg: "อัพเดทข้อมูลเรียบร้อยแล้ว." });
           else return res.json({ msg: "ไม่สามารถอัพเทดข้อมูลในฐานข้อมูลได้" });            
         }
     });
  } catch (ex) {
    console.log(ex);
  }
};

export const delProducts = async (req, res) => { 
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


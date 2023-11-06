import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import dotenv from 'dotenv';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

export const login =  async (req, res) => { 
    //console.log("เข้าเงื่อนใข API Login");
    
    try {
        const { email, username, password } = req.body;     
        //console.log(email + " " + password);
        db.query("SELECT *,u.id as id FROM tbl_users u LEFT JOIN tbl_rules r ON u.rule_id=r.id WHERE email =?",[email],function(err,result,fields){
            if(err){               
                console.log(err);    
                if (err) return res.status(500).json(err);            
            }else{             
                //ไม่มีบัญชีผู้ใช้งานนี้
                //ถ้าต้องการจะส่ง res ไปหน้า Login ได้ให้ใส่ status(404) ทุกครั้ง
                if (result.length === 0) return res.status(404).json({ msg: "ไม่พบบัญชีผู้ใช้งานนี้!", status: false });
                     

                //ทำการตรวจสอบรหัสผ่าน
                const checkPassword = bcrypt.compareSync(
                    req.body.password,
                    result[0].password        
                );

                if (!checkPassword)
                return res.status(400).json({ msg: "รหัสผ่านไม่ถูกต้อง.?", status: false });  
                
                //ถ้ารหัสผ่านถูกต้อง ให้ Gentoken ใน cookie โดยส่งเป็น userID กับ username ไปสองชุดและนำ token ไปเช็คได้ที่เว็บ https://jwt.io
                const token = jwt.sign({userId: result[0].id, username: result[0].username }, jwtSecret);
                const { password, ...others } = result[0];       
                res.cookie("token", token, {sameSite:'none', secure:true}).status(200).json({ msg: "เข้าสู่ระบบสำเร็จ", status: true, result, id:result[0].id});            
               
            }
        });      

    } catch (ex) {
        console.log(ex);
    }
};

export const register = async (req, res) => { 
    try {
        const { username, email, password } = req.body;
        //console.log(username);
        db.query("SELECT * FROM tbl_users WHERE email = ? OR username = ?",[email,username],function(err,data){
            if(err){
                console.log(err);            
            }else{
                //console.log(data);                
                if (data.length) return res.status(409).json({ msg: "มีชื่อผู้ใช้หรืออีเมล์นี้อยู่แล้ว!" });

                const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
                const values = [username, email, hashedPassword, 4];
                db.query("INSERT INTO tbl_users (username,email,password,rule_id) VALUES (?)",[values],function(err,data){
                    if(err){
                        console.log(err);            
                    }else{
                        
                        //console.log(data);
                        db.query("SELECT id FROM tbl_users ORDER BY id DESC LIMIT 1",function(err,result){
                            console.log(result[0].id + " " + username)  
                            jwt.sign({userId:result[0].id, username}, jwtSecret, {}, (err, token) => {
                                if (err) throw err;
                                res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
                                    id: result[0].id,
                                });
                            });
                        });
                      
                        if (data) return res.json({ msg: "สร้างบัญชีผู้ใช้งานใหม่แล้ว." }); 
                        else return res.json({ msg: "ไม่สามารถเพิ่มข้อความลงในฐานข้อมูล" });         
                      
                    }
                });  
                                          
            }
        });        
    } catch (ex) {
        console.log(ex);
    }

};

export const getAllUsers = async (req, res) => { 
    try {
        const userId = req.params.id;
        //console.log(userId)
        //get ผู้ใช้งานทั้งหมด ยกเว้นตัวเอง
        db.query("SELECT avatarImage,email,username,id,status FROM tbl_users WHERE id !=?",[userId],function(err,result){
            if(err){
                console.log(err);                
            }else{
                return res.json(result);
            }
        });
    } catch (ex) {
        console.log(ex);
    }
};

export const setAvatar = async (req, res) => { 
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        //  console.log("id  " + userId);
        //  console.log(avatarImage);
        db.query('UPDATE tbl_users SET ? WHERE id = ?', [{ isAvatarImageSet: true,avatarImage:avatarImage }, userId],function(err,result){
            if(err){
                console.log(err);
                
            }else{
                return res.json({
                    isSet: true,
                    image: avatarImage,
                });
            }
        })
        
    } catch (ex) {
        console.log(ex);
    }
};

export const getPeople = async (req, res) => {  
  // const users = await User.find({}, {'_id':1,username:1});
  //res.json(users);
    db.query("SELECT id,username,avatarImage FROM tbl_users",function(err,result){
        if(err){
            console.log(err);                
        }else{
            return res.json(result);      
            //console.log(result)                   
        }
    });
};

export const logOut = (req, res) => { 
    try {       
        res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');     
    } catch (ex) {
        console.log(ex);
    }
};



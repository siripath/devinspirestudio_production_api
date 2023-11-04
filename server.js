import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true,  
    origin: process.env.CLIENT_URL,
    methods: ["POST","GET"],
  }));

app.get("/test",(req,res)=>{
    res.send("ต้องดาวรักกันมากนะจ๊ะ...");
    // const sql = "SELECT * FROM tbl_category";
    // db.query(sql,(err,result)=>{
    //     if(err) res.json({message: "Server Error"});
    //     return res.json(result);
    // });
});

app.listen(9990,()=>{
    console.log("Server Running at port 9990");
});
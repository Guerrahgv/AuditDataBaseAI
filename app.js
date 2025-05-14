const express  =require('express');
const path = require('path');
const app=express();

//middleware para archivos estaticos
app.use(express.static(path.join(__dirname,'public')));


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
})


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})
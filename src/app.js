import express from "express"
import dotenv from "dotenv"

const app=express()
app.use(express.json())
dotenv.config()


app.get('/',(req,res)=>{
  res.send('dev tinder')
})



app.listen(process.env.PORT || 3000,()=>{
  console.log(`App is running on port ${process.env.PORT || 3000}`)
})
const express = require('express')
const app = express()
const port = 3000
const qrcode = require('qrcode')
const nodemailer = require('nodemailer')
const mailGen = require('mailgen')
const mongoose = require('mongoose')
const { name } = require('ejs')

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs')



mongoose.connect("mongodb://0.0.0.0:27017/capahelp-test")
.then(() => console.log('connected to database successfully'))
.catch(err => console.log(err.message))

const checkSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    }
})

const checkModel = mongoose.model('checkcollection', checkSchema)

app.get('/', (req, res) => {
    res.render('index', {title:"QRcode page"})
})

app.post('/scan', (req,res) => {
    const inputText = req.body.text
    //console.log(inputText)
    qrcode.toDataURL(inputText, (err,resultSrc) =>{
        res.render('scan', {qrcode: resultSrc})
    })
})

app.get('/check-in-form', (req,res) =>{
    res.render('check-form', {title:"we want to know you"})
})

app.post("/check-form", async(req,res) => {
    const {email, name, phone} = req.body
    console.log(req.body)
    let newEntry = new checkModel({
        email,
        name,
        phone
    })
    await newEntry.save()
    .then(response => {
        res.redirect('/')
    })
    .catch(err => {
        console.log(err)
    })
})



app.post('/api/user', async(req,res) => {
    // let testAccount = await nodemailer.createTestAccount()

    let {email, name} = req.body
    
    let config ={
        service: 'gmail',
        auth:{
            user: '',
            pass: ''
        }
    }

    let transporter = nodemailer.createTransport(config)

    let mailGenerator = new mailGen({
        theme: "default",
        product: {
            name: "mailGen",
            link: "https://mailGen.js"
        }
    })

    let response = {
        body: {
            name: 'yus',
            intro: "Your bill has arrived",
            table:{
                data:[
                    {
                        item: "Nodemailer Stack Book",
                        description: "A Backend application",
                        price: "$10.99",
                    }
                ]
            },
            outro: "Looking forward to do more business"
        }
    }

    let mail = mailGenerator.generate(response)
    
    let message = {
        from: 'my email.com', //sender address
        to: email, // list of recipients
        subject: "Capahelp, powered by CapacityBay",
        text: `Congratulations, ${name}! You're eligible for a special offer on our digital marketing services
        . We're excited to help you take your business to the next level.
        Ready to learn more? Schedule a call with our team today using <a href="https://calendly.com">
        Calendly.com</a>. We'll be in touch shortly to confirm your appointment and answer any questions
        you may have. Thanks again for choosing Capacitybay!`,
        html: mail
    }

     transporter.sendMail(message)
     .then(() => {
        return res.status(201).json({msg: 'you should receive an email'})
     })
     .catch(err => {
        return res.status(500).json({err})
     })
    res.status(201).redirect('/')
})
app.listen(port, console.log(`app listening on port: ${port}`))
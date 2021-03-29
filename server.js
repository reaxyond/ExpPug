const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const mysql = require('mysql')
const config = require('./config')
const svgCaptcha = require('svg-captcha')
const sessionMiddleware = require('./session-middleware')
const formidable = require('formidable')
const cryptPwd  = require('./cryptPwd')
const moment = require('moment')

let connection = mysql.createConnection(config.mysql_connection)
connection.connect(function(err){
  if (err) {
    console.error('error connecting:' + err.stack)
    return;
  }
  console.log('connected as id' + connection.threadId)
  console.log('+++++++++++++++++++++++++++')
})

const app = express()
app.use(cookieParser('gjhffyturyevbciokl'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'static')))
app.set('views', path.join(__dirname, 'templates'))
app.locals.pretty = true
svgCaptcha.options.width = 85
svgCaptcha.options.height = 30
svgCaptcha.options.charPreset = '0123456789'
let sessionMap = Object.create(null)
app.use(sessionMiddleware(sessionMap))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.locals.moment = moment



app.use((req, res, next) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(req.method, req.url)
  console.log('req.cookies', req.cookies)
  console.log('req.signedCookies', req.signedCookies)
  // console.log('---req.session---', req.session)
  // console.log('---req.session.captcha---', req.session.captcha)
  console.log('req.body', req.body)
  console.log('req.query', req.query)
  console.log(moment().format('YYYY-MM-DD HH:mm:ss').toString())

  connection.query(`SELECT * FROM users WHERE email = ?`,req.signedCookies.loginUser, (err, data) => {
    if (data) {
      req.user = data[0]
    }
    console.log('--line 41--req.user syn with signedCookies----', req.user)
    next()
  })
  console.log('<<<<<<<<<line44<<<<<<<<')  
})

app.get('/', (req, res, next)=> {
  connection.query(`SELECT * FROM posts`, (err, data) => {
    if (err) {
      console.log('line68---there is sth wrong with the index page')
      console.log('line69---the data of all posts--', data)
    }
    res.render('index.pug', {
      posts: data,
      isLogin: req.signedCookies.loginUser,
      url: req.url,
    })
  })
})

app.route('/register').get( (req, res, next) => {
  res.render('register.pug', {
    isLogin: req.signedCookies.loginUser,
    url: req.url,
  })
}).post((req, res, next) => {
  // let currentUser = req.body
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: path.join(__dirname, 'upload')
  })
  
  form.parse(req, (err, fields, files) => {
    let salt = Math.random().toString(16).slice(2,8)
    let date = moment().format('YYYY-MM-DD HH:mm:ss').toString()
    connection.query(`INSERT INTO users (name, email, password, gender, avatar, salt, createAt) VALUES (?,?,?,?,?,?,?)`, [fields.name, fields.email, cryptPwd(cryptPwd(fields.password) + cryptPwd(salt)), fields.gender, path.basename(files.avatar.path), salt, date],
    (err) => {
      if (err){
        if (err.code == 'ER_WRONG_VALUE_COUNT_ON_ROW') {
          console.log('err???????????', err)
          res.end('register failed')
        }else {
          next(err)
        }
      } else {
        res.end('register succuess')
      }
    })

  })
})


app.route('/login').get( (req, res, next) => {
  res.render('login.pug', {
    isLogin: req.signedCookies.loginUser,
    url: req.url,
    preRef: req.get('referer')
  })
}).post((req, res, next) => {
  let loginBody = req.body

  if (loginBody.captcha !== req.session.captcha) {
    res.end('error captcha')
  } else {
    console.log('--line126----captcha correct')
    connection.query(`SELECT * FROM users WHERE  email = ? `, loginBody.email, (err, data) => {
      if (err) {
        console.log('---line124--cannot find data ---', data)
        res.type('text/html;charset=UTF-8')
        res.end('there is no such email')
      }
      console.log('---line129---find login data ----',data)
      let loginUser = data[0]

      if(loginUser.password !== cryptPwd(cryptPwd(loginBody.password) + cryptPwd(loginUser.salt))){
        res.end('login info is incorrect')
        console.log('-line133--loginUser.password------', loginUser.password)
        console.log('--line134---cryptPwd of the input check----', cryptPwd(cryptPwd(loginBody.password) + cryptPwd(loginUser.salt)))
      } else {
        res.cookie('loginUser', loginUser.email, {
          maxAge: 3 * 60 * 60 * 1000,
          signed: true,   
        signed: true,   
          signed: true,   
        signed: true,   
          signed: true,   
        })
        res.cookie('name', loginUser.name, {
          maxAge: 3 * 60 * 60 * 1000, 
        maxAge: 3 * 60 * 60 * 1000, 
          maxAge: 3 * 60 * 60 * 1000, 
        maxAge: 3 * 60 * 60 * 1000, 
          maxAge: 3 * 60 * 60 * 1000, 
          httpOnly: true,
        })
        res.type('text/html;charset=UTF-8')
        res.redirect(loginBody.preRef || '/')
      } //end else, when the password cryptPwd is correct11
    })//end query, to check email
  }//end else, when finding the captcha
})//end post

app.get('/logout', (req, res, next) => {
  res.clearCookie('loginUser')
  res.redirect(req.get('referer'))
})


app.route('/add-post')
  .get((req, res, next) => {
    res.render('add-post.pug',  {
      isLogin: req.signedCookies.loginUser,
      url: req.url,
    })
  })
  .post((req, res, next) => {
    let addPostBody = req.body

    if (req.user){
      connection.query(`INSERT INTO posts (userId, title, content) VALUES (?,?,?)`,[req.user.id, addPostBody.title, addPostBody.content], (err, data)=> {
        
        let dataPostId = data.insertId
        res.redirect('/post/' + dataPostId)
      })
    } else {
      res.end('please log in first')
    }
  })


app.get('/post/:id', (req, res, next) => {
  connection.query(`SELECT * FROM posts WHERE id = ? `,req.params.id, async(err, data) => {
    let currentPost = data[0]

    // console.log( '-----currentPost--line182---', currentPost)
    if (currentPost){
      connection.query(`SELECT users.email, users.avatar, comments.* 
      FROM users RIGHT JOIN comments  
      ON users.id = comments.userId
      WHERE comments.postId = ?`, currentPost.id, (err,currentComments) => {
        // console.log('----currentCommentsinPost---should have Avatar--line186---',currentComments)
        res.render('post.pug', {
          post: currentPost,
          comments: currentComments,
          isLogin: req.signedCookies.loginUser,
          paramID: req.params.id,
          url: req.url,
        })
      })
    } else {
      res.status(404).end('宁要找的主题不存在')
    }   
  })
})





app.post('/comment', (req, res, next) => { 
  if (req.signedCookies.loginUser){
    let commentBody = req.body
    let date = moment().format('YYYY-MM-DD HH:mm:ss').toString()
    connection.query(`SELECT * FROM users WHERE email = ?`,req.signedCookies.loginUser, (err, data) => {
      currUser = data[0] 

      connection.query(`INSERT INTO comments (content, userId, postId, createAt) VALUES (?,?,?, ?)`, [commentBody.content, rcurrUser.id, commentBody.postId, date], (err, data) => {
        console.log('comment success, line 144')
      })
    })
    res.redirect(req.get('referer'))
  } else {
    console.log('cannot commit')
    res.end('not login!')
  }
})




app.get('/captcha', (req, res, next) => {
  let obj = svgCaptcha.create({
    ignoreChars:'0o1il5Ss9q6b'
  })
  req.session.captcha = obj.text
  res.type('image/svg+xml').end(obj.data)
  // let random = Math.random().toString().substr(2,4)
  // var svg = `
  //   <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100px" height="25px">
  //     <text x="0" y="15" fill="red">${random}</text>
  //   </svg>
  // `
  // res.type('image/svg+xml').end(svg)
})



app.listen(config.port, ()=> {
  console.log('listening on', config.port)
})
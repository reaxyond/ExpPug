const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const app = express()
const mysql = require('mysql')
const config = require('./config.js')

app.set('views', path.join(__dirname, 'templates'))
app.locals.pretty = true

let connection = mysql.createConnection(config.mysql_connection)
connection.connect(function(err){
  if (err) {
    console.error('error connecting:' + err.stack)
    return;
  }
  console.log('connected as id' + connection.threadId)
  console.log('+++++++++++++++++++++++++++')
})


app.use(cookieParser('gjhffyturyevbciokl'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'static')))

app.use((req, res, next) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(req.method, req.url)
  console.log('req.cookies', req.cookies)
  console.log('req.signedCookies', req.signedCookies)
  console.log('req.body', req.body)
  console.log('req.query', req.query)

  connection.query(`SELECT * FROM users WHERE email = ?`,req.signedCookies.loginUser, (err, data) => {
    if (data) {
      req.user = data[0]
    }
    // console.log('--data of req.user--only one--', data)
    console.log('--line 41--req.user----', req.user)
    next()
  })
  console.log('<<<<<<<<<line44<<<<<<<<')  
})

app.get('/', (req, res, next)=> {
  connection.query(`SELECT * FROM posts`, (err, data) => {
    // console.log('data--line50--get all posts data---', data)
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
  var currentUser = req.body

  connection.query(`INSERT INTO users (name, email, password, gender) VALUES (?,?,?,?)`, [currentUser.name, currentUser.email, currentUser.password, currentUser.gender],
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


app.route('/login').get( (req, res, next) => {
  res.render('login.pug', {
    isLogin: req.signedCookies.loginUser,
    url: req.url,
  })
}).post((req, res, next) => {
  var currentInfo = req.body
  console.log('---enter line88 --/login--')
  connection.query(`SELECT * FROM users WHERE  email = ? AND password = ?`, [currentInfo.email,currentInfo.password], (err, data) => {
    if (err) {
      console.log('??? err in line 88 ???', err)
    }
    let loginUser = data[0]

    if(loginUser){  
      res.cookie('loginUser', loginUser.email, {
        maxAge: 3 * 60 * 60 * 1000,
        signed: true,   
      })
      res.cookie('name', loginUser.name, {
        maxAge: 3 * 60 * 60 * 1000, 
        httpOnly: true,
      })
      res.type('text/html;charset=UTF-8')
      res.redirect('/')
    } else {
      res.type('text/html;charset=UTF-8')
      res.end('登录错误')
    }
    
  })
})

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
        console.log('--line132--data', data)
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

    console.log( '-----currentPostid--line117---', currentPost.id )
    if (currentPost){
      connection.query(`SELECT * FROM comments WHERE postId = '${currentPost.id}'`, (err,currentComments) => {
        console.log('----currentComments--line120---',currentComments)
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
    var commentBody = req.body
    
    connection.query(`SELECT * FROM users WHERE email = ?`,req.signedCookies.loginUser, (err, data) => {
      req.user = data[0] 
      console.log('----req.user.id--line 142----', req.user.id)

      connection.query(`INSERT INTO comments (content, userId, postId) VALUES (?,?,?)`, [commentBody.content, req.user.id, commentBody.postId], (err, data) => {
        console.log('comment success, line 144')
      })
    })
    res.redirect(req.get('referer'))
  } else {
    console.log('cannot commit')
    res.end('not login!')
  }
})




app.listen(config.port, ()=> {
  console.log('listening on', config.port)
})
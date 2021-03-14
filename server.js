const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const port = 8080
const app = express()

app.set('views', path.join(__dirname, 'templates'))
app.locals.pretty = true
const users = [{
  id: 1,
  email: 'a@qq.com',
  password: '123456',
  gender: 'f',
  avatar: '/upload/xjwoieflsejrwo.jpg',
}]
const posts = [{
  id: 1,
  userId: 1,
  title: '好吃吗？1',
  content: '这个菜好吃吗1',
  timestamp: 234234234234,
  发贴人: 'a@qq.com',
}, {
  id: 2,
  title: '好玩吗？2',
  content: '这个菜好吃吗2',
  timestamp: 234234234234,
  发贴人: 'b@qq.com',
  comments: []
}]

const comments = [{
  id: 1,
  content: '我吃过，好吃1',
  userId: 1,
  postId: 2,
  createAt: 1323462347
}, {
  id: 2,
  content: '我吃过，好吃2',
  userId: 1,
  postId: 2,
  createAt: 1323462347
}]


app.use(cookieParser('gjhffyturyevbciokl'))

app.use((req, res, next) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(req.method, req.url)
  console.log('req.cookies', req.cookies)
  console.log('req.signedCookies', req.signedCookies)
  console.log('req.body', req.body)
  console.log('req.query', req.query)
  next()
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'static')))
app.route('/register').get( (req, res, next) => {
  res.render('register.pug', {
    isLogin: req.signedCookies.loginUser,
    url: req.url,
  })
}).post((req, res, next) => {
  var currentUser = req.body
  if(users.find(user => user.email == currentUser.email)){
    res.type('text/html;charset=UTF-8')
    res.end('email 已被占用， 尝试登录')
  } else {
    currentUser.id = users.slice(-1)[0].id + 1
    users.push(currentUser)
    res.type('text/html;charset=UTF-8')
    res.end('注册成功')
  }
})


app.route('/login').get( (req, res, next) => {
  res.render('login.pug', {
    isLogin: req.signedCookies.loginUser,
    url: req.url,
  })
}).post((req, res, next) => {
  var currentInfo = req.body
  let loginUser = users.find(user => user.email == currentInfo.email && user.password == currentInfo.password)
  if(loginUser){
    res.cookie('loginUser', loginUser.email, {
      maxAge: 3 * 60 * 60 * 1000,
      signed: true, 
      
    })
    res.cookie('gender', loginUser.gender, {
      maxAge: 3 * 60 * 60 * 1000, 
      httpOnly: true,
    })
    res.type('text/html;charset=UTF-8')
    // res.write('登录成功')
    res.redirect('/')
  } else {
    res.type('text/html;charset=UTF-8')
    res.end('登录错误')
  }
})

app.get('/logout', (req, res, next) => {
  res.clearCookie('loginUser')
  res.redirect(req.query.next)
})


app.get('/', (req, res, next)=> {
  res.render('index.pug', {
    posts: posts,
    isLogin: req.signedCookies.loginUser,
    url: req.url,
  })
})

app.get('/post/:id', (req, res, next) => {
  var currentPost = posts.find(post => post.id == req.params.id)
  if (currentPost){
    var currentComments = comments.filter(comment => comment.postId == currentPost.id) 
    res.render('post.pug', {
      post: currentPost,
      comments: currentComments,
      isLogin: req.signedCookies.loginUser,
      paramID: req.params.id,
      url: req.url,
    })
  } else {
    res.status(404).end('宁要找的主题不存在')
  }

})

app.post('/comment', (req, res, next) => { 
  if (req.signedCookies.loginUser){
    var comment = req.body
   
    comment.userId = users.find(user => user.email == req.signedCookies.loginUser).id
    comment.id = comments.slice(-1)[0].id + 1
    comment.createAt = Date.now()
    
    comments.push(comment)  
    console.log("comment" , comment)
    res.redirect(req.get('referer'))
  } else {
    console.log('cannot commit')
    res.end('not login!')
  }
})
app.listen(port, ()=> {
  console.log('listening on', port)
})
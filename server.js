const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const port = 8080
const app = express()

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
  res.type('text/html;charset=UTF-8')
  res.end(`
    <meta charset= "UTF-8" />
    <h1>注册账号</h1>
    <form action = "/register" method="post">
      email: <input type="text" name= "email"/>
      password: <input type="password" name="password"/>
      gender: 
      <label>
        <input type="radio"  value= "m" />男
      </label>
      <label>
        <input type="radio"  value= "f" />女
      </label> 
      <button>注册</button>
    </form>
  `)
}).post((req, res, next) => {
  var currentUser = req.body
  currentUser.id = users.slice(-1)[0].id + 1
  if(users.find(user => user.id == currentUser.id)){
    res.type('text/html;charset=UTF-8')
    res.end('email 已被占用， 尝试登录')
  } else {
    users.push(currentUser)
    res.type('text/html;charset=UTF-8')
    res.end('注册成功')
  }
})


app.route('/login').get( (req, res, next) => {
  res.type('text/html;charset=UTF-8')
  res.end(`
    <meta charset= "UTF-8" />
    <h1>登录</h1>
    <form action = "/login" method="post">
      email: <input type="text" name= "email"/>
      password: <input type="password" name="password"/>
      <button>登录</button>
    </form>
  `)
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
  var html = posts.map(post => {
    return `<li>
    <a href="/post/${post.id}">${post.title}</a>
    </li>`
  }).join('')
  res.type('text/html;charset=UTF-8')
  res.write(`<div>
      <a href= "/">首页</a>
      ${
        req.signedCookies.loginUser ?
        `hi, ${req.signedCookies.loginUser}
         <a href='/logout?next=${req.url}'>退出</a>`
         :
         `<a href='/login'>登录</a>
          <a href='/register'>注册</a>`
      }
    </div>`)

  res.end(html)
})

app.get('/post/:id', (req, res, next) => {
  var currentPost = posts.find(post => post.id == req.params.id)
  if (currentPost){
    var currentComments = comments.filter(comment => comment.postId == currentPost.id) // post is current post
    res.type('text/html;charset=UTF-8')
    res.write(`
    <div>
      <a  href= '/'>首页</a>
      ${
        req.signedCookies.loginUser ?
        `hi, ${req.signedCookies.loginUser}
         <a href='/logout?next=${req.url}'>退出</a>`
         :
         `<a href='/login'>登录</a>
          <a href='/register'>注册</a>`
      }
    </div>
    `)
    res.end(`
      <div>
        <h1>${currentPost.title}</h1>
        <p>${currentPost.content}</p>
      </div>
      <ul>
        ${
          currentComments.map(comment => {
            return `
              <li>
                ${comment.content} ${new Date(comment.createAt).toString()}
              </li>
            `
          })
        }
      </ul>
      ${
        req.signedCookies.loginUser ?
        `
          <form action="/comment" method="POST">
          <input type="hidden" name = "postId" value= ${req.params.id}>
            <textarea name="content"></textarea>
            <button>提交</button>
          </form>
        ` : ``
      }
    `)
  } else {
    res.status(404).end('宁要找的主题不存在')
  }

})

app.post('/comment', (req, res, next) => { 
  if (req.signedCookies.loginUser){
    var comment = req.body
    console.log('req.body', req.body)
    console.log('req.query', req.query)
    
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
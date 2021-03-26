module.exports = {
  port: 8080,

  mysql_connection: {
    host: 'localhost',
    user:'root',
    password:'mysql1234',
    database:'exppug_db',
    port: 3306
  },

  
}

// const users = [{
//   id: 1,
//   email: 'a@qq.com',
//   password: '123456',
//   gender: 'f',
//   avatar: '/upload/xjwoieflsejrwo.jpg',
// }]
// const posts = [{
//   id: 1,
//   userId: 1,
//   title: '好吃吗？1',
//   content: '这个菜好吃吗1',
//   timestamp: 234234234234,
//   发贴人: 'a@qq.com',
// }, {
//   id: 2,
//   title: '好玩吗？2',
//   content: '这个菜好吃吗2',
//   timestamp: 234234234234,
//   发贴人: 'b@qq.com',
//   comments: []
// }]

// const comments = [{
//   id: 1,
//   content: '我吃过，好吃1',
//   userId: 1,
//   postId: 2,
//   createAt: 1323462347
// }, {
//   id: 2,
//   content: '我吃过，好吃2',
//   userId: 1,
//   postId: 2,
//   createAt: 1323462347
// }]
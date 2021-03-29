module.exports = function(sessionMap){
  
  
  return (req, res,next) => {
    if(!req.cookies.sessionId){
      let sid = Math.random().toString(16).slice(2)
      res.cookie('sessionId', sid, {
        maxAge: 24 * 60 * 60 * 1000 * 10,
      }) 
      req.session = sessionMap[sid] = {}
    } else {
      let sid = req.cookies.sessionId
      if (sid in sessionMap){
        req.session = sessionMap[sid]
      } else {
        req.session = sessionMap[sid] = {}
      }
    }
    next() 
  }
}
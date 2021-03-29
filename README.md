# ExpPug

## first version
1. 使用express完成基本的html页面 
2. 首页展示所有post， 登录和登出
3. 完成基本form表单， 和带时间的添加评论

## second version
1. 更正register的判断错误
2. 将register  login  post 模板替换
3. 引用bootstrap

## third version
1. mysql 查找和插入数据
2. 增加add-post

## forth version
 1. login 重定向回原页面，添加验证码svgCaptcha
 2. 给未登录用户设置session ，用于核对验证码
 3. 添加avatar 头像上传，需要保存在upload文件夹下
 4. password加盐加密， 使用node内置的crypto模块， 比较用户输入密码在加salt和MD5之后，是否与数据库保存的密码一致
 5. 使用moment库对日期处理，以匹配mysql的timestamp类型

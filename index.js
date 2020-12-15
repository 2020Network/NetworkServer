var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "network_database",
    password: "암호는 알려줄 수 없어요", 
    port: 3306
});

// 회원가입
app.post('/user/join', function (req, res) {
    console.log(req.body);
    const {userName,
       userEmail,
       userPwd,
       userAge,
       userGender,
       userStudyfield
    } = req.body;
    
    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO network_database.Users (UserName, UserEmail, UserPwd, Age, Gender, StudyField) VALUES (?, ?, ?, ?, ?, ?)';
    var sql2 = `select exists (select UserEmail from network_database.Users where UserEmail = "${userEmail}") as "is_id";`;
    var params = [userName, userEmail, userPwd, userAge, userGender, userStudyfield];
    
    connection.query(sql2, function (err, rows,field){
        var resultCode;
        var message;

        if (err) {
            console.log(err);
        }
        if (rows[0].is_id === 1){
            res.status(403).send({message : "아이디 중복이야아"})
        }
        else {
            connection.query(sql, params, function (err, result) {

                if (err) {
                    console.log(err);
                }
                 else {
                    res.status(200).send({message : "회원가입 성공했어"})
                }
            });
        }
    });
});

// 로그인
app.post('/user/login', function (req, res) {
    const {
       userEmail,
       userPwd
    } = req.body;

    var sql = `select * from Users where UserEmail = "${userEmail}"`;

    connection.query(sql, function (err, rows, field) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            if (rows.length === 0) {
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
            } else if (userPwd !== rows[0].UserPwd) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                resultCode = 200;
                res.status(200).send({message : "로그인 성공! " + rows[0].UserName + "님 환영합니다!","user" : rows[0].UserID, "userName" : rows[0].UserName})
            }
        }
    })
});
// 내 정보 가져오기
app.get('/user/myuser', function(req,res){
    var resultCode = 404;
    var message = '에러가 발생했습니다';
    var sql = `select * from network_Database.users where UserID = ${req.query.userID}`;

    connection.query(sql, function(err, rows, field){
        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            var userInfo = rows;
            message = '내 정보 불러옴';
        }
        res.json({
            'code': resultCode, 
            'message': message,
            'userInfo' : userInfo 
        });
    })
})
// 정보 수정
app.post('/user/myuser/update', function(req, res) {
    const {
        userName,
        userAge,
        userGender,
        userStudyfield,
        userID
    } = req.body;


    var params = [userName,userAge,userGender,userStudyfield, userID];
    var sql = `UPDATE network_database.users SET UserName = ?,Age = ?, Gender = ?, StudyField = ? WHERE UserID = ?`;

    connection.query(sql,params, function(err, result){
        if(err) console.log(err);

        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            message = '수정 완료';
        }
        res.json({
            'code': resultCode,
            'message': message
        });
    })
})

// 모든 그룹 불러옴
app.post('/group' , function(req, res) {
    const {
        userPeople,
        userStudyField
     } = req.body;
    var resultCode = 404;
    var message = '에러가 발생했습니다';
    
    var sql = `select * from network_database.groups where People >=  ${userPeople}`;
    
    connection.query(sql, function(err, rows, field){
        if(err) {
            console.log(err);
        } else {
            resultCode = 200;
            var groupInfo = rows;
            message = '게시판 불러옴';
        }
        
        res.json({
            'code': resultCode,
            'message': message,
            'groupInfo' : groupInfo
        });
    })
})

// 내 그룹 확인
app.get('/group/mygroup', function(req, res) {
    var resultCode = 404;
    var message = '에러가 발생했습니다';
    var groupUserID = req.body.userID;
    var sql = `select * from network_database.groups network_database.Users where groups.UserID = User.${req.query.userID}`;

    connection.query(sql, function(err, rows, field){
        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            var groupInfo = rows;
            message = '내 게시판 불러옴';
        }
        res.json({
            'code': resultCode,
            'message': message,
            'groupInfo' : groupInfo
        });
    })
})
// 그룹 가져오기
app.get('/group/allgroup', function(req, res) {
    var resultCode = 404;
    var message = '에러가 발생했습니다';
    var sql = `select * from network_database.groups where GroupID = ${req.query.groupID}`;

    connection.query(sql, function(err, rows, field){
        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            var groupInfo = rows;
            message = '그 게시판 불러옴';
        }
        res.json({
            'code': resultCode,
            'message': message,
            'groupInfo' : groupInfo
        });
    })
})
// 게시판 작성
app.post('/group/create', function(req, res) {
    console.log(req.body);

    const {
        title,
        content,
        people,
        location,
        gender,
        age1,
        age2,
        studyField,
        userID
    } = req.body;
    
    var sql = 'INSERT INTO network_database.Groups (Title, Content, People, Location, Gender, Age1 , Age2, StudyField, UserID) VALUES (?, ?, ?, ? ,?, ?, ?, ? ,?)';

    var params = [title, content, people, location, gender, age1, age2, studyField, userID];

    connection.query(sql,params, function (err,result) {
        var resultCode;
        var message;

        if(err){
            console.log(err)
        }
        else {
            res.status(200).send({message : "게시판 작성 성공"})
        }
    })
});

// 그룹 참가
app.post('/group/join', function(req, res) {
    console.log(req.body);

    const {
        userID,
        groupID,
        userName
    } = req.body;
    
    var sql = 'INSERT INTO network_database.groupjoin (UserID,GroupID,UserName) VALUES (?, ?, ?)';

    var params = [userID,groupID,userName];

    connection.query(sql,params, function (err,result) {
        var resultCode;
        var message;

        if(err){
            console.log(err)
        }
        else {
            res.status(200).send({message : "참가 성공"})
        }
    })
});

app.get('/group/join/group', function(req, res){
    var resultCode = 404;
    var message = '에러가 발생했습니다';
    var sql = `SELECT * FROM groupjoin, groups where groupjoin.UserID = groups.UserID`;

    connection.query(sql, function(err, rows, field){
        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            var groupInfo = rows;
            message = '그 게시판 불러옴';
        }
        res.json({
            'code': resultCode,
            'message': message,
            'groupInfo' : groupInfo
        });
    })
})

// 게시판 수정 완료
app.post('/group/mygroup/update', function(req, res) {
    const {
        title,
       content,
       people,
       location,
       gender,
       age1,
       age2,
       studyfield,
       groupID
    } = req.body;

    console.log(title, content, people, location, gender, age1, age2, studyfield, groupID);

    var params = [title, content, people, location, gender, age1,age2, studyfield, groupID];
    var sql = `UPDATE network_database.groups SET Title = ?,Content = ?, People = ?, Location = ?, Gender = ?, Age1 = ?, Age2 =?, StudyField = ? WHERE GroupID = ?`;

    connection.query(sql,params, function(err, result){
        if(err) console.log(err);

        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if(err) {
            console.log(err)
        } else {
            resultCode = 200;
            message = '수정 완료';
        }
        res.json({
            'code': resultCode,
            'message': message
        });
    })
})

// 게시판 삭제
app.post('/group/mygroup/delete', function(req, res) {
    const {
       groupID
    } = req.body;

    var sql = 'DELETE FROM network_database.groups WHERE GroupID = ?';
    var parms = [groupID]

    connection.query(sql,parms, function(err,result){
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if(err){
            console.log(err)
        }else{
            resultCode = 200;
            message = '삭제 완료';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
    
})

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });


app.get('/', function(req, res){
    res.send("안녕");
});


app.listen(3000, function(){
    console.log("3000번에서 열림");
});
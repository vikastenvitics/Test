require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var morgan = require('morgan');
var path = require('path');
var fs = require('fs');
var multer = require('multer');
var config = require('config.json');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var ImagePath = './uploads/';
var imgobj
db.bind('Tasks');

app.set('views', __dirname + './src/admin');
app.use(express.static('./src/admin'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
//app.use(express.static(path.join(__dirname, 'uploads')));
app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// use JWT auth to secure the api
//app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/access/authenticate', '/api/myupload'] }));
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/access/authenticate', '/appapi/TaskuploadImage/:id','/api/Timesheet/exportcsv/'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
//app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/access', require('./controllers/access.controller'));
app.use('/api/projects', require('./controllers/project.controller'));
app.use('/api/tasks', require('./controllers/task.controller'));
app.use('/api/employee', require('./controllers/employee.controller'));
app.use('/api/leave', require('./controllers/leave.controller'));
app.use('/api/mail', require('./controllers/mail.controller'));
app.use('/api/Qa', require('./controllers/qa.controller'));
app.use('/api/issue', require('./controllers/issue.controller'));
app.use('/api/calender', require('./controllers/calender.controller'));
app.use('/api/Design', require('./controllers/design.controller'));
app.use('/api/Timesheet', require('./controllers/timesheet.controller'));
// make '/app' default route
/** Serving from the same express Server
    No cors required */
app.use(express.static('../client'));
app.use(bodyParser.json());

var Storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './src/admin/uploads/');
    },
    filename: function (req, file, cb) {       
        var UserId = req.params.id;       
        imgobj = { path: ImagePath + "/" + file.originalname, userid: UserId, name: file.originalname };
        //db.Tasks.insertOne(myobj, function (err, res) {
        //    if (err) throw err;
        //    console.log("ImagePath inserted");
            
        //});
        var datetimestamp = Date.now();
        cb(null,file.originalname);
    }
});

var upload = multer({ //multer settings
    storage: Storage
}).array('file',10);

/** API path that will upload the files */
app.post('/appapi/TaskuploadImage/:id', function (req, res) {
    console.log(res);
    upload(req, res, function (err) {
        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        } var temdata = { any: 'data' };
       
        res.json({ error_code: 0, err_desc: null, Data: imgobj });
    });
});

// start server
var server = app.listen(3000, function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});






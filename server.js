var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var moment      = require('moment-timezone');
var config      = require('./config/database'); // get db config file
var Credits     = require('./app/models/credits'); // get the mongoose model
var port        = process.env.PORT || 3000;

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

var corsOptions = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false
};

var allowCrossDomain = function(req, res, next) {
  //  if ('OPTIONS' == req.method) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
   // }
   // else {

    //}
};



app.use(allowCrossDomain);

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello Word!');
});


// connect to database
mongoose.connect(config.database);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + config.database);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});



// bundle our routes
var apiRoutes = express.Router();



apiRoutes.post('/creatUser' , function(req, res){

  Credits.findOne({username: req.body.username}, function(err,data){
    console.log("creatUser");
    if(err) throw err;
    if(!data){
      var newUser = new Credits({
        username : req.body.username,
      })
    // save the user
    newUser.save(function(err) {
      console.log("#######NEW");
      res.json({success: true, msg: 'Success.'});
    })

  }

})
})



apiRoutes.post('/configurations' , function(req, res){

  console.log(req.body.username);
  if(!req.body.username){
    console.log("ERRO")
    return res.status(403).send({success: false});
  }

  Credits.findOne({username: req.body.username}, function(err,data){
    if(err) throw err;
    if(data){
      if(data.configurations.length == 0){
        data.configurations.push({
          notifications         : req.body.notifications,
          timernotifications    : req.body.timernotifications
        })
        data.save(function(err){
          console.log(err);
          if (err) throw err;
          console.log("#######New configurations");
          res.json({success: true});
        });

      }else{

        data.configurations[0].notifications = req.body.notifications;
        data.configurations[0].timernotifications = req.body.timernotifications;
        data.save(function(err){
          console.log("#######UPDATE configurations");
          if(err){
            return res.send(err);
          }
            return res.json({success: true});
        });
      }

    }else{
      return res.status(403).send({success: false});
    }
  })

})

apiRoutes.post('/getConfigurations', function(req, res) {
  Credits.findOne ({username: req.body.username }, function(err,data){
    if (err) throw err;
    if (!data) {
      return res.status(403).send({success: false});
    } else {
      res.json({success: true, data:data.configurations});
    }
  }); 
});

// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/credit', function(req, res) {
  console.log(">>>POST CREDIT");
 // Credits.find ({username: req.body.username},{credits:{$elemMatch:{'bannerId':req.body.bannerId}}}, function(err,data){
  Credits.findOne ({username: req.body.username }, function(err,data){
    if (err) throw err;
    if(!data){
      var newCredits = new Credits({
        username : req.body.username,
        credits :[{
          clickCont           : '1',
          bannerId            : req.body.bannerId
        }]
      })
    // save the user
    newCredits.save(function(err) {
      console.log("#######NEW");
      res.json({success: true, msg: 'Success.'});
    })
  }else{

    Credits.findOne ({username: req.body.username,'credits.bannerId': req.body.bannerId }, function(err,datacredits){
      if (err) throw err;
      if(!datacredits){

        data.credits.push({
          serialCelPhone      : req.body.serialCelPhone,
          clickCont           : '1',
          bannerId            : req.body.bannerId
        })
        data.save(function(err){
          if(err){
            res.send(err);
          }
          console.log("#######PUSH");
          res.json({success: true});
        });

      }else{
          //.getTime() - 1000 * 60 * 30
          var dataDB = 0;
          var click = 0;
          var dataNow = new Date().getTime();
          datacredits.credits.forEach(function (item) {
            if(req.body.bannerId == item.bannerId){
              dataDB = item.data.getTime() + (29*60*1000)
              click = parseInt(item.clickCont);
              console.log(item.data);
              console.log(new Date());
              if(dataNow > dataDB){
                click = click+1;
                item.clickCont = click;
                item.data = dataNow;
                datacredits.save (function(err){
                  if(err){
                    res.send(err);
                  }
                  console.log("#######UPDATE");
                  res.json({success: true});
                })
                
              }

            }
            
          })
        }

      })
  }

});

});


apiRoutes.post('/credits', function(req, res) {
  console.log("<<<POST CREDITS>>>>");
  Credits.findOne ({username: req.body.username }, function(err,data){
    if (err) throw err;
    if (!data) {
      return res.status(403).send({success: false});
    } else {
      res.json({success: true, data:data});
    }
  }); 
});

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);


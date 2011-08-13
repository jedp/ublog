// ublog
// =====
//
// A simple microblogging application and service in Node.JS.
//
// Imports
// -------

var express = require('express');
var ublog = require('./ublog');
var models = require('./models');
var redis = require('redis').createClient();

var app = module.exports = express.createServer();

var sessionStore = new express.session.MemoryStore();
var sessionKey = 'ublog.sid';

// Configuration
// -------------

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // bodyParser enables us to retrieve POST data, which
  // we will need for our login form
  app.use(express.bodyParser());

  // User session management to keep track of whether a 
  // client is logged in or not.
  app.use(express.cookieParser());
  app.use(express.session(
      {'store': sessionStore,
       'secret': "Attack at dawn!",
       'key': sessionKey}));

  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
// ------

// authentication middleware

function loginRequired(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login?next=' + req.url);
  }
};

// login and authentication

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // Put your authentication tests here
  var username = req.body.username;
  var password = req.body.password;

  if (username && password) {
    // make sure we have this user in the db
    models.ensureUser(username);
    
    req.session.username = username;

    // associate user with this application server
    redis.sadd('login.'+username, process.pid);

    res.redirect(req.query.next || '/');
  } else {
    res.redirect("back");
  }
});

app.get('/logout', function(req, res) {
  if (req.session.username) {
    redis.srem('login.'+req.session.username, process.pid);
  }
  req.session.destroy();
  res.render('logout');
});

// content routes

app.get('/', loginRequired, function(req, res){
  res.render('feed', {
    username: req.session.username
  });
});

if (!module.parent) {

  /**
   * If this process dies or is terminated,
   * try to add our pid to the 'ublog-reap'
   * set and send a message that we have died.
   */
/*
  function exit(err) {
    redis.sadd('ublog-reap', process.pid);
    redis.publish('ublog-messages', JSON.stringify({'died':process.pid}));
    if (err) { 
      console.error(err);
    }
    console.log("Exiting");
    process.exit();
  }
  process.on('SIGINT', exit);
  process.on('SIGHUP', exit);
  process.on('SIGTERM', exit);
  process.on('uncaughtException', exit);
*/

  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}

ublog.connect(app, sessionStore, sessionKey);


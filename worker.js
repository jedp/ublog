// worker.js - processes messages off the queue
// and puts them in the inbox for app servers accordingly

var redis = require('redis').createClient();
var models = require('./models');
var prefix = 'ublog.';

var MessageParser = module.exports.MessageParser = function(message) {
  this.message = message || "";
  this.mentions = [];
  return this;
};

MessageParser.prototype.sanitize = function() {
  // remove bogus characters
};

MessageParser.prototype.parse = function() {
  // find users mentioned in this message

};



function process() {
  console.log("waiting...");
  redis.brpop(prefix+'messages', 0, function(err, msg) {
    if (!err) {
      try {
        var contents = JSON.parse(msg[1]);
        console.log("Handling message from " + contents.author);
        
        // Before we do anything, save the new message
        // @@@ to do - scan for mentions
        var message = new models.Message({
          author: contents.author,
          message: contents.message
        });
        message.save();
        
      } catch (err) {
        // on error, push the message back on the queue
        // then crash
        console.error(err);
        console.log("Pushing message back: " + msg[1]);
        redis.rpush(prefix+'messages', msg[1]);
        throw(err);
      }
    }

    // when done, wait for more
    process();
  });
}

module.exports.process = process;

if (!module.parent) {
  console.log("ublog worker listening to redis @ %s:%d", redis.host, redis.port);
  process();
};



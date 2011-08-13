// Models
// ======
//
// mongoDB models for a microblogger

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ublog');

var Schema = mongoose.Schema;

// For each user, record the username and a list of usernames he or she is
// following

var UserSchema = new Schema({
  username: {type: String, index: true},
  following: [String],
  followers: [String]
});
var User = mongoose.model('User', UserSchema);

var ensureUser = exports.ensureUser = function(username, callback) {
  // upsert user
  User.update({username: username}, {}, {upsert: true}, function(err) {
    if (typeof callback === 'function') {
      callback(err);
    }
  });
};



// For a message, record the username who sent it, the message itself, and the
// date.  We may eventually want to extract mentions and hashtags and index
// them for faster retrieval.  Then again, mongo is fast.

var MessageSchema = new Schema({
  author: {type: String, index: true},
  message: String,
  date: {type: Date, default: Date.now},
  retweeted: {type: String, index: true},
  mentions: {type: String, index: true},
  favorites: [String]
});
var Message = mongoose.model('Message', MessageSchema);

// Export `User` and `Message` models.

if (typeof exports !== 'undefined') {
  exports.User = User;
  exports.Message = Message;
}






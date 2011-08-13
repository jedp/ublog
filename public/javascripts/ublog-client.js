_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

var Message = Backbone.Model.extend({});

var MessageView = Backbone.View.extend({
  model: Message,

  tagName: 'div',

  template: _.template( $('#message-template').html() ),

  initialize: function() {
    _.bindAll(this, 'render');
    return this;
  },

  render: function() {
    $(this.el).html(this.template(this.model));
    return this;
  }
});

var Profile = Backbone.Model.extend({});

var ProfileView = Backbone.View.extend({
  model: Profile,

  tagName: 'div',

  template: _.template( $('#profile-template').html() ),

  initialize: function() {
    _.bindAll(this, 'render');
    return this;
  },
  
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  }
});

var MessageCollection = Backbone.Collection.extend({
  model: Message
});

var Feed = Backbone.Model.extend({});

var FeedView = Backbone.Model.extend({
  model: Feed,

  tagName: 'div',

  el: $('#feed'),

  events: {
    'click .pending-button': 'showPendingMessages',
    'receiveMessage': 'receiveMessage'

  },

  initialize: function() {
    this.pendingMessages = new MessageCollection();
    this.messages = new MessageCollection();

    _.bindAll(this, 'render');
    return this;
  },

  render: function() {
    this.messages.each(this.addMessage);
  },

  /**
   * Update and show or hide the pending-messages button
   */

  updatePendingButton: function() {
    var numPending = this.pendingMessages.length;
    var button = $('.pending-button');
    button.text = numPending +
                  " new message" +
                  ((numPending !== 1) ? 's' : '');
    numPending ? button.show() : button.hide();
  },

  /**
   * Add a message to the pending messages list
   */

  receiveMessage: function(message) {
    this.pendingMessages.add(new Message(message));
    self.updatePendingButton();
  },

  /**
   * Reveal all pending messages 
   */

  showPendingMessages: function() {
    this.pendingMessages.each(this.addMessage);

    // Clear out the pending messages queue
    this.pendingMessages = new MessageCollection();
    self.updatePendingButton();
  },

  /**
   * Add a message to the messages collection
   * and display the message
   */

  addMessage: function(message) {
    this.messages.add(message);
    this.displayMessage(message);
  },

  displayMessage: function(message) {
    var view = new MessageView({model: message});
    $(this.el).append(view.render().el);
  },
});

var Application = Backbone.Model.extend({});

var ApplicationView = Backbone.View.extend({
  model: Application,

  el: $('#content'),

  initialize: function() {
    this.feedView = new FeedView();
    console.log("init");
    console.log(this.feedView);

    _.bindAll(this, 'render');

    this.socket = io.connect();
    var self = this;
    this.socket.on('message', function(data) {
      self.handleMessage(data);
    });
    this.socket.json.send({join: true});

    return this;
  },

  render: function() {
    return this;
  },

  events: {
    'click #submit': 'sendMessage'
  },

  handleMessage: function(data) {
    if ('buffer' in data) {
      var i;
      for (i in data.buffer) {
        this.feedView.addMessage(data.buffer[i]);
      }
    }
    else if ('message' in data) {
      this.feedView.receiveMessage(data.message);
    }
  },

  sendMessage: function(event) {
    console.log("send message: " + $("#input").value());
    $("#input").value("");
  }
});


/*
 * init off collection
 * emit messages from application
 */


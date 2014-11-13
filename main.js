/* This is the MyApp constructor. */
function MyApp() {
  this.userAgentDiv = document.getElementById('user-agent');
  this.remoteMedia = document.getElementById('remote-media');

  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);

  this.terminateButton = document.getElementById('terminate-button');
  this.terminateButton.addEventListener('click', this.terminateSession.bind(this), false);
}

/* This is the MyApp prototype. */
MyApp.prototype = {

  createUA: function () {
    this.ua = new SIP.UA();
  },

  sendInvite: function () {
    var session = this.ua.invite('welcome@onsip.com', this.remoteMedia);

    this.setSession(session);
    this.inviteButton.disabled = true;
  },

  setSession: function (session) {
    session.on('progress', function () {
      this.setStatus('progress', true);
    }.bind(this));

    session.on('accepted', function () {
      this.setStatus('accepted', true);
    }.bind(this));

    session.on('failed', function () {
      this.setStatus('failed', false);
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

    session.on('bye', function () {
      this.setStatus('bye', false);
      if (session === this.session) {
        delete this.session;
      }
    }.bind(this));

    this.session = session;
  },

  setStatus: function (status, disable) {
    this.inviteButton.innerHTML = status;
    this.inviteButton.disabled = disable;
    this.terminateButton.disabled = !disable;
  },

  terminateSession: function () {
      if (!this.session) { return; }

      this.session.terminate();
  },

};

var MyApp = new MyApp();
MyApp.createUA();

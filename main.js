/* This is the MyApp constructor. */
function MyApp() {
  this.userAgentDiv = document.getElementById('user-agent');
  this.remoteMedia = document.getElementById('remote-media');

  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);

  this.terminateButton = document.getElementById('terminate-button');
  this.terminateButton.addEventListener('click', this.terminateSession.bind(this), false);

  document.addEventListener('keydown', function (e) {
    this.sendDTMF(String.fromCharCode(e.keyCode));
  }.bind(this), false);
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
      delete this.session;
    }.bind(this));

    session.on('bye', function () {
      this.setStatus('bye', false);
      delete this.session;
    }.bind(this));

    session.on('refer', session.followRefer(function (req, newSession) {
      this.setStatus('refer', true);
      this.setSession(newSession);
    }.bind(this)));

    this.session = session;
  },

  setStatus: function (status, disable) {
    this.userAgentDiv.className = status;
    this.inviteButton.disabled = disable;
  },

  terminateSession: function () {
    if (!this.session) { return; }

    this.session.terminate();
  },

  sendDTMF: function (tone) {
    if (this.session) {
      this.session.dtmf(tone);
    }
  },

};

var MyApp = new MyApp();
MyApp.createUA();

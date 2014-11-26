/* This is the MyApp constructor. */
function MyApp() {
  this.userAgentDiv = document.getElementById('user-agent');
  this.remoteMedia = document.getElementById('remote-media');
  this.remoteMedia.volume = 0.5;

  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);

  this.terminateButton = document.getElementById('terminate-button');
  this.terminateButton.addEventListener('click', this.terminateSession.bind(this), false);

  document.addEventListener('keydown', function (e) {
    this.sendDTMF(String.fromCharCode(e.keyCode));
  }.bind(this), false);

  this.volumeUp = document.getElementById('volume-up');
  this.volumeUp.addEventListener('click', this.raiseVolume.bind(this), false);

  this.volumeDown = document.getElementById('volume-down');
  this.volumeDown.addEventListener('click', this.lowerVolume.bind(this), false);

  this.muteButton = document.getElementById('mute-button');
  this.muteButton.addEventListener('click', this.toggleMute.bind(this), false);
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

  raiseVolume: function () {
    this.volumeDown.disabled = false;

    /* If volume is very high, jump to max to avoid rounding errors. */
    if (this.remoteMedia.volume >= .85) {
      this.remoteMedia.volume = 1;
      this.volumeUp.disabled = true;
    } else {
      this.remoteMedia.volume += .1;
    }
  },

  lowerVolume: function () {
    this.volumeUp.disabled = false;

    /* If volume is very low, jump to min to avoid rounding errors. */
    if (this.remoteMedia.volume <= .15) {
      this.remoteMedia.volume = 0;
      this.volumeDown.disabled = true;
    } else {
      this.remoteMedia.volume -= .1;
    }
  },

  toggleMute: function () {
    if (!this.session) { return; }

    if (this.muteButton.classList.contains('on')) {
      this.session.unmute();
      this.muteButton.classList.remove('on');
    } else {
      this.session.mute();
      this.muteButton.classList.add('on');
    }
  },

};

var MyApp = new MyApp();
MyApp.createUA();

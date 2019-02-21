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

  this.volumeRange = document.getElementById('volume-range');
  this.volumeRange.addEventListener('change', this.setVolume.bind(this), false);

  this.muteButton = document.getElementById('mute-button');
  this.muteButton.addEventListener('click', this.toggleMute.bind(this), false);
}

/* This is the MyApp prototype. */
MyApp.prototype = {

  createUA: function (options) {
    options = options || {};
    options.media = options.media || {};
    options.media.remote = options.media.remote || {};
    options.media.remote.video = this.remoteMedia;
    options.media.remote.audio = this.remoteMedia;
    this.simple = new SIP.Web.Simple(options);
  },

  sendInvite: function () {
    var session = this.simple.call('welcome@onsip.com');

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

    this.session = session;
  },

  setStatus: function (status, disable) {
    this.userAgentDiv.className = status;
    this.inviteButton.disabled = disable;
    this.terminateButton.disabled = !disable;
  },

  terminateSession: function () {    
    this.simple.hangup();
  },

  sendDTMF: function (tone) {
    this.simple.sendDTMF(tone);
  },

  setVolume: function () {
    console.log('Setting volume:', this.volumeRange.value, parseInt(this.volumeRange.value, 10));
    this.remoteMedia.volume = (parseInt(this.volumeRange.value, 10) || 0) / 100;
  },

  toggleMute: function () {
    if (this.muteButton.classList.contains('on')) {
      this.simple.unmute();
      this.muteButton.classList.remove('on');
    } else {
      this.simple.mute();
      this.muteButton.classList.add('on');
    }
  },

};

var MyApp = new MyApp();
MyApp.createUA({
  ua: {
    traceSip: true
  }
});

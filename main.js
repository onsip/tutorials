/* This is the MyApp constructor. */
function MyApp() {
  this.addressInput = document.getElementById('address-input');
  this.passwordInput = document.getElementById('password-input');
  this.identityForm = document.getElementById('identity-form');
  this.identityForm.addEventListener('submit', function (e) {
    e.preventDefault();
    this.requestCredentials();
  }.bind(this), false);

  this.userAgentDiv = document.getElementById('user-agent');
  this.remoteMedia = document.getElementById('remote-media');
  this.remoteMedia.volume = 0.5;

  this.destinationInput = document.getElementById('destination-input');
  this.inviteButton = document.getElementById('invite-button');
  this.inviteButton.addEventListener('click', this.sendInvite.bind(this), false);

  this.acceptButton = document.getElementById('accept-button');
  this.acceptButton.addEventListener('click', this.acceptSession.bind(this), false);

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

  requestCredentials: function () {
    var xhr = new XMLHttpRequest();
    xhr.onload = this.setCredentials.bind(this);
    xhr.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');

    var userPass = this.addressInput.value + ':' + this.passwordInput.value;
    xhr.setRequestHeader('Authorization',
                         'Basic ' + btoa(userPass));
    xhr.send();
  },

  setCredentials: function (e) {
    var xhr = e.target;
    var user, credentials;

    if (xhr.status === 200) {
      user = JSON.parse(xhr.responseText).Response.Result.UserRead.User;
      credentials = {
        uri: this.addressInput.value,
        authorizationUser: user.AuthUsername,
        password: user.Password,
        displayName: user.Contact.Name
      };
    } else {
      alert('Authentication failed! Proceeding as anonymous.');
      credentials = {};
    }

    this.createUA(credentials);
  },

  createUA: function (credentials) {
    this.identityForm.style.display = 'none';
    this.userAgentDiv.style.display = 'block';
    this.simple = new SIP.Web.Simple({
      ua: credentials,
      media: {
        remote: {
          video: this.remoteMedia,
          audio: this.remoteMedia
        }
      }
    });

    this.simple.on('ringing', this.handleInvite.bind(this));
  },

  handleInvite: function (session) {
    this.setSession(session);

    this.setStatus('Ring Ring! ' + session.remoteIdentity.uri.toString() + ' is calling!', true);
    this.acceptButton.disabled = false;
  },

  acceptSession: function () {

    this.acceptButton.disabled = true;
    this.simple.answer();
  },

  sendInvite: function () {
    var destination = this.destinationInput.value;
    if (!destination) { return; }

    var session = this.simple.call(destination);

    this.setSession(session);
    this.inviteButton.disabled = true; // TODO - use setStatus. Disable input, too?
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
      this.acceptButton.disabled = true;
      delete this.session;
    }.bind(this));

    session.on('bye', function () {
      this.setStatus('bye', false);
      this.acceptButton.disabled = true;
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

// 2.
var identityForm = document.getElementById('identity');
var address = document.getElementById('address');
var password = document.getElementById('password');
var authButton = document.getElementById('auth');
var ua;
var session;

var destination = document.getElementById('destination'); // 1.
var inviteButton = document.getElementById('invite');
var remoteMedia = document.getElementById('remote');
remoteMedia.volume = 0.5;

identityForm.addEventListener('submit', function (e) {
  e.preventDefault();

  var xhr = new XMLHttpRequest();
  xhr.onload = authHandler;
  xhr.open('get', 'https://api.onsip.com/api/?Action=UserRead&Output=json');
  xhr.setRequestHeader('Authorization',
                       'Basic ' +
                       btoa(address.value + ':' + password.value));
  xhr.send();
}, false);

function authHandler(e) {
  var xhr = e.target;
  var user, credentials;

  if (xhr.status === 200) {
    user = JSON.parse(xhr.responseText).Response.Result.UserRead.User;
    credentials = {
      uri: address.value,
      authorizationUser: user.AuthUsername,
      password: user.Password,
      displayName: user.Contact.Name,
      traceSip: true
    };

    var media = { remote: { audio: remoteMedia, video: remoteMedia } };
    
    ua = new SIP.Web.Simple({
      ua: credentials,
      media: media
    });
  } else {
    // Authentication failed.  Be anonymous.
    alert('Authentication failed! Proceeding as anonymous.');
    ua = new SIP.UA({ ua: { traceSip: true }, media: media });
  }

  identityForm.style.display = 'none';

  // 3.
  ua.on('ringing', function (s) {
    session = s;
    addListeners();
    ua.answer();
  });
}


// 1.
inviteButton.addEventListener('click', function () {
  if (!destination.value) { return; }

  inviteButton.disabled = true;

  session = ua.call(destination.value);

  addListeners();
}, false);


function addListeners() {
  // TODO - This is being simplified next version.

  // Let's get some status events.
  session.on('progress', function () {
    inviteButton.innerHTML = 'Ringing...';
  });

  session.on('accepted', function () {
    inviteButton.innerHTML = 'Connected!';
  });

  session.on('failed', function () {
    inviteButton.innerHTML = 'Call failed. Try again?';
    inviteButton.disabled = false;
  });

  session.on('bye', function () {
    if (session === this) {
      inviteButton.innerHTML = 'Bye! Invite Another?';
      inviteButton.disabled = false;
      session = null;
    }
  }.bind(session));

  session.on('refer', session.followRefer(function (request, newSession) {
    inviteButton.innerHTML = 'Ringing...';
    inviteButton.disabled = true;
    session = newSession;
    addListeners();
  }));
}

document.addEventListener('keydown', function (e) {
  var dtmfTone = String.fromCharCode(e.keyCode);
  
  if (ua) {
    ua.sendDTMF(dtmfTone);
  }
}, false);

var volumeUp = document.getElementById('volume-up');
var volumeDown = document.getElementById('volume-down');
volumeUp.addEventListener('click', function () {
  var old = remoteMedia.volume;
  volumeDown.disabled = false;
  if (remoteMedia.volume >= .85) {
    remoteMedia.volume = 1;
    volumeUp.disabled = true;
  } else {
    remoteMedia.volume += .1;
  }

  console.log('from: ', old, ' -> ', remoteMedia.volume);
}, false);

volumeDown.addEventListener('click', function () {
  var old = remoteMedia.volume;
  volumeUp.disabled = false;
  if (remoteMedia.volume <= .15) {
    remoteMedia.volume = 0;
    volumeDown.disabled = true;
  } else {
    remoteMedia.volume -= .1;
  }
  console.log('from: ', old, ' -> ', remoteMedia.volume);
}, false);

var mute = document.getElementById('mute');
mute.addEventListener('click', function () {
  if (mute.classList.contains('on')) {
    ua.unmute();
    mute.classList.remove('on');
  } else {
    ua.mute();
    mute.classList.add('on');
  }
}, false);

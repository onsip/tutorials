// 2.
var identityForm = document.getElementById('identity');
var address = document.getElementById('address');
var password = document.getElementById('password');
var authButton = document.getElementById('auth');
var ua;
var session;

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

    ua = new SIP.UA(credentials);
  } else {
    // Authentication failed.  Be anonymous.
    alert('Authentication failed! Proceeding as anonymous.');
    ua = new SIP.UA({ traceSip: true });
  }

  identityForm.style.display = 'none';

  // 3.
  ua.on('invite', function (s) {
    if (session) {
      s.reject();
      return;
    }
    session = s;
    addListeners();
    s.accept({
      media: {
        constraints: { audio: true, video: true },
        render: {
          remote: {
            video: remoteMedia
          }
        }
      }
    }); // TODO - real UI.
  });
}


var destination = document.getElementById('destination'); // 1.
var inviteButton = document.getElementById('invite');
var remoteMedia = document.getElementById('remote');
remoteMedia.volume = 0.5;


// 1.
inviteButton.addEventListener('click', function () {
  if (!destination.value) { return; }

  inviteButton.disabled = true;

  session = ua.invite(destination.value, {
    media: {
      constraints: { audio: true, video: true },
      render: {
        remote: {
          video: remoteMedia
        }
      }
    }
  });

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

  if (session) {
    session.dtmf(dtmfTone);
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
  if (!session) { return; }

  if (mute.classList.contains('on')) {
    session.unmute();
    mute.classList.remove('on');
  } else {
    session.mute();
    mute.classList.add('on');
  }
}, false);

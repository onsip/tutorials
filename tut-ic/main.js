// 4. Create a user agent and connect.
var ua = new SIP.UA({ traceSip: true });
var inviteButton = document.getElementById('invite');
var remoteMedia = document.getElementById('remote');
remoteMedia.volume = 0.5;
var session;

// 5. Send invite on button click.
inviteButton.addEventListener('click', function () {
  inviteButton.disabled = true;
  session = ua.invite('welcome@onsip.com', {
    media: {
      constraints: { audio: true, video: false },
      render: {
        remote: {
          audio: remoteMedia
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
    inviteButton.innerHTML = 'Bye! Invite Another?';
    inviteButton.disabled = false;
  });

  session.on('refer', session.followRefer(function (request, newSession) {
    inviteButton.innerHTML = 'Ringing...';
    inviteButton.disabled = true;
    session = newSession;
    addListeners();
  }));
}

  // 6. Keyboard input for DTMF.
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
// 4. Create a user agent and connect.
var inviteButton = document.getElementById('invite');
var remoteMedia = document.getElementById('remote');
var ua = new SIP.Web.Simple({
  ua: {
    traceSip: true
  },
  media: {
    remote: {
      audio: remoteMedia
    }
  }
});
remoteMedia.volume = 0.5;
var session;

// 5. Send invite on button click.
inviteButton.addEventListener('click', function () {
  inviteButton.disabled = true;
  session = ua.call('welcome@onsip.com');

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
}

  // 6. Keyboard input for DTMF.
document.addEventListener('keydown', function (e) {
  var dtmfTone = String.fromCharCode(e.keyCode);

  ua.sendDTMF(tone);
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

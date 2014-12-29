var demoToken;

/* Get the demoToken */
if (!window.localStorage) { return; }

try {
  demoToken = localStorage.getItem('demoToken');
} catch(e) {}

if (!demoToken || !(/^[a-zA-Z0-9]{6}$/).test(demoToken)) { return; }

MyApp.sendInvite = function () {
    var session = this.ua.invite('front-b-instaphone.' + demoToken + '@disuo.onsip.com', this.remoteMedia);

    this.setSession(session);
    this.inviteButton.disabled = true;
}

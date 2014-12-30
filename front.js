(function () {
  var demoToken;

  /* Get the demoToken */
  if (!window.localStorage) { return; }

  try {
    demoToken = localStorage.getItem('demoToken');
  } catch(e) {}

  if (!demoToken || !(/^[a-zA-Z0-9]{6}$/).test(demoToken)) { return; }

  /* Replace the Invite button with our special invite button */
  var el = document.getElementById('invite-button');
  var new_el = el.cloneNode(true);
  el.parentNode.replaceChild(new_el,el);

  new_el.addEventListener('click', function () {
    var session = this.ua.invite('front-b-instaphone.' + demoToken + '@disuo.onsip.com', this.remoteMedia);

    this.setSession(session);
    this.inviteButton.disabled = true;
  }.bind(MyApp), true);
}());

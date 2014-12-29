(function () {
  var demoToken;

  /* Get the demoToken */
  if (!window.localStorage) { return; }

  try {
    demoToken = localStorage.getItem('demoToken');
  } catch(e) {}

  if (!demoToken || !(/^[a-zA-Z0-9]{6}$/).test(demoToken)) { return; }

  /* "Log in" */
  MyApp.createUA({
    uri: 'front-b-instaphone.' + demoToken + '@disuo.onsip.com',
    traceSip: true
  });
}());

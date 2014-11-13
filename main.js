/* This is the MyApp constructor. */
function MyApp() {

}

/* This is the MyApp prototype. */
MyApp.prototype = {

  createUA: function () {
    this.ua = new SIP.UA();
  },

};

var MyApp = new MyApp();
MyApp.createUA();

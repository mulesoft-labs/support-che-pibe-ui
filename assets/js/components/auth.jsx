var googleOAuth2;

module.exports = {
  login(cb) {
    // TODO: This should revalidate the token stored in localStorage
    if (! googleOAuth2) {
      initGoogleAuth2()
    }
    if (! googleOAuth2.isSignedIn.get()) {
      googleOAuth2.signIn().then(function() {
        var profile = googleOAuth2.currentUser.get().getBasicProfile();
        $.ajax({
          type: "POST",
          url: process.env.AUTH_BASEURI + '/authorize',
          data: {
              email: profile.getEmail(),
              googleid: profile.getId(),
          },
          dataType: 'json',
          cache: false,
          success: function(data) {
            const user = {
              id: profile.getId(),
              realname: profile.getName(),
              imageUrl: profile.getImageUrl(),
              email: profile.getEmail(),
              jwt: data,
            };
            localStorage.token = data;
            if (cb) cb(user);
          },
          error: function(data) {
            googleOAuth2.disconnect();
            delete localStorage.token;
            if (cb) cb()
          }
        })
      })
    } else {
      var profile = googleOAuth2.currentUser.get().getBasicProfile();
      $.ajax({
        type: "POST",
        url: process.env.AUTH_BASEURI + '/authorize',
        data: {
            email: profile.getEmail(),
            googleid: profile.getId(),
        },
        dataType: 'json',
        cache: false,
        success: function(data) {
          const user = {
            id: profile.getId(),
            realname: profile.getName(),
            imageUrl: profile.getImageUrl(),
            email: profile.getEmail(),
            jwt: data,
          }
          localStorage.token = data;
          user.jwt = data;
          if (cb) cb(user);
        },
        error: function(data) {
          googleOAuth2.disconnect();
          delete localStorage.token;
          if (cb) cb();
        }
      })
    }
  },

  updateToke(newToken) {
    console.log('update token '+ newToken);
    if (newToken!=='') {
      localStorage.token = newToken;
    }
  },

  logout(cb) {
    console.log('googleOAuth2 logout');
    googleOAuth2.disconnect().then(function () {
      delete localStorage.token
      if (cb) cb()
    })
  },

  loggedIn() {
    return !!localStorage.token
  },
}

function initGoogleAuth2() {
  gapi.load('auth2', function() {
    googleOAuth2 = gapi.auth2.init({
      client_id: '1023673456154-pu3inpn0aoinmvjvtj7sg2o8v0bmucac.apps.googleusercontent.com',
      scope: 'profile',
    })
  })
}

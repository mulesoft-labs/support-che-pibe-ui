import { EventEmitter } from "events";

import dispatcher from "../dispatcher.jsx";

class SessionStore extends EventEmitter {
  constructor() {
    super()
    this.loggedIn = false;
    this.user = {};
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  getImageUrl() {
    return this.user.imageUrl;
  }

  getUserName() {
    return this.user;
  }

  handleActions(action) {
    switch(action.type) {
      case "SESSION_LOGIN": {
        if (action.user) {
          this.loggedIn = true;
          this.user = action.user;
        } else {
          this.loggedIn = false;
          this.user = {};
        }
        this.emit("user_change", this.user);
        break;
      }
      case "SESSION_LOGOUT": {
        this.loggedIn = false;
        this.user = {};
        this.emit("user_change", this.user);
        break;
      }
    }
  }
}

const sessionStore = new SessionStore;
dispatcher.register(sessionStore.handleActions.bind(sessionStore));

export default sessionStore;

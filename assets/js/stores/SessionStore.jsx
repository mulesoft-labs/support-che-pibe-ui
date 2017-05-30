import { EventEmitter } from "events";

import dispatcher from "../dispatcher.jsx";
import jwt from "jsonwebtoken";

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
    return this.user.realname;
  }

  getRoles() {
    return this.user.roles;
  }

  getSalesforceId() {
    return this.user.salesforceuser;
  }

  getEmail() {
    return this.user.email;
  }

  handleActions(action) {
    switch(action.type) {
      case "SESSION_LOGIN": {
        if (action.user) {
          this.loggedIn = true;
          let decoded = jwt.decode(action.user.jwt);
          this.user = decoded;
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

import dispatcher from "../dispatcher.jsx";

export function login(user) {
  dispatcher.dispatch({
    type: "SESSION_LOGIN",
    user,
  });
}

export function logout() {
  dispatcher.dispatch({
    type: "SESSION_LOGOUT"
  });
}

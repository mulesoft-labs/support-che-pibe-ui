import React from "react";
import ReactDOM from "react-dom";
import { browserHistory, Router, Route, Link, withRouter, IndexRoute } from 'react-router'

import App from "./components/App.jsx";
import Login from "./components/Login.jsx";
import Logout from "./components/Logout.jsx";
import DispatcherHistory from "./components/DispatcherHistory.jsx";
import Objectives from "./components/Objectives.jsx";
import SlackCommands from "./components/SlackCommands.jsx";
import HomeScreen from "./components/Home.jsx";

import SessionStore from "./stores/SessionStore.jsx";

const app = document.getElementById('app');

ReactDOM.render(
  <div>
    <Router history={browserHistory}>
      <Route path="/ui/" component={App}>
        <IndexRoute component={HomeScreen}></IndexRoute>
        <Route path="/ui/slackcommands" component={SlackCommands} onEnter={requireAuth} />
        <Route path="/ui/login" component={Login} />
        <Route path="/ui/logout" component={Logout} />
        <Route path="/ui/dispatcherhistory" component={DispatcherHistory} onEnter={requireAuth} />
        <Route path="/ui/objectives" component={Objectives} onEnter={requireAuth} />
      </Route>
    </Router>
  </div>
, app);

function requireAuth(nextState, replace) {
  if (! SessionStore.isLoggedIn()) {
    replace({
      pathname: '/ui/login',
      state: { nextPathname: nextState.location.pathname }
    })
  }
}

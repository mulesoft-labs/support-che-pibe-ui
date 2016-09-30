import React from "react";
import { Link } from "react-router";
import SessionStore from "../stores/SessionStore.jsx";
//import * as SessionActions from "../actions/SessionActions.jsx";

export default class Header extends React.Component {
  constructor() {
    super();
    this.changeUser = this.changeUser.bind(this);
    this.state = {
      loggedIn: SessionStore.isLoggedIn(),
      imageUrl: "",
    };
  }

  changeUser(user) {
    if (! $.isEmptyObject(user)) {
      this.setState({
        loggedIn: true,
        imageUrl: user.imageUrl,
      });
    } else {
      this.setState({
        loggedIn: false,
        imageUrl: "",
      });
    }
  }

  componentWillMount() {
    SessionStore.on("user_change", this.changeUser);
  }

  componentWillUnmount() {
    SessionStore.removeListener("user_change", this.changeUser);
  }

  render() {
    return (
        <div class="header-wrap">
          <div class="container">
            <div class="logo">
              <h1>Che'Pibe</h1>
            </div>
            <nav class="main-bar navbar navbar-default">
              {(this.state.loggedIn) ? (<img class="profile_image" src={this.state.imageUrl} />) : ("")}
              <div class="container-fluid">
                <div class="collapse navbar-collapse">
                  {this.state.loggedIn ? (
                    <ul class="nav navbar-nav">
                      <li class="darker"><Link to="/ui/logout">Log out</Link></li>
                      <li><Link to="/ui/slackcommands">Slack Commands</Link></li>
                      <li><Link to="/ui/dispatcherhistory">Dispatcher History</Link></li>
                      <li><Link to="/ui/objectives">Objectives</Link></li>
                    </ul>
                  ) : (
                    <ul class="nav navbar-nav">
                      <li><Link to="/ui/login">Login</Link></li>
                    </ul>
                  )}
                </div>
              </div>
            </nav>
            <div class="header-smile">
              <img src="images/smile.png" alt="image"/>
            </div>
          </div>
        </div>
      )
    }
  }

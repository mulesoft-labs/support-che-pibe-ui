import React from 'react'
import Header from './Header.jsx'
import SessionStore from "../stores/SessionStore.jsx";

export default class App extends React.Component {
  constructor() {
    super();
    this.getSession = this.getSession.bind(this);
    this.state = {
      loggedIn: SessionStore.isLoggedIn(),
    };
  }

  getSession() {
    this.setState({
      loggedIn: SessionStore.isLoggedIn(),
    });
  }

  componentWillMount() {
    SessionStore.on("user_change", this.getSession);
  }

  componentWillUnmount() {
    SessionStore.removeListener("user_change", this.getSession);
  }

  render() {
    return (
      <div>
        <Header />
        <div class="container">
          {this.props.children ||
            <p>You are {!this.state.loggedIn && 'not'} logged in.</p>
          }
        </div>
      </div>
    )
  }
}

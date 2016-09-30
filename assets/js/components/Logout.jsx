import React from 'react'
import auth from './auth.jsx'
import { withRouter } from 'react-router'

import * as SessionActions from "../actions/SessionActions.jsx";
import SessionStore from "../stores/SessionStore.jsx";

class Logout extends React.Component {
  constructor() {
    super();
    this.redirect = this.redirect.bind(this);
  }

  componentDidMount() {
    auth.logout((user) => {
      SessionActions.logout();
    })
  }

  redirect() {
    const { location } = this.props;
    this.props.router.replace('/ui/')
  }

  componentWillMount() {
    SessionStore.on("user_change", this.redirect);
  }

  componentWillUnmount() {
    SessionStore.removeListener("user_change", this.redirect);
  }

  render() {
    return <p>Logging out...</p>
  }
}

export default withRouter(Logout);

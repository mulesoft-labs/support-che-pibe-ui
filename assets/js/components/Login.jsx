import React from 'react'
import { withRouter } from 'react-router'
import auth from './auth.jsx'

import * as SessionActions from "../actions/SessionActions.jsx";
import SessionStore from "../stores/SessionStore.jsx";

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      currently: 'logging',
    }
    this.redirect = this.redirect.bind(this);
  }

  componentDidMount() {
    auth.login((user) => {
      SessionActions.login(user);
    })
  }

  redirect(user) {
    if (! $.isEmptyObject(user)) {
      this.setState({
        currently: 'logged',
      });
      const { location } = this.props;
      if (location.state && location.state.nextPathname) {
        this.props.router.replace(location.state.nextPathname)
      } else {
        this.props.router.replace('/ui/')
      }
    } else {
      this.setState({
        currently: 'failed',
      });
      this.props.router.replace('/ui/')
    }
  }

  componentWillMount() {
    SessionStore.on("user_change", this.redirect);
  }

  componentWillUnmount() {
    SessionStore.removeListener("user_change", this.redirect);
  }

  render() {
    if (this.state.currently === 'logged') {
      return (
        <p>Welcome</p>
      )
    } else if (this.state.currently === 'failed') {
      return (
        <p>You are not authorized.</p>
      )
    } else {
      return (
        <p><i class="step-active-indicator fa fa-spinner fa-spin"></i> Logging in...</p>
      )
    }
  }
}

export default withRouter(Login);

import React from 'react';
import { Link } from "react-router";
import SessionStore from "../stores/SessionStore.jsx";
import ReactToastr from "react-toastr";

export default class MainScreen extends React.Component {
    constructor() {
      super();
      this.state = {
        loggedIn: SessionStore.isLoggedIn(),
        realname: "",
      };
      this.changeUser = this.changeUser.bind(this);
    }

    changeUser(user) {
      if (! $.isEmptyObject(user)) {
        this.setState({
          loggedIn: true,
          realname: user.imageUrl,
        });
      } else {
        this.setState({
          loggedIn: false,
          realname: "",
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
        if (this.state.loggedIn) {
            return (
            <div className="container">
                <div className="row">
                    <h1>Welcome {this.state.realname}</h1>
                </div>
            </div>
            )
        } else {
            return (
                <div className="container">
                    <div className="row">
                        <p className="text-center">Portal only available for Support engineering. Please <Link to="/ui/login">login</Link>.</p>
                    </div>
                </div>
            )
        }
    }
}

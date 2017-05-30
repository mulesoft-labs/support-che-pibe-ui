import React from 'react';
import SessionStore from "../stores/SessionStore.jsx";

class MetricsQueueStats extends React.Component {

  constructor() {
    super();
    this.state = {
      loading: true,
      data: {
        wosupport_cnt: 0,
        wocustomer_cnt: 0,
        jira_verification_cnt: 0,
        woengineering_cnt: 0,
        wointernal_cnt: 0,
        due_date_cnt: 0,
        closed_cnt: 0,
        solution_offered_cnt: 0,
        wosupport_cnt: 0,
        daydate: ''
      },
      cases: [],
    };
  }

  componentWillMount() {
    $.ajax({
      url: process.env.API_BASEURI + '/metrics/' + this.props.email + '/queuestats',
      type : 'GET',
      crossDomain: true,
      headers: {
        'token': localStorage.token
      },
      dataType: 'json',
      cache: false,
      success: function(data, status, req) {
        this.setState({
          data: data,
          loading: false,
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({
          loading: false,
        });
        console.error(process.env.API_BASEURI + '/metrics/' + this.props.email + '/queuestats', status, err.toString());
      }.bind(this)
    });
  }

  render() {
      if (this.state.loading > 0) {
        return (
          <div class="row">
            <h2>Queue Stats</h2>
          </div>
        )
      } else {
        return (
          <div class="row">
            <h2>Queue Stats | Date {this.state.data.daydate}</h2>
            <h3>Cases Open</h3>
            <ul class="list-group">
              <li class="list-group-item">On Support <strong>{this.state.data.wosupport_cnt}</strong></li>
              <li class="list-group-item">More info required <strong>{this.state.data.wocustomer_cnt}</strong></li>
              <li class="list-group-item">Solution Offered <strong>{this.state.data.solution_offered_cnt}</strong></li>
              <li class="list-group-item">On Internal Team <strong>{this.state.data.wointernal_cnt}</strong></li>
              <li class="list-group-item">On Enginnering <strong>{this.state.data.woengineering_cnt}</strong></li>
            </ul>
            <h3>Cases Closed</h3>
            <ul class="list-group">
              <li class="list-group-item">Closed <strong>{this.state.data.closed_cnt}</strong></li>
            </ul>
            <h3>Pending Actions</h3>
            <ul class="list-group">
              <li class="list-group-item">To Verify <strong>{this.state.data.jira_verification_cnt}</strong></li>
              <li class="list-group-item">To update today <strong>{this.state.data.due_date_cnt}</strong></li>
            </ul>
          </div>
        )
    }
  }

}

export default class Objectives extends React.Component {

  constructor() {
    super();
    this.getSession = this.getSession.bind(this);
    this.state = {
      user: {
        name: SessionStore.getUserName(),
        sfdcId: SessionStore.getSalesforceId(),
        email: SessionStore.getEmail(),
      },
    };
  }

  getSession() {
    this.setState({
      name: SessionStore.getUserName(),
      sfdcId: SessionStore.getSalesforceId(),
      email: SessionStore.getEmail(),
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
      <div class="row">
        <h1>Objectives & Metrics</h1>
        <MetricsQueueStats email={this.state.user.email} />
      </div>
    )
  }
}

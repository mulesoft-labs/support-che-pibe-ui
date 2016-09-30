import React from 'react';
import auth from './auth.jsx'

export class SlackCommand extends React.Component {
  render() {
    return (<div key={this.props.command} class="box col-md-4">
      <div class="panel">
        <h1>{ this.props.command }</h1>
        <p>{ this.props.description }</p>
      </div>
    </div>);
  }
}

function textToColor(str) { // java String#hashCode
    var colors = ["0074D9","3D9970", "6F851B", "F012BE", "FF851B", "B10DC9", "85144b"];
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
    // var c = (hash & 0x00FFFFFF)
    //     .toString(16)
    //     .toUpperCase();
    // return ("00000".substring(0, 6 - c.length) + c).replace("F","8").replace("E","8");
}

export class AutomaticNotification extends React.Component {
  render() {
    var howviewitNodes = this.props.howviewit.map(function(data) {
      var spanStyle = {
        backgroundColor: "#" + textToColor(data)
      }
      return (<p key={data}><span class="badge" style={spanStyle}>{data}</span></p>);
    });

    return (
      <div class="box col-md-6">
        <div class="panel">
          <h1>{ this.props.name }</h1>
          <p>{ this.props.description }</p>
          { howviewitNodes }
        </div>
      </div>);
  }
}

export default class SlackCommands extends React.Component {
    constructor() {
      super();
      this.state = {
        slackcommands: [],
        notifications: [
          {
            "name": "New cases",
            "description": "The current dispatcher get a personal notification for every new case that arrive to Support queue.",
            "howviewit": [
              "CURRENT DISPATCHER",
            ]
          },
          {
            "name": "Pending New cases",
            "description": "When you became the dispatcher (/dispatch command). You'll receive a list of current New cases in the Support queue. Shame on previous dispatcher!.",
            "howviewit": [
              "CURRENT DISPATCHER",
            ]
          },
          {
            "name": "New S1s",
            "description": "Support channel receives a notification when a new S1 case arrive. It has a special line when the phase=Development.",
            "howviewit": [
              "#SUPPORT",
            ]
          },
          {
            "name": "State Farm cases",
            "description": "Support channel receives a notification when State Farm cases are unassigned in the Support queue.",
            "howviewit": [
              "#SUPPORT",
            ]
          },
          {
            "name": "HSBC S1 cases",
            "description": "Support channel and case owner receive a notification when HSBC cases doesn't receive an update in the last hour.",
            "howviewit": [
              "SUPPORT CHANNEL",
              "CASE OWNER",
            ]
          },
          {
            "name": "Initial comment SLA break",
            "description": "When a standard SLA is close to be break, the support channel receive a notification.",
            "howviewit": [
              "#SUPPORT",
            ]
          },
        ],
      };
    }

    componentWillMount() {
      $.ajax({
        url: process.env.API_BASEURI + '/slack-commands',
        type : 'GET',
        headers: {
          'token': localStorage.token
        },
        dataType: 'json',
        cache: false,
        success: function(data, status, req) {
          this.setState({slackcommands: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(process.env.API_BASEURI + '/slack-commands', status, err.toString());
        }.bind(this)
      });
    }

    render() {
      if (this.state.slackcommands.length > 0) {
        var scNodes = this.state.slackcommands.map(function(data) {
          return (<SlackCommand key={data.command} command={data.command} description={ data.description }/>);
        });
        var anNodes = this.state.notifications.map(function(data) {
          return (<AutomaticNotification key={data.name} name={data.name} howviewit={data.howviewit} description={ data.description }/>);
        });
        return (<div class="row">
            <h1>Slack integration</h1>
            <div class="col-md-12">
              <h2>Imperative commands</h2>
            </div>
            <div>
              {scNodes}
            </div>
            <div class="col-md-12">
              <h2>Automatic notifications</h2>
            </div>
            <div>
              {anNodes}
            </div>
          </div>);
      } else {
        return (<div className="container"><div className="row"><p className="text-center">Loading...</p></div></div>)
      }
    }
}

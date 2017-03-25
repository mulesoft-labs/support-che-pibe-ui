import React from 'react'
import _ from 'lodash'

class DispatcherHistoryListItem extends React.Component {
  render() {
    const {shiftLenght, region, dispatcher, readableStartDate, readableEndDate} = this.props;
    return (
      <div class="dispatcher-item col-md-12">
        <span class={"flag-icon flag-icon-"+region} ></span>
        <b> {shiftLenght} </b>
        <i> {dispatcher} </i>
        <small>[ {readableStartDate} - {readableEndDate} ]</small>
      </div>
    )
  }
}

class DispatcherSummaryListItem extends React.Component {
  render() {
    const {readableLapse, region, dispatcher, totalMinutes} = this.props;
    return (
      <div class="dispatcher-item col-md-12">
        <span class={"flag-icon flag-icon-"+region} ></span>
        <b> {readableLapse} </b>
        <i> {dispatcher} </i>
        <small>[ {totalMinutes} minutes ]</small>
      </div>
    )
  }
}

class DispatcherSummaryList extends React.Component {
  render() {
    const {list} = this.props;
    if (list.length>0) {
      const dhnodes = list.map((data)=>{
        const diffHrs = Math.floor(data.total_minutes / 60); // hours
        const diffMins = Math.round(data.total_minutes % 60); // minutes
        const diffTxt = (diffHrs>0 ? diffHrs + " hrs " : "") + diffMins + " min"

        return (
          <div className="row" key={data.dispatcher}>
            <DispatcherSummaryListItem readableLapse={diffTxt} region={data.region} dispatcher={data.dispatcher} totalMinutes={data.total_minutes} />
          </div>
        )
      })
      return (
        <div class="container">
          {dhnodes}
        </div>
      )
    } else {
      return (
        <div className="row">
          <p className="text-center">No dispatcher history</p>
        </div>
      )
    }
  }
}

class DispatcherHistoryList extends React.Component {
  render() {
    const {list} = this.props;
    if (list.length>0) {
      const dhnodes = list.map((data)=>{
        const diffHrs = Math.floor(data.total_minutes / 60); // hours
        const diffMins = Math.round(data.total_minutes % 60); // minutes
        const diffTxt = (diffHrs>0 ? diffHrs + " hrs " : "") + diffMins + " min"

        const date1 = new Date(parseInt(data.datetime_start));
        const date2 = new Date(parseInt(data.datetime_end));

        return (
          <div className="row" key={data.datetime_start}>
            <DispatcherHistoryListItem shiftLenght={diffTxt} region={data.region} dispatcher={data.dispatcher} readableStartDate={date1.toLocaleString()} readableEndDate={date2.toLocaleString()} />
          </div>
        )
      })
      return (
        <div class="container">
          {dhnodes}
        </div>
      )
    } else {
      return (
        <div className="row">
          <p className="text-center">No dispatcher history</p>
        </div>
      )
    }
  }
}

export default class DispatcherHistoryLastweek extends React.Component {

  constructor() {
    super();
    this.state = {
      loading: true,
      dispatcherTrackingSorted: [ ],
    };
  }

  componentWillMount() {
    $.ajax({
      url: process.env.API_BASEURI + '/dispatcher-history/lastweek',
      type : 'GET',
      crossDomain: true,
      headers: {
        'token': localStorage.token
      },
      dataType: 'json',
      cache: false,
      success: function(data, status, req) {
        const dhSorted = _.sortBy(data, 'datetime_start').reverse();
        this.setState({
          dispatcherTrackingSorted: dhSorted,
          loading: false,
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({
          loading: false,
        });
        console.error(process.env.API_BASEURI + '/dispatcher-history/lastweek', status, err.toString());
      }.bind(this)
    });
  }

  render() {
    if (! this.state.loading) {
      return (
        <div class="row">
          <h3>Latest dispatchers <small>last 14 days</small></h3>
          <DispatcherHistoryList list={this.state.dispatcherTrackingSorted}/>
        </div>
      )
    } else {
      return (
        <div class="row">
          <h3>Latest dispatchers <small>last 14 days</small></h3>
          <p className="text-center">Loading...</p>
        </div>
      )
    }
  }
}

export default class DispatcherHistorySummary extends React.Component {

  constructor() {
    super();
    this.state = {
      loading: true,
      dispatcherTrackingSorted: [ ],
    };
  }

  componentWillMount() {
    $.ajax({
      url: process.env.API_BASEURI + '/dispatcher-history/summary',
      type : 'GET',
      crossDomain: true,
      headers: {
        'token': localStorage.token
      },
      dataType: 'json',
      cache: false,
      success: function(data, status, req) {
        var dhSorted = _.sortBy(data, 'total_minutes').reverse();
        console.log(dhSorted);
        this.setState({
          dispatcherTrackingSorted: dhSorted,
          loading: false,
        });
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({
          loading: false,
        });
        console.error(process.env.API_BASEURI + '/dispatcher-history/summary', status, err.toString());
      }.bind(this)
    });
  }

  render() {
    if (! this.state.loading) {
      return (
        <div class="row">
          <h3>Latest dispatchers summary <small>last 14 days</small></h3>
          <DispatcherSummaryList list={this.state.dispatcherTrackingSorted}/>
        </div>
      )
    } else {
      return (
        <div class="row">
          <h3>Latest dispatchers summary <small>last 14 days</small></h3>
          <p className="text-center">Loading...</p>
        </div>
      )
    }
  }
}


export default class DispatcherHistory extends React.Component {

  constructor() {
    super();
    this.state = {
      currentTab: 1
    };
    this.changeTab = this.changeTab.bind(this);
  }

  changeTab(tab) {
    this.setState({ currentTab: tab.id });
  }

  render() {
    return (
      <div class="row">
        <h1>Dispatcher History</h1>
        <DispatcherHistorySummary/>
        <DispatcherHistoryLastweek/>
      </div>
    )
  }
}

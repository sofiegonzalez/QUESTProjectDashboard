import React from 'react';
import { createBrowserHistory } from 'history';
import * as jwt_decode from 'jwt-decode'

//css
import './assets/css/custom.css';
import './assets/css/dashboard.css';

//navbar
import NavDark from './Nav_Dark';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- Student Dashboard Page ----------
// main student dashboard - displays projects submitted by student and
// can direct to user settings

class StudentDashboard extends React.Component {
  componentDidMount(){
      document.title = "Student Dashboard"
  }
  // set values in form
  constructor() {
    super()
    this.state = {
      firstname: '',
      lastname: '',
      emailaddress: '',
      id: '',
      errors: {}
    }

    // route user to the settings page
    this.onSettings = this.onSettings.bind(this)
  }
  
  
  componentDidMount() {
    // get user information from local storage
    const token = localStorage.usertoken
    const decoded = jwt_decode(token)
    localStorage.setItem('usertoken', localStorage.usertoken)

    this.setState({
      // need another post request for person info
      emailaddress: decoded.identity.account_email,
      id: decoded.identity.id
    })

    // // fetch team and projects
    // fetch(`https://api.questumd.com/api/persons?user_id=${this.state.id}`).then(res => res.json()).then(data => {
    //   var json = data[0]
    //   var personid = json.id


    //   // get questee
    //   fetch(`https://api.questumd.com/api/questees?person_id=${personid}`).then(res => res.json()).then(data_p => {
    //     // then from here you have the questee info, need to link to team then to projects   
        

    //   }).catch(console.log);
    // }).catch(console.log);

  }

  // route user to settings page
  onSettings(e) {
    e.preventDefault()
    this.props.history.push(`/settings`)
  }

    render() {

    return (
      <div className="StudentDash">
          <NavDark/>
            <div class="container-fluid">
              <div class="row">
                <nav class="col-md-2 d-none d-md-block bg-light">
                  <div class="sidebar-sticky">
                    <ul class="nav flex-column">
                      <li class="nav-item">
                        <Link to="/submitproject"><a class="nav-link">
                          <span data-feather="file"></span>
                          Submit a Project
                        </a></Link>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" href="#">
                          <span data-feather="users"></span>
                          Resume
                        </a>
                      </li>
                    </ul>
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                      <span>Account Information</span>
                      <a class="d-flex align-items-center text-muted" href="#" aria-label="Add a new report">
                        <span data-feather="plus-circle"></span>
                      </a>
                    </h6>
                    <ul class="nav flex-column mb-2">

                      <li class="nav-item">
       
                      <Link to="/settings" onClick={this.onSettings}>
                        <a class="nav-link" href="#" >
                          <span data-feather="file-text"></span>
                          Settings
                        </a>
                      </Link>
                      </li>
                    </ul>
                  </div>
                </nav>

                <main role="main" class="col-md-9 ml-sm-auto col-lg-10 px-4">
                  <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Submitted Projects</h1>
                  </div>


                </main>

              </div>
            </div>
      </div>
      );
    }
}

export default StudentDashboard;

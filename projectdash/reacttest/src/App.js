import React, {Component} from 'react';
import {useEffect, useState} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import axios from 'axios';
// ---------- Main Application Page ----------

import Nav from './components/Nav';
import NavDark from './components/Nav_Dark';
import Foot from './components/Footer';

// ---------- Public Pages ----------
import Home from './components/Home';
import SignIn from './components/SignIn';
import CreateAccount from './components/CreateAccount';
import Proj from './components/ProjectInfo.js';

// ---------- About Pages ----------
import AboutQuest from './components/About';
import AboutQubit from './components/AboutQubit';
import Contact from './components/Contact';

// ---------- Student Account Pages ----------
import StudentDashboard from './components/StudentDashboard';
import SubmitProject from './components/ProjectSubmission.js';
import UserSettings from './components/Settings';

// ---------- Admin Account Pages ----------
import AdminDashboard from './components/admindashboard/AdminDashboard';
import TeamMgmt from './components/admindashboard/TeamMgmt';
import UserMgmt from './components/admindashboard/UserMgmt';
import ProjectMgmt from './components/admindashboard/ProjectMgmt.js';
import ProjectInfo from './components/admindashboard/ProjectInfo';
import AdminSettings from './components/admindashboard/AdminSettings';
//TODO RENAME THIS FILE
import ProjectSearch from './components/admindashboard/AdminSearch';
import CreateTeam from './components/admindashboard/CreateTeam';
import CreateUser from './components/admindashboard/CreateUser';
import CreateProject from './components/admindashboard/CreateProject';
import UserInfo from './components/admindashboard/UserInfo';
import TeamInfo from './components/admindashboard/TeamInfo';

//import UserSettings from './components/UserSettings'; <- ??

// ---------- TA Account Pages ----------
import TATeamMgmt from './components/tadashboard/TATeamMgmt';
import TAProjectMgmt from './components/tadashboard/ProjectMgmt.js';
import TAProjectInfo from './components/tadashboard/ProjectInfo';
import TACreateProject from './components/tadashboard/TACreateProject';
import TACreateTeam from './components/tadashboard/TACreateTeam';
import TATeamInfo from './components/tadashboard/TATeamInfo.jsx';
import TASettings from './components/tadashboard/TASettings';

// Error
import Error from './components/Error';


function App(){
    return (
      <Router>
        <div className="App">
        <Switch>
          {/* Public Pages */}
          <Route path="/" exact component={Home}/>
          <Route path="/aboutquest" component={AboutQuest}/>
          <Route path="/contact" component={Contact}/>
          <Route path="/aboutqubit" component={AboutQubit}/>
          <Route path="/signin" component={SignIn}/>

          {/* Admin Dashboard */}
          <Route path="/admindashboard" component={AdminDashboard}/>
          <Route path="/teammgmt" exact component={TeamMgmt}/>
          <Route path="/usermgmt" exact component={UserMgmt}/>
          <Route path="/projectmgmt" exact component={ProjectMgmt}/>
          <Route path="/projectmgmt/projectinfo" component={ProjectInfo}/>
          <Route path="/projectmgmt/createproject" component={CreateProject}/>
          <Route path="/adminsettings" component={AdminSettings}/>
          <Route path="/projectmgmt/projectsearch/" component={ProjectSearch}/>
          <Route path="/usermgmt/createuser" component={CreateUser}/>
          <Route path="/usermgmt/userinfo" component={UserInfo}/>
          <Route path="/teammgmt/createteam" component={CreateTeam}/>
          <Route path="/teammgmt/teaminfo" component={TeamInfo}/>

          {/* TA Dashboard*/}
          {/* <Route path="/ta/teammgmt" component={TATeamMgmt}/>
          <Route path="/tasettings" component={TASettings}/>
          <Route path="/ta/projectmgmt" component={TAProjectMgmt}/>
          <Route path="/ta/projectmgmt/projectinfo" component={TAProjectInfo}/>
          <Route path="/ta/projectmgmt/createproject" component={TACreateProject}/>
          <Route path="/ta/teammgmt/createteam" component={TACreateTeam}/>
          <Route path="/ta/teammgmt/teaminfo" component={TATeamInfo}/> */}

          {/* Student Dashboard */}
          <Route path="/studentdashboard" component={StudentDashboard}/>
          <Route path="/submitproject" component={SubmitProject}/>
          <Route path="/createaccount" component={CreateAccount}/>
          <Route path="/settings" component={UserSettings}/>
          <Route path="/proj" component={Proj}/>
          <Route component={Error}/>
        </Switch>
        <Foot/>
      </div>
    </Router>
  );
}

export default App;

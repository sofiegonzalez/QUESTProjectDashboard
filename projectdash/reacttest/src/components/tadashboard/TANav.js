import React from 'react';

//css
import '../assets/css/custom.css';

//linking to other pages
import {NavLink} from 'react-router-dom';

// ----------  Navbar Code ----------

const AdminNav = () => {
  return (<div>
    <header>
      <div className="navbar navbar-expand-lg navbar-light bg-light">
        <NavLink to="/">
          <img src={require("../assets/images/quest_logo.png")} height="50px"></img>
        </NavLink>
        <div className="container d-flex justify-content-end">
          <div className="navbar" id="navbarText">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <NavLink to="/tasettings">
                <button className="btn nav-link">
                    Account
                </button>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/signin">
                <button className="btn nav-link">
                  Sign Out
                </button>
                </NavLink>
              </li>
            </ul>

          </div>
        </div>
      </div>
    </header>
  </div>);
}

export default AdminNav;

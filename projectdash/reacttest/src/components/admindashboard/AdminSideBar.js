import React from 'react';
import '../assets/css/custom.css';
import {NavLink} from 'react-router-dom';

// ----------  Sidebar Code ----------
const AdminSideBar = () => {
  return (
    <nav className="col-lg-auto bg-light sidebar" style={{minHeight: '330px'}}>
    {/* Sidebar*/}
    <ul className="nav nav-pills flex-column">
      {/*Insert admindash here: <NavLink to="/admindashboard"></NavLink>*/}

      <li className="nav-item">
        <NavLink className="nav-link" to="/projectmgmt" activeStyle={{
            fontWeight: "bold",
            color: "white",
            background: '#353a40'
          }}>
          <div className="row">
            <i className="fas fa-file-contract fa-2x mx-auto"></i>
          </div>
          <div className="row">
            <b className="mx-auto">Project Management</b>
          </div>
        </NavLink>
      </li>
      
      <li className="nav-item">
        <NavLink className="nav-link" to="/teammgmt" activeStyle={{
            fontWeight: "bold",
            color: "white",
            background: '#353a40'
          }}>
          <div className="row">
            <i className="fas fa-users fa-2x mx-auto"/>
          </div>
          <div className="row">
            <b className="mx-auto">Team Management</b>
          </div>
        </NavLink>
      </li>

      <li className="nav-item">
        <NavLink className="nav-link" to="/usermgmt" activeStyle={{
            fontWeight: "bold",
            color: "white",
            background: '#353a40'
          }}>
          <div className="row">
            <i className="fas fa-user fa-2x mx-auto"></i>
          </div>
          <div className="row">
            <b className="mx-auto">User Management</b>
          </div>
        </NavLink>
      </li>

      {/* <li className="nav-item">
        <NavLink className="nav-link" to="/adminsearch" activeStyle={{
            fontWeight: "bold",
            color: "white",
            background: '#353a40'
          }}>
          <div className="row">
            <i className="fas fa-search fa-2x mx-auto"></i>
          </div>
          <div className="row">
            <b className="mx-auto">Search</b>
          </div>
        </NavLink>
      </li> */}
    </ul>
  </nav>);
}

export default AdminSideBar;

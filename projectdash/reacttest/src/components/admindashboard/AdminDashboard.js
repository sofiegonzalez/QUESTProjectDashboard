import React from 'react';

//css
//import './assets/css/custom.css';
//import './assets/css/dashboard.css';

//for routing pages
import {Link} from 'react-router-dom';
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
// ---------- Admin Dashboard Page ----------
//TODO: ADMIN DASH NEEDS TO ACTUALLY HAVE VALUABLE INFORMATION - PROBABLY "CREATE REPORT"
//TODO: ADD ABILITY FOR ADMIN TO CHANGE TEXT AND PICTURES ON THE PROJECT DASHBOARD
class AdminDashboard extends React.Component {
  componentDidMount() {
    document.title = "Admin Dashboard"
  }

  render() {
    return (<React.Fragment>

      {/*TODO: NEW NAV NEEDS TO HAVE DIFFERENT OPTIONS ON THE NAV(E.G. MY ACCOUNT, LOGOUT)*/}
      <AdminTopNavBar/>
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">
          {/* Sidebar */}
          <AdminSidebar/>
          {/* Page Content */}
            {/*This file will show quick information needed at a glance*/}
          {/* <main role="main" className="ml-sm-auto px-4"> */}
          <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
            {/* <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"> */}
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle">
                  <span data-feather="calendar"></span>
                  This week
                </button>
              </div>
            </div>
            <img src={require("../assets/images/qubitgraphics.png")} className="rounded mx-auto d-block" width="500" height="300"/> {/* Sample data below */}
            <h2>Students</h2>
            <div className="table-responsive">
              <table className="table table-striped table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Team</th>
                    <th>Proposal</th>
                    <th>Draft</th>
                    <th>Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lorem</td>
                    <td>1,001</td>
                    <td>ipsum</td>
                    <td>dolor</td>
                    <td>sit</td>
                  </tr>
                  <tr>
                    <td>amet</td>
                    <td>1,002</td>
                    <td>consectetur</td>
                    <td>adipiscing</td>
                    <td>elit</td>
                  </tr>
                  <tr>
                    <td>odio</td>
                    <td>1,003</td>
                    <td>Integer</td>
                    <td>nec</td>
                    <td>Praesent</td>
                  </tr>
                  <tr>
                    <td>libero</td>
                    <td>1,003</td>
                    <td>Sed</td>
                    <td>cursus</td>
                    <td>ante</td>
                  </tr>
                  <tr>
                    <td>dapibus</td>
                    <td>1,004</td>
                    <td>diam</td>
                    <td>Sed</td>
                    <td>nisi</td>
                  </tr>
                  <tr>
                    <td>Nulla</td>
                    <td>1,005</td>
                    <td>quis</td>
                    <td>sem</td>
                    <td>at</td>
                  </tr>
                  <tr>
                    <td>elementum</td>
                    <td>1,006</td>
                    <td>nibh</td>
                    <td>imperdiet</td>
                    <td>Duis</td>
                  </tr>
                  <tr>
                    <td>Praesent</td>
                    <td>1,007</td>
                    <td>sagittis</td>
                    <td>ipsum</td>
                    <td>mauris</td>
                  </tr>
                  <tr>
                    <td>tellus</td>
                    <td>1,008</td>
                    <td>Fusce</td>
                    <td>nec</td>
                    <td>sed</td>
                  </tr>
                  <tr>
                    <td>semper</td>
                    <td>1,009</td>
                    <td>augue</td>
                    <td>porta</td>
                    <td>Mauris</td>
                  </tr>
                  <tr>
                    <td>Vestibulum</td>
                    <td>1,010</td>
                    <td>massa</td>
                    <td>lacinia</td>
                    <td>arcu</td>
                  </tr>
                  <tr>
                    <td>nulla</td>
                    <td>1,011</td>
                    <td>eget</td>
                    <td>Class</td>
                    <td>aptent</td>
                  </tr>
                  <tr>
                    <td>sociosqu</td>
                    <td>1,012</td>
                    <td>taciti</td>
                    <td>ad</td>
                    <td>litora</td>
                  </tr>
                  <tr>
                    <td>torquent</td>
                    <td>1,013</td>
                    <td>per</td>
                    <td>conubia</td>
                    <td>nostra</td>
                  </tr>
                  <tr>
                    <td>Curabitur</td>
                    <td>1,014</td>
                    <td>per</td>
                    <td>inceptos</td>
                    <td>himenaeos</td>
                  </tr>
                  <tr>
                    <td>sodales</td>
                    <td>1,015</td>
                    <td>ligula</td>
                    <td>in</td>
                    <td>libero</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}

export default AdminDashboard;

import React from 'react';

//css
//import './assets/css/custom.css';
import './assets/css/dashboard.css';

//for routing pages
import {Link} from 'react-router-dom'

import AdminTopNavBar from './Nav';
import AdminSidebar from './AdminSideBar';

// ---------- Published Projects Dashboard ----------

class AdminDashboard extends React.Component {
  componentDidMount(){
    document.title = "Publish Projects"
  }

  render() {
    return (<React.Fragment>
      <AdminTopNavBar/>
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">

          {/* Sidebar */}
          <AdminSidebar/>

          <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
            {/* Project cards in queue awaiting to be published below */}
            <h1 className="display-6">Projects in queue</h1>
            <div style={{
                paddingLeft: '40px'
              }}>
              <div className="row align-items-center">
                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body">
                    <h5 className="card-title text-white bg-dark">Northrop Grumman</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link bg-dark">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>

                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body text-white bg-dark">
                    <h5 className="card-title text-white bg-dark">Leidos</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>
                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body text-white bg-dark">
                    <h5 className="card-title text-white bg-dark">Sealed Air</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>
                {/* TODO figure out how to keep arrow on last card on row */}
                <i style={{
                    paddingTop: '30px'
                  }} className="fas fa-arrow-alt-circle-right fa-4x"></i>
                <a href="#" style={{
                    color: 'black',
                    paddingTop: '30px',
                    paddingLeft: '1000px'
                  }} className="h6">View All</a>
              </div>
            </div>

            {/* Published project cards below */}
            <h1 className="display-6">Published projects</h1>
            <div style={{
                paddingLeft: '40px'
              }}>
              <div className="row align-items-center">
                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body">
                    <h5 className="card-title text-white bg-dark">Northrop Grumman</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link bg-dark">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>

                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body text-white bg-dark">
                    <h5 className="card-title text-white bg-dark">Leidos</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>
                <div className="card text-white bg-dark mt-5 mr-5" style={{
                    width: '18rem'
                  }}>
                  <div className="card-body text-white bg-dark">
                    <h5 className="card-title text-white bg-dark">Sealed Air</h5>
                    <p className="card-text text-white bg-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                  </div>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item text-white bg-dark">John Smith</li>
                    <li className="list-group-item text-white bg-dark">Jane Doe</li>
                    <li className="list-group-item text-white bg-dark">Alex Walters</li>
                    <li className="list-group-item text-white bg-dark">Joe Matthews</li>
                    <li className="list-group-item text-white bg-dark">Mary White</li>
                  </ul>
                  <div className="card-body">
                    <a href="#" className="card-link">View</a>
                    <a href="#" className="card-link">Approve</a>
                  </div>
                </div>

                <i style={{
                    paddingTop: '30px'
                  }} className="fas fa-arrow-alt-circle-right fa-4x"></i>
                <a href="#" style={{
                    color: 'black',
                    paddingTop: '30px',
                    paddingLeft: '1000px'
                  }} className="h6">View All</a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}

export default AdminDashboard;

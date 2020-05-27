/*
TODO:
-TOKEN AUTHENTICATION NEEDED BADLY**
-instead of linking back just go back in history to previous page so api doesnt get called again
-look into useCallbacks if time permits
*/

import React from 'react';
//css
//import './assets/css/custom.css';
import '../assets/css/dashboard.css';
//for routing pages
import { Link } from 'react-router-dom'
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
import UserCards from './UserCards';

//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";
const QUESTEE = 0;
const TA = 1;
const ADMIN = 2;

// ---------- User MGMT Page ----------
class UserMgmt extends React.Component {
  constructor() {
    super();
    this.state = {
      search: null, //search query
      persons: {}, //results recieved from api
      questees: [], //questees person and 
      tas: [],
      admins: [],
      userRefine: QUESTEE
    };
  }


  async componentDidMount() {
    document.title = "User Management"
    //Getting all questees
    let questeesResponse = await fetch(`${apiLink}/questees`);
    let questees = await questeesResponse.json();
    for (var i = 0; i < questees.length; i++) {
      let personResponse = await fetch(`${apiLink}/person/${questees[i].person_id}`);
      let person = await personResponse.json();
      const newAddition = this.state.questees.concat([[person[0], questees[i] ]])
      this.setState({ questees: newAddition });
    }

    //Getting all admins
    let adminsResponse = await fetch(`${apiLink}/admins`);
    let admins = await adminsResponse.json();
    
    for (var i = 0; i < admins.length; i++) {
      let personResponse = await fetch(`${apiLink}/person/${admins[i].person_id}`);
      let person = await personResponse.json();
      const newAddition = this.state.admins.concat([[person[0], admins[i]]])
      this.setState({ admins: newAddition });
    }

    //Getting all tas
    let tasResponse = await fetch(`${apiLink}/tas`);
    let tas = await tasResponse.json();
    
    for (var i = 0; i < tas.length; i++) {
      let questeeResponse = await fetch(`${apiLink}/questee/${tas[i].questee_id}`);
      let questee = await questeeResponse.json();

      let personResponse = await fetch(`${apiLink}/person/${questee[0].person_id}`);
      let person = await personResponse.json();
      
      const newAddition = this.state.tas.concat([[person[0], questee[0], tas[i] ]])
      this.setState({ tas: newAddition });
    }
  }

  handleInputChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    })
  }      

  render() {
    const { query, results, message, greeting } = this.state;
    const questeeCards = Object.values(this.state.questees).filter((data) => {
      if (this.state.search == null)
        return data
      else if ((data[0].first_name + " " + data[0].last_name || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[0].contact_email || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[1].major || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[1].major2 || '').toLowerCase().includes(this.state.search.toLowerCase())
        || ((''+data[1].uid).toLowerCase().includes(this.state.search.toLowerCase()))) {
        return data
      }
    }).map(data => {
      return (
        <UserCards userData={data} userDataType={QUESTEE} />
      )
    });
  const adminCards = Object.values(this.state.admins).filter((data) => {
      if (this.state.search == null)
        return data
      //update fields to search for admin stuff
      else if ((data[0].first_name + " " + data[0].last_name || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[0].contact_email || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[1].office || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[0].title || '').toLowerCase().includes(this.state.search.toLowerCase())) {
        return data
      }
    }).map(data => {
      return (
        <UserCards userData={data} userDataType={ADMIN} />
      )
    });

  const taCards = 
    Object.values(this.state.tas).filter((data) => {
      if (this.state.search == null)
        return data
      //update fields to search for ta stuff
      else if ((data[0].first_name + " " + data[0].last_name || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[0].contact_email || '').toLowerCase().includes(this.state.search.toLowerCase())
        || ((''+data[1].uid).toLowerCase().includes(this.state.search.toLowerCase()))
        || (data[1].major || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[2].course || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[2].semester || '').toLowerCase().includes(this.state.search.toLowerCase())
        || (data[2].office || '').toLowerCase().includes(this.state.search.toLowerCase())) {
        return data
      }
    }).map(data => {
      return (
        <UserCards userData={data} userDataType={TA} />
      )
    })

    return (<React.Fragment>
      <AdminTopNavBar />
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">
          {/* Sidebar */}
          <AdminSidebar />
          {/* Page Content */}
          <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
            <div className="form-row">

              <input className="form-control form-control-lg w-50"
                type="text" name="search" placeholder="Search User..."
                id="search-input" onChange={(e) => this.handleInputChange(e)}
              />
              <button type="button" className="btn">
                <i className="fas fa-search fa-2x" />
              </button>
              <div className="form-group row">
                <label style={{
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }} htmlFor="cohortselect">Refine By:</label>
                {/*TODO: Add in refinements: usert type, alumni, ...*/}
                <select id="cohortselect" className="form-group" name="userRefine" value={this.state.userRefine} 
                onChange={(e) => this.handleInputChange(e)}>
                  <option selected="selected">Account Type...</option>
                  <option value={QUESTEE}>QUESTEE</option>
                  <option value={ADMIN}>Admin</option>
                  <option value={TA}>TA</option>
                  {/* <option>Company</option> */}
                </select>
              </div>
            </div>
            <Link to="/usermgmt/createuser">
              <button type="button" className="btn btn-light">Add User
                <i className="fas fa-plus-circle"></i>
              </button>
            </Link>

            <ul className="list-group mt-4">
               {this.state.userRefine == QUESTEE && (questeeCards.length ? questeeCards: <h2 className="mx-auto mt-5">Loading...</h2>)}
               {this.state.userRefine == TA && (taCards.length ? taCards: <h2 className="mx-auto mt-5">Loading...</h2>)}
               {this.state.userRefine == ADMIN && (adminCards.length ? adminCards: <h2 className="mx-auto mt-5">Loading...</h2>)}

            </ul>
          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}

export default UserMgmt;

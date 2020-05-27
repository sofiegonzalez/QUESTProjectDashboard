/*
TODO:
- Test both these once authentication is figured out :
  ADD IN MEMBER ON CREATE TEAM PAGE, and BE ABLE TO EDIT TEAMMEMBERS FROM VIEW EDIT PAGE
*/
import React from 'react';
import '../assets/css/dashboard.css';
import { Link } from 'react-router-dom'
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
import TeamCards from './TeamCards';

// const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

// ---------- Team MGMT Page ----------
class TeamMgmt extends React.Component {
  constructor() {
    super();
    this.state = {
      search: null, //search query
      teams: {}, //results recieved from api
      semesterRefine: "",
      yearRefine: "",
      courseRefine: "",
      cardsNotOnDisplay: true
    };
  }

  async componentDidMount() {
    document.title = "Team Management"
    //Fetching teams from api
    const requestOptionsTeams = {
      method: 'GET',
    };
    let teamsResponse = await fetch(`${apiLink}/teams`, requestOptionsTeams);
    let teamsJson = await teamsResponse.json();
    this.setState({ teams: teamsJson });
  }

  handleInputChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render() {
    {/* Team cards with refinements gathered here*/}
    const teamCards = Object.values(this.state.teams).filter((data) => {
      if (((this.state.search == null ) || (data.name || '').toLowerCase().includes(this.state.search.toLowerCase()))
      && ((this.state.courseRefine === "") || data.course === (this.state.courseRefine))
      && ((this.state.yearRefine === "") || data.semester.includes(this.state.yearRefine))
      && ((this.state.semesterRefine === "") || data.semester.includes(this.state.semesterRefine)))
        return data
    }).map(data => {
      return (
        <TeamCards teamData={data} from="teammgmt" />
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
              {/* Search box */}
              <input className="form-control form-control-lg w-50"
                type="text" name="search" placeholder="Search Team..."
                onChange={(e) => this.handleInputChange(e)} />
              <button type="button" className="btn">
                <i className="fas fa-search fa-2x" />
              </button>
              {/* Refinements below*/}
              <div className="form-group row">
                <label style={{
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }} htmlFor="semesterRefine">Refine By:</label>
                <select className="form-group" name="semesterRefine" value ={this.state.semesterRefine} onChange={(e)=>this.handleInputChange(e)}>
                  <option value="">Semester...</option>
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Winter">Winter</option>
                  <option value="Summer">Summer</option>
                </select>
                <select className="form-group" name="yearRefine" value ={this.state.yearRefine} onChange={(e)=>this.handleInputChange(e)}>
                  <option value="">Year...</option>
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                  <option value="2021">2021</option>
                  <option value="2022">2022</option>
                </select>
                <select className="form-group" name="courseRefine" value ={this.state.courseRefine} onChange={(e)=>this.handleInputChange(e)}>
                  <option value="">Course...</option>
                  <option value="490">490</option>
                  <option value="390">390</option>
                </select>
              </div>
            </div>
  
            <Link to="/teammgmt/createteam">
              <button type="button" className="btn btn-light">Create Team
                  <i className="fas fa-plus-circle"></i>
              </button>
            </Link>

            <div className="row mx-auto">
              {teamCards.length ? teamCards : <h2 className="mx-auto mt-5">No teams found</h2>}
            </div>
          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}


export default TeamMgmt;
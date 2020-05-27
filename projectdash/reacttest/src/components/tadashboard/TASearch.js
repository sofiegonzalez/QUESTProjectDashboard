//TODO: RENAME THIS PAGE TO PROJECTVIEW OR SOMETHING

import React from 'react';
import '../assets/css/dashboard.css';
import AdminTopNavBar from './TANav';
import AdminSidebar from './TASideBar';
import ProjectCards from './ProjectCards';

//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

const INPROGRESS = 0;
const INQUEUE = 1;
const PUBLISHED = 2;
const ALL = -1;

// ---------- Project Search Page ----------
class AdminSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proj: {},
      search: null, //search query
      viewAllProjectsBy: (this.props.location.state ? this.props.location.state.viewAllProjectsBy : ALL)
    };
  }


  async componentDidMount() {
    document.title = "Projects Page"
    //Fetching all projects
    fetch(`${apiLink}/projects`).then(res => res.json()).then(data => {
      this.setState({ proj: data });
    }).catch(console.log); 
  }

  handleInputChange = (e) => {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  //Approves projects in queue - also used in project mgmt
  approveProject = (index, e) => {
    const projects = Object.assign([], this.state.proj);
    console.log(projects[index].id);
    const requestOptionsApproveProject = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_status: 2
      })
    };

    fetch(`${apiLink}/project/${projects[index].id}`, requestOptionsApproveProject).then(res => res.json()).then(data => {
      console.log(data)
      if (data) {
        projects.splice(index, 1);
        this.setState({
          proj: projects
        })
        //alert("Project Approved!");
        window.location.reload();
      } else {
        console.log(data)
        alert("An error occurred. Please try again");
      }
    }
    ).catch(console.log);;
  }
  render() {
    const projectCards = Object.values(this.state.proj).filter((data) => {
      if (((this.state.search == null)
            || ((data.name || '').toLowerCase().includes(this.state.search.toLowerCase())
              || (data.description || '').toLowerCase().includes(this.state.search.toLowerCase())
              || (data.impact || '').toLowerCase().includes(this.state.search.toLowerCase())
              || (data.faculty_advisor || '').toLowerCase().includes(this.state.search.toLowerCase()))) 
          && ((this.state.viewAllProjectsBy == ALL) || data.project_status == (this.state.viewAllProjectsBy)) ){
          return data
        }
    }).map((data,index) => {
      return (
        <div className="p-2">
          <ProjectCards projectData={data} projectType={data.project_status} from='/projectmgmt/projectsearch/' approveFun={this.approveProject.bind(this, index)}/>
        </div>
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
            {/* Search Bar and Refinements */}
            <div className="form-row">
              <input className="form-control form-control-lg w-50"
                type="text" name="search" placeholder="Search Project..."
                onChange={(e) => this.handleInputChange(e)}
              />
              <button type="button" className="btn">
                <i className="fas fa-search fa-2x" />
              </button>
              {/*Refinements */}
              <div className="form-group row">
                <label style={{
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }} htmlFor="cohortselect">Refine By:</label>
                <select className="form-group" name="viewAllProjectsBy" value={this.state.viewAllProjectsBy} onChange={(e) => this.handleInputChange(e)}>
                  <option value={ALL}>Project Type...</option>
                  <option value={ALL}>All</option>
                  <option value={INPROGRESS}>In Progress</option>
                  <option value={INQUEUE}>In Queue</option>
                  <option value={PUBLISHED}>Published</option>
                </select>
              </div>
            </div>

            <div className="row mt-5">
              {(projectCards.length ? projectCards : <h2 className="mx-auto mt-5">No projects found</h2>)}
            </div>
          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}


export default AdminSearch;
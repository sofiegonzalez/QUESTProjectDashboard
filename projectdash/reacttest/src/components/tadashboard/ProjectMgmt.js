/*TODO
-NEED TO DISLPAY TEAM INFORMATION AND ALLOW FOR CHANGES ON PROJINFO PAGE - team infor is already being passed in just throw it into a card and give the option to remove annd add with mocdal like in create page*
-FILES NEED TO BE UPLOADED RIGHT BEFORE THE ACCOUNT IS CREATED AND NNOT EVERY TIME ITS SELECTED
-PROJECT INFO PAGE NEEDS TO HAVE A BETTER LAYOUT(BIGGER TEXT AREAS, PICTURE THAT CAN BE VIEWED, MORE SPACING ON BOTTOM BUTTONS)*
-NEED TO FIND THE LIMIT ON PICTURES AND ACCOMADATE/COMPRESS PHOTOS BEING UPLOADED
-PROJECT CARDS NEED TO HAVE UNIFORM SIZE

If time permits: read from https://api.questumd.com/api/projects?project_status=0 for each sub section to have dynamic areas

*/
import React from 'react';
//css
//import './assets/css/custom.css';
import '../assets/css/dashboard.css';

//for routing pages
import { Link, useParams } from 'react-router-dom'

import AdminTopNavBar from './TANav';
import AdminSidebar from './TASideBar';
import ProjectCards from './ProjectCards';
//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

//Project statuses
const INPROGRESS = 0;
const INQUEUE = 1;
const PUBLISHED = 2;
const ALL = -1;

// ---------- In Progress Projects Dashboard ----------
class ProjectMgmt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proj: {},
      modalProjKey: "",
      search: null
    };
    this.approveProject = this.approveProject.bind(this);
  }

  componentDidMount() {
    document.title = "Projects Management"
    const requestOptionsProjects = {
      method: 'GET',
    };

    fetch(`${apiLink}/projects`, requestOptionsProjects).then(res => res.json()).then(data => {
      this.setState({ proj: data });
    }).catch(console.log);
  }

  async getTeammembers(teamuid) {
    const requestOptionsProjects = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    fetch('http://ec2-34-207-76-215.compute-1.amazonaws.com/api/teams/', requestOptionsProjects).then(res => res.json()).then(data => {
      return (
        data["team_uid"]
      )
    }).catch(console.log);
  }

//Approves projects in queue - also used in project search
  approveProject = (index, e) => {
    const projects = Object.assign([], this.state.proj);
    const requestOptionsApproveProject = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_status: PUBLISHED
      })
    };

    fetch(`${apiLink}/project/${projects[index].id}`, requestOptionsApproveProject).then(res => res.json()).then(data => {
      if (data) {
        projects.splice(index, 1);
        this.setState({
          proj: projects
        });
        
        //alert("Project Approved!");
        window.location.reload();

      } else {
        console.log(data)
        alert("An error occurred. Please try again");
      }
    }
    ).catch(console.log)
  }
  //Map function returns undefined when nothing is there so this function checks 
  //so the appropriate message is rendered on screen
  entireArrayIsUndefined = (array) => {
    if(array==undefined){
      return true;
    } else{
    for(var i = 0; i < array.length; i++){
      if(array[i] != undefined){
        return false
      }
    }
  }
    return true;
  }
  render() {
    
    const projectsInQueue = 
    Object.values(this.state.proj).map((singleProj, index) => {
      if(singleProj.project_status == INQUEUE){
        return (
          <ProjectCards projectType={INQUEUE} projectData={singleProj} props={this.props} from='/projectmgmt/' approveFun={this.approveProject.bind(this, index)} />
        )
      }
    })

    const projectsInProgress = Object.values(this.state.proj).map(singleProj => {
      if(singleProj.project_status == INPROGRESS){
      return (
        <ProjectCards projectType={INPROGRESS} projectData={singleProj} props={this.props} from='/projectmgmt/' />
      )
      }
    })
    const projectsPublished = Object.values(this.state.proj).map(singleProj => {
      if(singleProj.project_status == PUBLISHED){
      return (
        <ProjectCards projectType={PUBLISHED} projectData={singleProj} props={this.props} from='/projectmgmt/' />
      )
      }
    })
    return (
      <React.Fragment>
        <AdminTopNavBar />
        <div className="container-fluid">
          <div className="row flex-xl-nowrap">

            {/* Sidebar */}
            <AdminSidebar />

            <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
              {/*Main project buttons*/}
              <div className="row mb-7 justify-content-end mx-auto">

                <Link to={{ pathname: '/ta/projectmgmt/createproject/' }}>
                  <button type="button" className="btn btn-danger btn-lg" >Add Project
                  <i className="fas fa-plus-circle ml-1"></i>
                  </button>
                </Link>
              </div>

              {/* Project cards in queue awaiting to be published below */}
              <div className="row">
                <div className="col-md-5 align-self-start">
                  <h1 className="display-6">Submitted Projects</h1>
                  {/*  //LINK TO SEARCH WITH PROP OF PROJINQUE*/}
                  <Link to={{
                    pathname: '/projectmgmt/projectsearch/',
                    state: {
                      viewAllProjectsBy: INQUEUE
                    }
                  }}>
                    <button type="button" className="btn btn-dark">View All</button>
                  </Link>
                </div>
              </div>
              <div className="container-fluid py-2">
                <div className="d-flex flex-row flex-nowrap overflow-auto">
                  {this.entireArrayIsUndefined(projectsInQueue) ? <h2 className="mx-auto">No projects in queue</h2> : projectsInQueue }
                </div>
              </div>

            </main>
          </div>
        </div>
      </React.Fragment>);
  }
}

export default ProjectMgmt;

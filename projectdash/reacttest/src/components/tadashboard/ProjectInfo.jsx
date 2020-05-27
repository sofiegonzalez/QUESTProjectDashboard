/*This is where an admin is taken in order to see all the information about a project*/
//TODO: ABILITY TO CHANGE A PROJECTS TEAM
//TODO: SHOW POSTER IMAGE CORRECTLY AND STUFF 
import React from 'react';
import '../assets/css/dashboard.css';
import { Link } from 'react-router-dom'
import AdminTopNavBar from './TANav';
import AdminSidebar from './TASideBar';

//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

// ---------- Project Info Page ----------
class ProjectInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            name: "",
            description: "",
            poster_path: "",
            project_status: "",
            impact: "",
            faculty_advisor: "",
            team_id: "",
            client_id: "",
            teamData: {}
        }
    }

    componentDidMount() {
        document.title = "Project Information"
        const { from, data } = this.props.location;
        switch (from) {
            case '/teammgmt/':
                //We have team info, so get project info 
                fetch(`${apiLink}/projects?team_id=${data.id}`).then(res => res.json()).then(receivedProject => {
                    //TODO: CHANGE TO receivedTeam ONCE ONLY ONE PROJECT IS ATTRIBUTED TO A TEAM
                    this.setState({
                        id: receivedProject[0].id,
                        name: receivedProject[0].name,
                        description: receivedProject[0].description,
                        poster_path: receivedProject[0].poster_path,
                        project_status: receivedProject[0].project_status,
                        impact: receivedProject[0].impact,
                        faculty_advisor: receivedProject[0].faculty_advisor,
                        team_id: receivedProject[0].team_id,
                        client_id: receivedProject[0].client_id,
                        teamData: data
                    });
                }).catch(console.log);
                return;
            case '/projectmgmt/projectsearch/':
            case '/projectmgmt/':
                //We have project info, so get team info 
                fetch(`${apiLink}/team/${data.team_id}`).then(res => res.json()).then(receivedTeam => {
                    this.setState({
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        poster_path: data.poster_path,
                        project_status: data.project_status,
                        impact: data.impact,
                        faculty_advisor: data.faculty_advisor,
                        team_id: data.team_id,
                        client_id: data.client_id,
                        teamData: receivedTeam[0]
                    });
                    console.log(receivedTeam[0])
                    console.log(receivedTeam)
                }).catch(console.log);
                return;
            default:

        }
    }

    //Function for applying changes made to project
    async saveChanges(e) {
        e.preventDefault();
        const { id, name, description, poster_path, project_status, impact,
            faculty_advisor, team_id, client_id, teamData } = this.state;

        const requestOptionsUpdateProject = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description,
                poster_path,
                project_status,
                impact,
                faculty_advisor,
                team_id,    //TODO: Add with modal like in create project
                //client_id, TODO: Add in future
            })
        };

        fetch(`${apiLink}/project/${id}`, requestOptionsUpdateProject).then(res => res.json()).then(data => {
            if (data) {
                alert("Project Updated Successfully!");
                this.props.history.push(`${this.props.location.from}`)
            } else {
                console.log(data)
                alert("Invalid field, please try again");
            }
        }
        ).catch(console.log);;
    }

    deleteProject(e) {
        e.preventDefault()
        const { id } = this.state;
        const requestOptionsDeleteProject = {
            method: 'DELETE',
        }
        fetch(`${apiLink}/project/${id}`, requestOptionsDeleteProject).then(res => res.json()).then(data => {
            if (data) {
                alert("Project Deleted Successfully!");
                this.props.history.push(`/${this.props.location.from}`)
            } else {
                console.log(data)
                alert("An error occured, please try again");
            }
        }
        ).catch(console.log);;
    }

    handleInputChange(e) {
        e.preventDefault();
        this.setState({
            [e.target.id]: e.target.value
        })
    }

    render() {
        const { data, from } = this.props.location;
        const { id, name, description, poster_path, project_status, impact,
            faculty_advisor, team_id, client_id, teamData } = this.state;
        if (this.props.location.data) {
            return (
                <React.Fragment>
                    <AdminTopNavBar />
                    <div className="container-fluid">
                        <div className="row flex-xl-nowrap">
                            {/* Sidebar */}
                            <AdminSidebar />
                            {/* Page Content */}
                            <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
                                <div className="row">
                                    <div className="col-md-10">
                                        {teamData ? <b style={{ fontSize: "4em", color: "white" }}>{teamData.name}</b> : null}
                                    </div>
                                    <div className="col-md-2">
                                        <button className="btn btn-danger float-right" onClick={e => this.deleteProject(e)}>Delete Project</button>
                                    </div>
                                </div>

                                <div className="body mt-6">
                                    <form className="needs-validation">{/* onSubmit={this.handleStudent} */}
                                        {/*TODO: PULL UP PROJECT INFO ASSOCIATED WITH THE TEAM */}
                                        <div className="form-row">
                                            <h3 className="display-6">Project</h3>
                                        </div>
                                        <div className="form-row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="name">Name</label>
                                                <input type="text" className="form-control" id="name" value={name} onChange={(e) => this.handleInputChange(e)} required />
                                            </div>
                                            <div className="custom-control custom-checkbox col-md-2 mb-3">
                                                <label htmlFor="project_status">Status</label>
                                                <select className="custom-select" id="project_status" value={project_status} onChange={(e) => this.handleInputChange(e)}>
                                                    <option>Choose...</option>
                                                    <option value="0">In Progress</option>
                                                    <option value="1">Submitted</option>
                                                    <option value="2">Published</option>
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="faculty_advisor">Faculty Advisor</label>
                                                <input type="text" className="form-control" id="faculty_advisor" value={faculty_advisor} onChange={(e) => this.handleInputChange(e)} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="description">Description</label>
                                                <textarea type="text" className="form-control" rows="6" id="description" value={description} onChange={(e) => this.handleInputChange(e)} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="impact">Impact</label>
                                                <textarea type="text" className="form-control" rows="6" id="impact" value={impact} onChange={(e) => this.handleInputChange(e)} />
                                            </div>
                                        </div>
                                        {/* TODO SHOW POSTER CORRECTLY AND STUFF  */}
                                        <div className="form-row">
                                            <div className="col-md-3 mb-3">
                                                <label htmlFor="exampleFormControlFile1">Poster</label>
                                                <input type="file" className="form-control-file" id="exampleFormControlFile1" />
                                            </div>
                                        </div>
                                        {/*Poster image */}
                                        {this.state.poster_path ? <img style={{ width: '980px', height: '900' }} src={poster_path} /> : ""}

                                        <div className="form-row">
                                            <div className="col mb-3">
                                                <Link to={{ pathname: `${from}` }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
                                            </div>
                                            <div className="col mb-3">
                                                <button type="submit" className="btn btn-warning float-right" onClick={e => this.saveChanges(e)}>Save changes</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </main>
                        </div>
                    </div>
                </React.Fragment>
            )
        } else {
            this.props.history.push(`/projectmgmt`)
            return (
                <h1>
                    Error: No Team info
                </h1>
            )
        }
    }
}

export default ProjectInfo;

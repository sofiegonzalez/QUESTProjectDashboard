/*TODO:
-Upload poster image url
-Get ClientId stuff
-Add refinements to modal
*/

import React, { Component, useEffect, useState } from 'react';
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
import TeamCards from './TeamCards';
//css
import '../assets/css/custom.css';
//linking to other pages
import { Link } from 'react-router-dom';
import axios from 'axios';

// const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

// ----------  Create Project code ----------
const CreateProject = props => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [posterPath, setPosterPath] = useState("");
    const [posterFile, setPosterFile] = useState(null);
    const [projectStatus, setProjectStatus] = useState("");
    const [loaded, setLoaded] = useState();

    const [impact, setImpact] = useState("");
    const [facultyAdvisor, setFacultyAdvisor] = useState("");
    const [clientId, setClientId] = useState(1);
    //Data from api call to teams
    const [teamData, setTeamData] = useState({});
    //Search bar in modal
    const [search, setSearch] = useState("");
    //Team information gotten from modal
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [selectedTeamName, setSelectedTeamName] = useState("");
    const [selectedTeamSemster, setSelectedTeamSemester] = useState("");
    const [selectedTeamCourse, setSelectedTeamCourse] = useState("");

    const requestOptionsGet = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('usertoken')}
      };
      const requestOptionsPost = {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('usertoken')}
      };


    //Get request for teams
    function getTeams() {
        fetch(`${apiLink}/teams`).then(res => res.json()).then(data => {
            setTeamData(data);
        }).catch(console.log);
    }

    function handleFileUpload(event) {
        console.log(event.target)
        setPosterFile(event.target.files[0])
        setLoaded(0)

        const data = new FormData()
        data.append('file', event.target.files[0])

        axios.post(`${apiLink}/poster/`, data, { // receive two parameter endpoint url ,form data 
        })
            .then(res => { // then print response status
                setPosterPath(res.data.url);
            })
    }

    async function createProject(e) {
        e.preventDefault();
        const requestOptionsProject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('usertoken')
            },
            body: JSON.stringify({
                name: name,
                description: description,
                poster_path: posterPath,
                project_status: projectStatus,
                impact: impact,
                faculty_advisor: facultyAdvisor,
                team_id: selectedTeamId,
                client_id: clientId  //TODO: GET client ID SOMEHOW
            })
        };
        fetch(`${apiLink}/projects`, requestOptionsProject).then(res => {
            console.log("res = ", res)
            if (res.ok) {
                res.json().then(project => {
                    alert("Project Submitted Successfully!");
                    props.history.push(`/projectmgmt`)
                }).catch(console.log);
            } else {
                console.log(res)
                alert("Invalid field, please try again");
            }
        }
        ).catch(console.log);;

    }

    return (
        <React.Fragment>
            <AdminTopNavBar />
            <div className="container-fluid">
                <div className="row flex-xl-nowrap">
                    {/* Sidebar */}
                    <AdminSidebar />
                    {/* Page Content */}
                    <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
                        {/* Start of project creation */}
                        <h1 className="display-6">Add Project</h1>
                        <form className="mt-3" id="projectForm">
                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationDefault02">Name</label>
                                    <input type="text" className="form-control" onChange={e => setName(e.target.value)} id="validationDefault02" required />
                                </div>
                                <div className="custom-control custom-checkbox col-md-2 mb-3">
                                    <label htmlFor="customCheck1">Status?</label>
                                    <select className="custom-select" id="customCheck1" onChange={e => setProjectStatus(e.target.value)}>
                                        <option defaultValue>Choose...</option>
                                        <option value="0">In Progress</option>
                                        <option value="1">Submitted</option>
                                        <option value="2">Published</option>
                                    </select>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="validationDefault05">Faculty Advisor</label>
                                    <input type="text" className="form-control" onChange={e => setFacultyAdvisor(e.target.value)} id="validationDefault05" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationDefault05">Description</label>
                                    <textarea type="text" className="form-control" onChange={e => setDescription(e.target.value)} id="validationDefault05" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="validationDefault05">Impact</label>
                                    <textarea type="text" className="form-control" onChange={e => setImpact(e.target.value)} id="validationDefault05" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="col-md-3 mb-3">
                                    <label htmlFor="exampleFormControlFile1">Poster</label>
                                    <input type="file" className="form-control-file" onChange={e => handleFileUpload(e)} id="exampleFormControlFile1" />
                                </div>
                            </div>
                            {posterPath ? <img style={{ width: '980px', height: '900' }} src={posterPath} /> : ""}
                        </form>
                        <div className="form-row">
                            {/* Onclick this button both makes an API call and brings up a modal for team selection */}
                            <button className=" btn btn-lg btn-block btn-warning float-right mt-4" id="selectTeamBtn" data-toggle="modal" onClick={getTeams} data-target="#teamSelection">{selectedTeamId ? "Change Team" : "Select Team"}</button>
                            {/* TODO: ADD LINE OF TEXT THAT GETS GENERATED WHEN TEAM IS SLECTED AND AN EDIT BUTTON */}
                            {/* TODO: SHOW A "NO TEAMS FOUND" IF NOT TEAMS FOUND ON SEARCH OR NO TEAMS HAVE NO PROJECTS */}
                            <div className="modal fade dark" id="teamSelection" tabIndex="-1" role="dialog" aria-labelledby="myExtraLargeModalLabel" aria-hidden="true">
                                <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title text-dark" id="exampleModalLongTitle">Select Team</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-content">
                                            <div className="row justify-content-center">
                                                <input className="form-control form-control-lg mt-2 mx-4 "
                                                    type="text" name="query" placeholder="Search Team..."
                                                    id="search-input" onChange={e => setSearch(e.target.value)} />
                                            </div>
                                            <div className="row justify-content-center mt-1">
                                                <div className="col-md-3 mb-3">
                                                    <select id="cohortselect" className="form-control form-control-sm">
                                                        <option>Semester...</option>
                                                        <option>31</option>
                                                        <option>30</option>
                                                        <option>29</option>
                                                        <option>28</option>
                                                    </select>

                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <select id="yearselect" className="form-control form-control-sm">
                                                        <option>Course...</option>
                                                        <option>490</option>
                                                        <option>390</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row justify-content-center mx-auto">
                                                {
                                                    Object.values(teamData).filter((data) => {
                                                        if (search == null)
                                                            return data
                                                        else if ((data.name || '').toLowerCase().includes(search.toLowerCase())) {
                                                            return data
                                                        }
                                                    }).map(data => {
                                                        return (
                                                            <TeamCards teamData={data} from="projectmodal"
                                                                teamId={setSelectedTeamId}
                                                                teamName={setSelectedTeamName}
                                                                teamSemester={setSelectedTeamSemester}
                                                                teamCourse={setSelectedTeamCourse}
                                                            />
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                        <div className="modal-footer mt-5">
                                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedTeamId &&
                                <div className="card text-white bg-dark mt-4 mr-3" style={{
                                    width: '20rem'
                                }}>
                                    <div className="card-header text-white bg-dark">
                                        <h5 className="card-title text-white bg-dark">{selectedTeamName}</h5>
                                    </div>
                                    <div className="card-body text-white bg-dark">
                                        <h5 className="card-title text-white bg-dark">{selectedTeamCourse}</h5>
                                        <h5 className="card-title text-white bg-dark">{selectedTeamSemster}</h5>
                                    </div>

                                </div>
                            }
                        </div>
                        <div className="form-row mt-5">
                            <div className="col mb-3">
                                <Link to={{ pathname: '/projectmgmt/' }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
                            </div>
                            <div className="col mb-3">
                                <button className="btn btn-success float-right" onClick={e => createProject(e)}
                                    type="submit">
                                    Add Project
                                    <i className="fas fa-plus-circle ml-1"></i>
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </React.Fragment>
    );
}

export default CreateProject;
/*This is where an admin is taken in order to see all the information about a Team*/
import '../assets/css/dashboard.css';
import React from 'react';
import { Link } from 'react-router-dom'
import AdminTopNavBar from './TANav';
import AdminSidebar from './TASideBar';
import { useEffect, useState, Fragment } from 'react';


const apiLink = "http://127.0.0.1:5000/api";
//const apiLink = "https://api.questumd.com/api";

// ---------- Team Info Page ----------
const TeamInfo = (props) => {
    //Ternary operators used below in case this form is called without props
    const { teamData, teamMembers } = (props.location ? props.location : null);
    const [id, setId] = useState(teamData ? teamData.id : null)
    const [name, setName] = useState(teamData ? teamData.name : null);
    const [semester, setSemester] = useState(teamData ? teamData.semester : null);
    const [semesterSeason, setSemesterSeason] = useState(teamData ? teamData.semester.substr(0, teamData.semester.indexOf(' ')) : null);
    const [semesterYear, setSemesterYear] = useState(teamData ? teamData.semester.substr(teamData.semester.indexOf(' ') + 1) : null);
    const [course, setCourse] = useState(teamData ? teamData.course : null);
    const [newTeamMembers, setNewTeamMembers] = useState(teamMembers ? teamMembers : "") //An array of [queesteeData, first_name, last_name]
    


    useEffect(() => {
        document.title = "Team Information"
        //When initially rendered if the form has no props data then return to usermgmt
        if (!props.location) {
            props.history.push(`/teammgmt`)
        }
    }, [])


    //Functions below used to do PUT and DELETE requests on teams
    const saveChanges = async (e) => {
        e.preventDefault();
        //TODO: need to verify team info is valid
        //First need to delete old questee_ids in team
        for (var i = 0; i < teamData.questee_ids.length; i++) {
            let teamDeleteResponse = await fetch(`${apiLink}/team/${teamData.id}/questee/${teamData.questee_ids[i]}`, {method:'DELETE'});
            if(!teamDeleteResponse.ok){
                alert("Team Edit unsuccessful");
                return;
            }
        }

        //Next need to loop through all new questee team members and get their ids
        const newTeamUids = newTeamMembers.map((questee, index) =>
            questee[0].id
        );

        //Next post the new questee ids to the team
        for (var i = 0; i < newTeamUids.length; i++) {
            let teamPostResponse = await fetch(`${apiLink}/team/${teamData.id}/questee/${newTeamUids[i]}`, {method:'POST'});
            // if(!teamPostResponse.ok){
            //     alert("Team Edit unsuccessful");
            //     return;
            // }
        }

        const requestOptionsUpdateTeam = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                semester: semesterSeason + " " + semesterYear,
                course,
                questee_ids: newTeamUids
            })
        };

        fetch(`${apiLink}/team/${id}`, requestOptionsUpdateTeam).then(res => res.json()).then(data => {
            if (data) {
                console.log(data)
                alert("Team Updated Successfully!");
                props.history.push(`/teammgmt`)
            } else {
                console.log(data)
                alert("Invalid field, please try again");
            }
        }).catch(console.log);;
    }

    const deleteTeam = (e) => {
        e.preventDefault()
        const requestOptionsDeleteTeam = {
            method: 'DELETE',
        }
        fetch(`${apiLink}/team/${id}`, requestOptionsDeleteTeam).then(res => res.json()).then(data => { 

            console.log(data)
            if (data) {
                //Deleting project relations
                    //First getting project
                fetch(`${apiLink}/projects?team_id=${id}`).then(res => res.json()).then(project => { 
                    //Next deleting project
                    console.log(project)
                    if(project){
                        console.log("in here projId = ",project[0].id )
                        fetch(`${apiLink}/project/${project[0].id}/team/${id}`, {method: 'DELETE' }).then(res => { 
                            const oldTeamUids = teamMembers.map((questee, index) =>
                                questee[0].id
                                );
                                //Deleting team from questees team_ids
                                for (var i = 0; i < oldTeamUids.length; i++) {
                                    fetch(`${apiLink}/questee/${oldTeamUids[i]}/team/${id}`, {method:'DELETE'}).then(res => {
                                    }).catch(console.log);
                                }

                        }).catch(console.log);
                    }
                }).catch(console.log);
                
                alert("Team Deleted Successfully!");
                props.history.push(`/teammgmt`)
            } else {
                console.log(data)
                alert("An error occured, please try again");
            }
        }).catch(console.log);
    }


    const addMember = () => {
        //TODO: CHECK FOR DUPLICATES, VALIDATE USER, ETC..
        //Checking if prior box is filled
        const enteredUid = newTeamMembers[newTeamMembers.length - 1][0];
         if (typeof enteredUid == 'string' && enteredUid.length==0){
            //input box is empty
            return;
        } else {
            setNewTeamMembers(currentTeamMembers => ([...currentTeamMembers, ["", "", ""]]));
        }
    }

    const verifyMember = () => {
        //TODO: CHECK FOR DUPLICATES, VALIDATE USER, ETC..
        //Checking if prior box is filled
        const enteredUid = newTeamMembers[newTeamMembers.length - 1][0];
        //Checking if string has been passed through and not a a questee object that was already there
        if (typeof enteredUid == 'string' && enteredUid.length != 0) {
            //Checking if UID is attributed to questee and person
            fetch(`${apiLink}/questees?uid=${enteredUid}`).then(res => res.json()).then(questeeData => {
                fetch(`${apiLink}/person/${questeeData[0].person_id}`).then(res => res.json()).then(personData => {
                    if (questeeData && personData) {
                        const potentialQuestee = [questeeData[0], personData[0].first_name, personData[0].last_name];

                        if (potentialQuestee) {
                            //Adding questee data and person name to members list  --Might need to error check this better
                            const values = [...newTeamMembers];
                            values[newTeamMembers.length - 1][0] = potentialQuestee[0];
                            values[newTeamMembers.length - 1][1] = potentialQuestee[1];
                            values[newTeamMembers.length - 1][2] = potentialQuestee[2];
                            //Updating state of members list
                            setNewTeamMembers(values);
                            return
                        } else {
                            //alert here
                            console.log("alert here")
                            return
                        }
                    } else {
                        console.log("an error occured while fetching")
                        return;
                    }
                }).catch(console.log);
            }).catch(console.log);

        } else {
            //input box above has questee stuff
            return;
        } 
    }

    const removeMember = index => {
        // const newValues = [...newTeamMembers];
        // newValues.splice(index, 1);
        // setNewTeamMembers(newValues);
        setNewTeamMembers(currentTeamMembers => (currentTeamMembers.filter((_, i) => i !== index)));
    }

    const handleMemberInputChange = (index, event) => {
        const values = [...newTeamMembers];
        values[index][0] = event.target.value;
        setNewTeamMembers(values);
    };

    const dynamicTeamEdit = () => {
        return (
            newTeamMembers.map((questee, index) =>
                <Fragment key={`~${index}`}>
                    <form className="form-row">
                        <div className="col-md-3 mb-3">
                            {/* //{(typeof questee[0] !== 'string') ? */}
                            {(questee[0] && questee[1]) ?
                                <input
                                    type="text"
                                    className="form-control-plaintext"
                                    id="uid"
                                    name="uid"
                                    value={questee[0].uid}
                                    //onChange={this.handleInputChange.bind(this, i)}
                                    readOnly={questee[0].uid} />
                                :
                                <input
                                    type="text"
                                    className="form-control"
                                    id="uid"
                                    name="uid"
                                    placeholder="uid"
                                    value={questee[0] ? questee[0] : null}
                                    onChange={event => handleMemberInputChange(index, event)}
                                    //onChange={e => setNewMemberToAdd(e.target.value)}
                                    required />}
                        </div>
                        {(questee[0] && questee[1]) ?
                            <div className="col-md-auto mb-3">
                                <input type="text" readOnly className="form-control-plaintext" id="firstName" value={questee.length ? questee[1] + " " + questee[2] : null} />
                            </div>
                            : null}
                        <div className="col-md-3 mb-3">
                        {(questee[0] && questee[1]) ?
                            <button
                                className="btn"
                                type="button"
                                onClick={() => removeMember(index)}>
                                <i className="fas fa-user-minus fa-lg"></i>
                            </button>
                            :
                            <div className="row">
                            <button
                                className="btn"
                                type="button"
                                onClick={() => verifyMember()}>
                                <i className="fas fa-user-check fa-lg"></i>
                            </button>

                            <button
                            className="btn"
                            type="button"
                            onClick={() => removeMember(index)}>
                            <i className="fas fa-user-minus fa-lg"></i>
                        </button>
                        </div>
                        }
                        </div>
                    </form>
                </Fragment>
            ))
    }

    //checking if this page was reached from a card with actual data
    if (teamData) {
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
                                <div className="col">
                                    <b style={{ fontSize: "4em", color: "white" }}>{teamData.name}</b>
                                </div>
                                <div className="col">
                                    <button className="btn btn-danger float-right" onClick={e => deleteTeam(e)}>Delete Team</button>
                                </div>
                            </div>

                            <div className="body mt-6">
                                <form className="needs-validation">
                                    <div className="form-row">
                                        <div className="col-md-3 mb-3">
                                            <label htmlFor="name">Team name</label>
                                            <input type="text" className="form-control" id="name" value={name} onChange={e => setName(e.target.value)} required />
                                        </div>
                                        <div className="custom-control custom-checkbox col-md-3 mb-3">
                                            <label htmlFor="semesterSeason">Semester</label>
                                            {/*Select gets default value by getting first word from semester string*/}
                                            <select className="custom-select" id="semesterSeason" value={semesterSeason} onChange={e => setSemesterSeason(e.target.value)}>
                                                <option value="Fall">Fall</option>
                                                <option value="Spring">Spring</option>
                                                <option value="Summer">Summer</option>
                                                <option value="Winter">Winter</option>
                                            </select>
                                        </div>
                                        <div className="custom-control custom-checkbox col-md-3 mb-3">
                                            <label htmlFor="semesterYear">Year</label>
                                            <select className="custom-select" id="semesterYear" value={semesterYear} onChange={e => setSemesterYear(e.target.value)}>
                                                <option value="2019">2019</option>
                                                <option value="2020">2020</option>
                                                <option value="2021">2021</option>
                                                <option value="2022">2022</option>
                                                <option value="2022">2023</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label htmlFor="course">Course</label>
                                            <input type="text" className="form-control" id="course" value={course} onChange={e => setCourse(e.target.value)} required />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        {/* TODO: POPULATE MEMBERS, GIVE OPTION TO DELETE, AND ADD */}
                                        <div className="col-md-9 mb-3">
                                            <h3 className="mb-5 mt-3" >Members</h3>
                                            <div className="form-row">
                                                <div className="col-md-3 mb-3">
                                                    <h5>UID</h5>
                                                </div>
                                                <div className="col-md-auto mb-3">
                                                    <h5>Name</h5>
                                                </div>
                                            </div>
                                            {dynamicTeamEdit()}
                                            <button
                                                className="btn"
                                                type="button"
                                                onClick={() => addMember()}
                                            >
                                                <i className="fas fa-user-plus fa-lg"></i>
                                            </button>
                                        </div>

                                    </div>
                                    {/* TODO: NEED TO ADD IN INFORMATION FROM THEIR USER TYPE */}
                                    <div className="form-row">
                                        <div className="col mb-3">
                                            <Link to={{ pathname: '/teammgmt/' }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
                                        </div>
                                        <div className="col mb-3">
                                            <button type="submit" className="btn btn-warning float-right" onClick={e => saveChanges(e)}>Save changes</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div>

                            </div>
                        </main>
                    </div>
                </div>
            </React.Fragment>
        )
    } else {
        props.history.push(`/teammgmt`)
        return (
            <h1>
                Error: No Team info
            </h1>
        )
    }
}

export default TeamInfo;
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
const CreateTeam = (props) => {
  //Ternary operators used below in case this form is called without props
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [semesterSeason, setSemesterSeason] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [course, setCourse] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState([["", "", ""]])



  useEffect(() => {
    document.title = "Team Information"
    //When initially rendered if the form has no props data then return to usermgmt
    if (!props.location) {
      props.history.push(`/teammgmt`)
    }
  }, [])

  const isValidListOfMembers = (members) => {
    const newTeamUids = members.map((questee, index) =>
      questee[0].id
    );
    return (!((new Set(newTeamUids)).size !== newTeamUids.length) && !(newTeamUids.includes(undefined)))

  }


  const createTeam = (e) => {
    e.preventDefault();
    //Ensure all objects in array are filled
    if (isValidListOfMembers(newTeamMembers)) {
      console.log("hello im in here")
      const requestOptionsTeam = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          semester: semesterSeason + " " + semesterYear,
          course: course
        })
      };

      const newTeamUids = newTeamMembers.map((questee, index) =>
        questee[0].id
      );
      //Linking team members to team
      fetch(`${apiLink}/teams`, requestOptionsTeam).then(res => res.json()).then(team => {
        console.log("team = ", team)
        for (var i = 0; i < newTeamUids.length; i++) {
          fetch(`${apiLink}/team/${team[0].id}/questee/${newTeamUids[i]}`, { method: 'POST' }).then(res => {
            console.log("res after team creation = ",res)
          })
        }

        //Linking team to team members
        for (var i = 0; i < newTeamUids.length; i++) {
          //first need to get questee and their teams,
          fetch(`${apiLink}/questee/${newTeamUids[i]}`, { method: 'GET' }).then(res => res.json()).then(oldTeam => {
            //then add the current team id to them
            console.log("old team = ", oldTeam)
            //If team is already found in questess list skip
            if (!oldTeam[0].team_ids.includes(team[0].id)) {
              //Concat new team id to questees list of ids
              const newQuesteesTeam = oldTeam[0].team_ids.concat(team[0].id);
              console.log("old questees team = ", newQuesteesTeam)

              //for (var j = 0; j < newQuesteesTeam.length; j++) {
                fetch(`${apiLink}/questee/${newTeamUids[i]}/team/${team[0].id}`, { method: 'POST' }).then(res => {
                  alert("Member Add Successful");
                })
              //}
            }
          })
        }
      })
    } else {
      alert("Check team members to ensure no duplicates or empty boxes exist");
    }
  }

  const addMember = () => {
    //TODO: CHECK FOR DUPLICATES, VALIDATE USER, ETC..
    //Checking if prior box is filled
    const enteredUid = newTeamMembers[newTeamMembers.length - 1][1];
    if (typeof enteredUid == 'string' && enteredUid.length == 0) {
      //input box is empty
      alert("Please enter a UID");
      return;
    } else {
      setNewTeamMembers(currentTeamMembers => ([...currentTeamMembers, ["", "", ""]]));
    }

  }

  const verifyMember = (index) => {
    //TODO: CHECK FOR DUPLICATES, VALIDATE USER, ETC..
    //Checking if prior box is filled
    const enteredUid = newTeamMembers[index][0];
    //Checking if string has been passed through and not a a questee object that was already there
    if (typeof enteredUid == 'string' && enteredUid.length != 0) {
      //Checking if UID is attributed to questee and person
      fetch(`${apiLink}/questees?uid=${enteredUid}`).then(res => res.json()).then(questeeData => {
        console.log(questeeData)
        if (questeeData.length == 0) {
          alert("Entered UID is not registered in our system. Please try another.");
          return;
        }
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
                    onClick={() => verifyMember(index)}>
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
                <b style={{ fontSize: "4em", color: "white" }}>Create Team</b>
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
                    <button type="submit" className="btn btn-warning float-right" onClick={e => createTeam(e)}>Create Team</button>
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
}

export default CreateTeam;
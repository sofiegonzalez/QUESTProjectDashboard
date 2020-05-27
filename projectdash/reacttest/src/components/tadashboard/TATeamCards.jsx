import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'

const apiLink = "http://127.0.0.1:5000/api";
//const apiLink = "https://api.questumd.com/api";

const TeamCards = ({
  teamData,
  from,
  teamId,
  teamName,
  teamSemester,
  teamCourse,
}) => {
  const [hasProject, setHasProject] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [questeeMemberData, setQuesteeMemberData] = useState([]);
  const [personMemberData, setPersonMemberData] = useState([]);


  useEffect(() => {
    //Checking if a team has a project in order to display a view/edit project button on its card in teammgmt
    //, or to hide it from team selection in create project
    fetch(`${apiLink}/projects?team_id=${teamData.id}`).then(res => res.json()).then(receivedProject => {
      if (receivedProject === undefined || receivedProject.length == 0) {
        //console.log("its empty")
        setHasProject(false);
      }
    }).catch(console.log);

    //Also grabbing all students information from each team to be displayed later
    if (teamData.questee_ids.length) {
      teamData.questee_ids.forEach(questeeId => {
        fetch(`${apiLink}/questee/${questeeId}`).then(res => res.json()).then(questeeData => {
          setQuesteeMemberData(currentQuestees => [...currentQuestees, questeeData[0]]);
          fetch(`${apiLink}/person/${questeeData[0].person_id}`).then(res => res.json()).then(personData => {
            setPersonMemberData(currentPersons => [...currentPersons, personData[0]]);
            setTeamMembers(currentMembers =>  [...currentMembers, [questeeData[0], personData[0].first_name, personData[0].last_name]]);
          }).catch(console.log);
        }).catch(console.log);
      });
    }

  }, [])

  switch (from) {
    case 'teammgmt':
      return (
        <div className="card text-white bg-dark mt-4 mr-3" key={teamData.id} style={{
          width: '20rem'
        }}>
          <div className="card-body text-white bg-dark">
            <h5 className="card-title text-white bg-dark">{teamData.name}</h5>
            <h5 className="card-title text-white bg-dark">{teamData.course}</h5>
            <h5 className="card-title text-white bg-dark">{teamData.semester}</h5>
          </div>
          <ul className="list-group list-group-flush">
            {
              Object.values(personMemberData).map(person => {
                return (
                  <li className="list-group-item text-white bg-dark">{person.first_name + " " + person.last_name}</li>
                )
              })
            }

          </ul>
          <div className="card-body">
            <Link to={{ pathname: '/teammgmt/teaminfo/', teamData: teamData, teamMembers: teamMembers, personsData: personMemberData, questeesData: questeeMemberData }}><button type="button" className="btn btn-success btn-sm float-left">View/Edit Team</button></Link>
            {hasProject ?
              <Link to={{ pathname: '/projectmgmt/projectinfo/', data: teamData, from: "/teammgmt/" }}>
                <button type="button" className="btn btn-info btn-sm float-right">View/Edit Project</button>
              </Link>
              : null}
          </div>
        </div>
      )

    case 'projectmodal':
      //When a cards select button is pressed the teams information is then passed to the create project parent page
      if (!hasProject) {
        function returnValuesToParent() {
          teamId(teamData.id);
          teamName(teamData.name);
          teamSemester(teamData.semester);
          teamCourse(teamData.course);
        }
        return (
          <div className="card text-white bg-dark mt-4 mr-3" key={teamData.id} style={{
            width: '20rem'
          }}>
            <div className="card-header text-white bg-dark">
              <h5 className="card-title text-white bg-dark">{teamData.name}</h5>
            </div>
            <div className="card-body text-white bg-dark">
              <h5 className="card-title text-white bg-dark">{teamData.course}</h5>
              <h5 className="card-title text-white bg-dark">{teamData.semester}</h5>
            </div>

            <div className="card-footer text-center">
              <button type="button" className="btn btn-warning btn-md" key={teamData.id} data-dismiss="modal"
                onClick={() => returnValuesToParent()}>Select Team</button>
            </div>
          </div>
        )
      } else { return null; }
  }
}

export default TeamCards

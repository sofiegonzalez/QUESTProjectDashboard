//TODO: Handle issue with password creation with user
//TODO: Adjust required fields on form

/*
This file dynamically brings up a form with fields relevant to
the appropriate user type
*/

import '../assets/css/custom.css';
import React, { Component, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom'
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
import axios from 'axios';
//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

// ---------- Create User Page ----------
class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      render: ''
    }
  }

  handleClick(userType, e) {
    this.setState({ render: userType });
  }

  populateForm() {
    switch (this.state.render) {
      case 'admin': return <AdminForm props={this.props} />
      case 'student': return <StudentForm props={this.props}/>
      case 'ta': return <TAForm props={this.props}/>
    }
  }

  handleFileUpload(event, resumePathSetter) {
    const data = new FormData()
    data.append('file', event.target.files[0])


    axios.post("https://api.questumd.com/api/poster/", data, { // receive two parameter endpoint url ,form data 
    })
      .then(res => { // then print response status
        resumePathSetter(res.data.url);
      })
  }

  render() {
    return (<React.Fragment>
      <AdminTopNavBar />
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">
          {/* Sidebar */}
          <AdminSidebar />
          {/* Page Content */}
          <main className="col-md-10 py-md-3 pl-md-5 bd-content" role="main">
            {/* Start of user creation */}
            <h1 className="display-6">Create User</h1>
            {/* Select User Type */}
            <form>
              <label htmlFor="accounttypeselection" className="display-6 col mx-auto text-lg">Select Account Type:</label>
              <div className="btn-group btn-group-toggle col " id="accounttypeselection" data-toggle="buttons">
                <label className="btn btn-primary btn-md ">
                  <input type="radio" name="accounttype" id="student" autoComplete="off" onClick={this.handleClick.bind(this, 'student')} />
                  Student
                </label>
                <label className="btn btn-secondary btn-md">
                  <input type="radio" name="accounttype" id="ta" autoComplete="off" onClick={this.handleClick.bind(this, 'ta')} />
                  TA
                </label>
                <label className="btn btn-danger btn-md">
                  <input type="radio" name="accounttype" id="admin" autoComplete="off" onClick={this.handleClick.bind(this, 'admin')} />
                  Admin
                </label>
              </div>
            </form>
            {/*Selection done above populatates a form respective to the user type below*/}
            {this.populateForm()}

          </main>
        </div>
      </div>
    </React.Fragment>);
  }
}

const AdminForm = ({props}) => {
  //User attributes
  const [email, setEmail] = useState("");
  //also includes password which is defaulted ATM 
  //Person attributes
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  //Admin attributes
  const [officeHours, setOfficeHours] = useState("");
  const [office, setOffice] = useState("");
  //also includes id, and userID - gotten from API requests

  //Function used to submit Admin form
  async function createNewAdmin(e) {
    e.preventDefault();

    var bearer = 'Bearer ' + localStorage.getItem('usertoken');


    const requestOptionsUser = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,
       'Authorization': bearer
    },
      body: JSON.stringify({
                email: email,
        pwd: 'Ronaldo'
      })
    };

    //First creating a user
    fetch(`${apiLink}/users`, requestOptionsUser).then(res => res.json()).then(postUser => {

      //Next get the created users ID
      fetch(`${apiLink}/users?email=${email}`).then(res => res.json()).then(gotUser => {
        console.log(gotUser)
        console.log(gotUser[0].id)
         var bearer = 'Bearer ' + localStorage.getItem('usertoken');

        const requestOptionsPerson = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
          'Authorization': bearer },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            pronoun: pronouns,
            contact_email: email,
            title: title,
            work_city: city,
            work_state: state,
            linkedin: linkedIn,
            user_id: gotUser[0].id
          })
        };

        //Next create a person
        fetch(`${apiLink}/persons`, requestOptionsPerson).then(res => res.json()).then(person => {
          console.log(person)
          const requestOptionsAdmin = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,
          'Authorization': bearer},
            body: JSON.stringify({
              office: office,
              office_hours: officeHours,
              person_id: person[0].id
            })
          };

          //Finally create an Admin
          fetch(`${apiLink}/admins`, requestOptionsAdmin).then(res => res.json()).then(admin => {
            alert("Admin created Succesfully!");
            props.history.push('/usermgmt');
            console.log(admin)
          }).catch(console.log);
        }).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);
  }

  return (
    <React.Fragment>
      <form className="mt-3" onSubmit={createNewAdmin}>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault01">First name</label>
            <input type="text" className="form-control" id="validationDefault01" onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Last name</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefaultUsername"> 
            <i style={{color: "Dodgerblue"}}className="fas fa-asterisk fa-xs"/> Email</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupPrepend2">@</span>
              </div>
              <input type="text" className="form-control" id="validationDefaultUsername" onChange={e => setEmail(e.target.value)} aria-describedby="inputGroupPrepend2" required />
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Pronouns</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setPronouns(e.target.value)} placeholder="e.g. She/Her, He/Him" />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault03">City</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setCity(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">State</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setState(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Title</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Office</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setOffice(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-6 mb-3">
            <label htmlFor="validationDefault03">LinkedIn URL</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setLinkedIn(e.target.value)} placeholder="e.g.http://ca.linkedin.com/in/linkedinyourname" />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="validationDefault05">Office Hours</label>
            <textarea type="text" className="form-control" id="validationDefault05" onChange={e => setOfficeHours(e.target.value)} defaultValue="MWF 1-2pm, TuThu 3-4pm, etc.." onChange={e => setOfficeHours(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-danger" onSubmit={createNewAdmin} type="createAdmin">Create Admin</button>
      </form>
    </React.Fragment>
  )
}


const StudentForm = ({props}) => {
  //User attributes
  const [email, setEmail] = useState("");
  //Person attributes
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  //Questee attributes
  const [majorOne, setMajorOne] = useState("");
  const [majorTwo, setMajorTwo] = useState("");
  const [uid, setUid] = useState("");
  const [gradStatus, setGradStatus] = useState("");
  const [involved, setInvolved] = useState("1");
  const [areaOfExpertise, setAreaOfExpertise] = useState("");
  const [pastInternships, setPastInternships] = useState("");
  const [questClubs, setQuestClubs] = useState("");
  //also includes resume_id, person_id, and cohort_id 
  const [resume, setResume] = useState("");

  async function createNewStudent(e) {
    e.preventDefault();
     var bearer = 'Bearer ' + localStorage.usertoken;

    const requestOptionsUser = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
      'Authorization': bearer },
      body: JSON.stringify({
        email: email,
        pwd: 'Ronaldo'
      })
    };

    //First creating a user
    fetch(`${apiLink}/users`, requestOptionsUser).then(res => res.json()).then(postUser => {

      //Next get the created users ID
      fetch(`${apiLink}/users?email=${email}`).then(res => res.json()).then(gotUser => {
        console.log(gotUser)

        const requestOptionsPerson = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
          'Authorization': bearer },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            pronoun: pronouns,
            contact_email: email,
            title: title,
            work_city: city,
            work_state: state,
            linkedin: linkedIn,
            user_id: gotUser[0].id
          })
        };

        //Next create a person
        fetch(`${apiLink}/persons`, requestOptionsPerson).then(res => res.json()).then(person => {
          console.log(person)
          const requestOptionsQuestee = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
            'Authorization': bearer },
            body: JSON.stringify({
              major: majorOne,
              major2: majorTwo,
              grad_status: gradStatus,
              uid: uid,
              involved: involved,
              area_of_expertise: areaOfExpertise,
              past_internships: pastInternships,
              quest_clubs: questClubs,
              //resume_id: 0, //TODO: GET RESUME ID 
              person_id: person[0].id,
              cohort_id: 1 //TODO: GET COHORT ID 
            })
          };
          //Next create a resume
          //fetch(`${apiLink}/resumes`, requestOptionsPerson).then(res => res.json()).then(resume => {

          //Finally create a Questee
          fetch(`${apiLink}/questees`, requestOptionsQuestee).then(res => res.json()).then(questee => {
            console.log(questee)
            alert("Questee created Succesfully!");
            props.history.push(`/usermgmt`);
          }).catch(console.log);
        }).catch(console.log);
        //}).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);
  }


  return (
    <React.Fragment>
      <form className="mt-3" onSubmit={createNewStudent}>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault01">First name</label>
            <input type="text" className="form-control" id="validationDefault01" onChange={e => setFirstName(e.target.value)}  />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Last name</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setLastName(e.target.value)}  />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefaultUsername"> 
            <i style={{color: "Dodgerblue"}}className="fas fa-asterisk fa-xs"/> Email</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupPrepend2">@</span>
              </div>
              <input type="text" className="form-control" id="validationDefaultUsername" onChange={e => setEmail(e.target.value)} aria-describedby="inputGroupPrepend2" required />
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">
            <i style={{color: "Dodgerblue"}}className="fas fa-asterisk fa-xs"/> UID</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setUid(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault03">City</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setCity(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">State</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setState(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault03">LinkedIn URL</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setLinkedIn(e.target.value)} placeholder="e.g.http://ca.linkedin.com/in/linkedinyourname" />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Pronouns</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setPronouns(e.target.value)} placeholder="e.g. She/Her, He/Him" />
          </div>
        </div>

        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="customCheck1">Alumni?</label>
            <select className="custom-select" id="customCheck1" onChange={e => setGradStatus(e.target.value)} >
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="customCheck2">Involved?</label>
            <select className="custom-select" id="customCheck2" onChange={e => setInvolved(e.target.value)}>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Major 1</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setMajorOne(e.target.value)} placeholder="e.g. History ..." />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Major 2</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setMajorTwo(e.target.value)} placeholder="e.g. Art ..." />
          </div>
          <div className="col-md-2 mb-3">
            <label htmlFor="validationDefault04">Title</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setTitle(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault05">QUEST Club(s)</label>
            <textarea type="text" className="form-control" id="validationDefault05" onChange={e => setQuestClubs(e.target.value)} placeholder="e.g. Club1, Club2, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault05">Past Intership(s)</label>
            <textarea type="text" className="form-control" id="validationDefault05" onChange={e => setPastInternships(e.target.value)} placeholder="e.g. Engineer, Librarian, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault03">Areas of Expertise</label>
            <textarea type="text" className="form-control" id="validationDefault03" onChange={e => setAreaOfExpertise(e.target.value)} />
          </div>
        </div>
        {/* <div className="form-row">
          TODO: Upload resume then send link
          <div className="col-md-3 mb-3 float-left">
            <label htmlFor="exampleFormControlFile1">Upload Resume</label>
            <input type="file" className="form-control-file" id="exampleFormControlFile1" /> onChange={e => setResume(e.target.value)}
          </div> 
        </div>*/}
        <button className="btn btn-primary" type="createAdmin">Create Student</button>
      </form>
    </React.Fragment>
  )
}

const TAForm = ({props}) => {
  //User attributes
  const [email, setEmail] = useState("");
  //Person attributes
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  //Questee attributes
  const [majorOne, setMajorOne] = useState("");
  const [majorTwo, setMajorTwo] = useState("");
  const [uid, setUid] = useState("");
  const [gradStatus, setGradStatus] = useState("");
  const [involved, setInvolved] = useState("");
  const [areaOfExpertise, setAreaOfExpertise] = useState("");
  const [pastInternships, setPastInternships] = useState("");
  const [questClubs, setQuestClubs] = useState("");
  //also includes resume_id, person_id, and cohort_id 
  const [resume, setResume] = useState("");
  //TA attributes
  const [course, setCourse] = useState("");
  const [semesterSeason, setSemesterSeason] = useState("");
  const [semesterYear, setSemesterYear] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [office, setOffice] = useState("");
  //also includes questee_id


  const submitTaForm = e => {
    e.preventDefault();
     var bearer = 'Bearer ' + localStorage.getItem('usertoken');

    const requestOptionsUser = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,
    'Authorization': bearer},
      body: JSON.stringify({ 
        email: email,
        pwd: 'Ronaldo'
      })
    };

    //First creating a user
    fetch(`${apiLink}/users`, requestOptionsUser).then(res => res.json()).then(postUser => {

      //Next get the created users ID
      fetch(`${apiLink}/users?email=${email}`).then(res => res.json()).then(getUser => {
        console.log(getUser)
        const requestOptionsPerson = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json',
          'Authorization': bearer },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            pronoun: pronouns,
            contact_email: email,
            title: title,
            work_city: city,
            work_state: state,
            linkedin: linkedIn,
            user_id: getUser[0].id
          })
        };

        //Next create a person
        fetch(`${apiLink}/persons`, requestOptionsPerson).then(res => res.json()).then(person => {
          console.log(person)
          const requestOptionsQuestee = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
            'Authorization': bearer },
            body: JSON.stringify({
              major: majorOne,
              major2: majorTwo,
              grad_status: gradStatus,
              uid: uid,
              involved: involved,
              area_of_expertise: areaOfExpertise,
              past_internships: pastInternships,
              quest_clubs: questClubs,
              //resume_id: 0, //TODO: GET RESUME ID SOMEHOW
              person_id: person[0].id,
              cohort_id: 1 //TODO: GET COHORT ID SOMEHOW
            })
          };

          //Next create a Questee
          fetch(`${apiLink}/questees`, requestOptionsQuestee).then(res => res.json()).then(questee => {
            console.log(questee)
            const requestOptionsTa = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json',
              'Authorization': bearer },
              body: JSON.stringify({
                course: course,
                semester: semesterSeason + semesterYear,
                office_hours: officeHours,
                office: office,
                questee_id: questee[0].id
              })
            };

            //Finally create a Ta
            fetch(`${apiLink}/tas`, requestOptionsTa).then(res => res.json()).then(ta => {
              console.log(ta)
              alert("TA created Succesfully!");
            props.history.push(`/usermgmt`);
            }).catch(console.log);
          }).catch(console.log);
        }).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);
  }



  return (
    <React.Fragment>
      <form className="mt-3" onSubmit={submitTaForm}>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault01">First name</label>
            <input type="text" className="form-control" id="validationDefault01" onChange={e => setFirstName(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Last name</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefaultUsername">
            <i style={{color: "Dodgerblue"}}className="fas fa-asterisk fa-xs"/> Email</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupPrepend2">@</span>
              </div>
              <input type="text" className="form-control" id="validationDefaultUsername" onChange={e => setEmail(e.target.value)} aria-describedby="inputGroupPrepend2" required />
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">
            <i style={{color: "Dodgerblue"}}className="fas fa-asterisk fa-xs"/> UID</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setUid(e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="customCheck2">Course</label>
            <select className="custom-select" id="customCheck2" onChange={e => setCourse(e.target.value)}>
              <option defaultValue value="490">490</option>
              <option value="390">390</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="customCheck2">Semester</label>
            <select className="custom-select" id="customCheck2" onChange={e => setSemesterSeason(e.target.value)}>
              <option defaultValue value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="customCheck2">Year</label>
            <select className="custom-select" id="customCheck2" onChange={e => setSemesterYear(e.target.value)}>
              <option defaultValue value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2022">2023</option>
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Office</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setOffice(e.target.value)} />
          </div>
        </div>

        <div className="form-row mb-3">
          <label htmlFor="validationDefault05">Office Hours</label>
          <textarea type="text" className="form-control" id="validationDefault05" defaultValue="MWF 1-2pm, TuThu 3-4pm, etc.." onChange={e => setOfficeHours(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault03">City</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setCity(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">State</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setState(e.target.value)} />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault03">LinkedIn URL</label>
            <input type="text" className="form-control" id="validationDefault03" onChange={e => setLinkedIn(e.target.value)} placeholder="e.g.http://ca.linkedin.com/in/linkedinyourname" />
          </div>
          {/* TODO: Upload resume then send link */}
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault02">Pronouns</label>
            <input type="text" className="form-control" id="validationDefault02" onChange={e => setPronouns(e.target.value)} placeholder="e.g. She/Her, He/Him" />
          </div>
        </div>

        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="customCheck1">Alumni?</label>
            <select className="custom-select" id="customCheck1" onChange={e => setGradStatus(e.target.value)}>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="customCheck2">Involved?</label>
            <select className="custom-select" id="customCheck2" onChange={e => setInvolved(e.target.value)}>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Major 1</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setMajorOne(e.target.value)} placeholder="e.g. History ..." />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="validationDefault04">Major 2</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setMajorTwo(e.target.value)} placeholder="e.g. Art ..." />
          </div>
          <div className="col-md-2 mb-3">
            <label htmlFor="validationDefault04">Title</label>
            <input type="text" className="form-control" id="validationDefault04" onChange={e => setTitle(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault05">QUEST Club(s)</label>
            <textarea type="text" className="form-control" id="validationDefault05" onChange={e => setQuestClubs(e.target.value)} placeholder="e.g. Club1, Club2, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault05">Past Intership(s)</label>
            <textarea type="text" className="form-control" id="validationDefault05" onChange={e => setPastInternships(e.target.value)} placeholder="e.g. Engineer, Librarian, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="validationDefault03">Areas of Expertise</label>
            <textarea type="text" className="form-control" id="validationDefault03" onChange={e => setAreaOfExpertise(e.target.value)} />
          </div>
        </div>
        {/* <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="exampleFormControlFile1">Upload Resume</label>
            <input type="file" className="form-control-file" id="exampleFormControlFile1" /> onChange={e => setResume(e.target.value)}
          </div>
        </div> */}
        <button className="btn btn-secondary" type="createAdmin" onSubmit={submitTaForm}>Create TA</button>

      </form>
    </React.Fragment>
  )
}

export default CreateUser;

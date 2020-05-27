/*This is where an admin is taken in order to see all the information about a user*/
//TODO: HANDLE ERRORS CORRECTLY ("INVALID INPUT", "COULD NOT UPDATE", "API FAILED", REDIRECT WHEN NO USER CARD INFO...)


import React from 'react';
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

// ---------- User Info Page ----------
class UserInfo extends React.Component {
  constructor(props) {
    super(props);
    const { userData, userType } = this.props.location;

    if (userData) {
      //Checking which one of the 3 user types is coming in 
      if (userType == QUESTEE) {
        this.state = {
          //Person data
          id: userData[0].id,
          first_name: userData[0].first_name,
          last_name: userData[0].last_name,
          pronoun: userData[0].pronoun,
          contact_email: userData[0].contact_email,
          title: userData[0].title,
          work_city: userData[0].work_city,
          work_state: userData[0].work_state,
          linkedin: userData[0].linkedin,
          //Questee Data
          questeeId: userData[1].id,
          major: userData[1].major,
          major2: userData[1].major2,
          grad_status: userData[1].grad_status,
          uid: userData[1].uid,
          involved: userData[1].involved,
          areas_of_expertise: userData[1].areas_of_expertise,
          past_internships: userData[1].past_internships,
          quest_clubs: userData[1].quest_clubs

        }
      } else if (userType == ADMIN) {
        this.state = {
          //Person data
          id: userData[0].id,
          first_name: userData[0].first_name,
          last_name: userData[0].last_name,
          pronoun: userData[0].pronoun,
          contact_email: userData[0].contact_email,
          title: userData[0].title,
          work_city: userData[0].work_city,
          work_state: userData[0].work_state,
          linkedin: userData[0].linkedin,
          //Admin data
          adminId: userData[1].id,
          office: userData[1].office,
          office_hours: userData[1].office_hours,

        }
      } else if (userType == TA) {
        this.state = {
          //Person data
          id: userData[0].id,
          first_name: userData[0].first_name,
          last_name: userData[0].last_name,
          pronoun: userData[0].pronoun,
          contact_email: userData[0].contact_email,
          title: userData[0].title,
          work_city: userData[0].work_city,
          work_state: userData[0].work_state,
          linkedin: userData[0].linkedin,
          //Questee Data
          questeeId: userData[1].id,
          major: userData[1].major,
          major2: userData[1].major2,
          grad_status: userData[1].grad_status,
          uid: userData[1].uid,
          involved: userData[1].involved,
          areas_of_expertise: userData[1].areas_of_expertise,
          past_internships: userData[1].past_internships,
          quest_clubs: userData[1].quest_clubs,
          //TA data
          taId: userData[2].id,
          course: userData[2].course,
          semester: userData[2].semester,
          semesterSeason: userData[2].semester.substr(0, userData[2].semester.indexOf(' ')),
          semesterYear: userData[2].semester.substr(userData[2].semester.indexOf(' ') + 1),
          office_hours: userData[2].office_hours,
          office: userData[2].office
        }
      }
    }
    this.renderQuesteeForm.bind(this)
    this.renderAdminForm.bind(this)
    this.renderTaForm.bind(this)
  }

  componentDidMount() {
    document.title = "User Information"
  }
  /*
  The following 3 functions are making the appropriate api calls to update the
  respective users' tables
  */

  async saveQuesteeChanges(e) {
    e.preventDefault();
    const { id, first_name, last_name, pronoun, contact_email, title, work_city,
      work_state, linkedin, questeeId, major, major2, grad_status, uid, involved, areas_of_expertise,
      past_internships, quest_clubs } = this.state;

    //Need to update 2 tables
    const requestOptionsUpdatePerson = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('usertoken')},
      body: JSON.stringify({
        first_name,
        last_name,
        pronoun,
        contact_email,
        title,
        work_city,
        work_state,
        linkedin
      })
    };

    const requestOptionsUpdateQuestee = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('usertoken')},
      body: JSON.stringify({
        major,
        major2,
        grad_status,
        uid,
        involved,
        areas_of_expertise,
        past_internships,
        quest_clubs
      })
    };

    fetch(`${apiLink}/person/${id}`, requestOptionsUpdatePerson).then(res => res.json()).then(data => {
      console.log(data)
      fetch(`${apiLink}/questee/${questeeId}`, requestOptionsUpdateQuestee).then(res => res.json()).then(data => {
        console.log(data)
        if (data) {
          alert("Questee Updated Successfully!");
          this.props.history.push(`/usermgmt`)
        } else {
          console.log(data)
          alert("Invalid field, please try again");
        }
      }).catch(console.log);
    }).catch(console.log);;
  }

  async saveTaChanges(e) {
    e.preventDefault();
    const { id, first_name, last_name, pronoun, contact_email, title, work_city,
      work_state, linkedin, questeeId, major, major2, grad_status, uid, involved, areas_of_expertise,
      past_internships, quest_clubs, course, taId, office_hours, office, semesterSeason, semesterYear } = this.state;

    //Need to update 3 tables
    const requestOptionsUpdatePerson = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + localStorage.getItem('usertoken')},
      body: JSON.stringify({
        first_name,
        last_name,
        pronoun,
        contact_email,
        title,
        work_city,
        work_state,
        linkedin
      })
    };

    const requestOptionsUpdateQuestee = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('usertoken')},
      body: JSON.stringify({
        major,
        major2,
        grad_status,
        uid,
        involved,
        areas_of_expertise,
        past_internships,
        quest_clubs
      })
    };

    const requestOptionsUpdateTa = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('usertoken') },
      body: JSON.stringify({
        course,
        semester: semesterSeason + " " + semesterYear,
        office_hours,
        office
      })
    };

    fetch(`${apiLink}/person/${id}`, requestOptionsUpdatePerson).then(res => res.json()).then(data => {
      fetch(`${apiLink}/questee/${questeeId}`, requestOptionsUpdateQuestee).then(res => res.json()).then(data => {
        fetch(`${apiLink}/ta/${taId}`, requestOptionsUpdateTa).then(res => res.json()).then(data => {
          if (data) {
            console.log(data)
            alert("TA Updated Successfully!");
            this.props.history.push(`/usermgmt`)
          } else {
            console.log(data)
            alert("Invalid field, please try again");
          }
        }).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);;
  }

  async saveAdminChanges(e) {
    e.preventDefault();
    const { id, first_name, last_name, pronoun, contact_email, title, work_city,
      work_state, linkedin, office_hours, office, adminId } = this.state;

    //Need to update 2 tables
    const requestOptionsUpdatePerson = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + localStorage.getItem('usertoken') },
      body: JSON.stringify({
        first_name,
        last_name,
        pronoun,
        contact_email,
        title,
        work_city,
        work_state,
        linkedin
      })
    };
    const requestOptionsUpdateAdmin = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + localStorage.getItem('usertoken') },
      body: JSON.stringify({
        office,
        office_hours
      })
    };

    fetch(`${apiLink}/person/${id}`, requestOptionsUpdatePerson).then(res => res.json()).then(data => {
      fetch(`${apiLink}/admin/${adminId}`, requestOptionsUpdateAdmin).then(res => res.json()).then(data => {
        console.log(data)
        if (data) {
          alert("Admin Updated Successfully!");
          this.props.history.push(`/usermgmt`)
        } else {
          console.log(data)
          alert("Invalid field, please try again");
        }
      }).catch(console.log);
    }).catch(console.log);
  }

  /*
  The following 3 functions are making the appropriate api calls to delete
  respective users and their tables
  */

  async deleteQuestee(e) {
    e.preventDefault();
    const { id, questeeId } = this.state;

    const requestOptionsDeleteQuestee = {
      method: 'DELETE',
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('usertoken')}
    }
    //Need to delete 2 tables
    fetch(`${apiLink}/person/${id}`, requestOptionsDeleteQuestee).then(res => {
      fetch(`${apiLink}/questee/${questeeId}`, requestOptionsDeleteQuestee).then(res => {
        console.log(res)

        if (res.ok) {
          alert("Questee Deleted Successfully!");
          this.props.history.push(`/usermgmt`)
        } else {
          console.log(res)
          alert("An error occured, please try again");
        }
      }).catch(console.log);
    }).catch(console.log);

  }

  async deleteTa(e) {
    e.preventDefault();
    const { id, questeeId, taId } = this.state;

    const requestOptionsDeleteTa = {
      method: 'DELETE',
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('usertoken')}
    }
    //Need to update 3 tables
    fetch(`${apiLink}/person/${id}`, requestOptionsDeleteTa).then(res => res.json()).then(data => {
      fetch(`${apiLink}/questee/${questeeId}`, requestOptionsDeleteTa).then(res => res.json()).then(data => {
        fetch(`${apiLink}/ta/${taId}`, requestOptionsDeleteTa).then(res => res.json()).then(data => {
          if (data) {
            console.log(data)
            alert("TA Deleted Successfully!");
            this.props.history.push(`/usermgmt`)
          } else {
            console.log(data)
            alert("An error occured, please try again");
          }
        }).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);
  }

  async deleteAdmin(e) {
    e.preventDefault();
    const { id, adminId } = this.state;

    const requestOptionsDeleteAdmin = {
      method: 'DELETE',
      headers: {'Authorization': 'Bearer ' + localStorage.getItem('usertoken')}
    }
    //Need to update 2 tables
    fetch(`${apiLink}/person/${id}`, requestOptionsDeleteAdmin).then(res => res.json()).then(data => {
      fetch(`${apiLink}/admin/${adminId}`, requestOptionsDeleteAdmin).then(res => res.json()).then(data => {
        if (data) {
          alert("Admin Deleted Successfully!");
          this.props.history.push(`/usermgmt`)
        } else {
          console.log(data)
          alert("An error occured, please try again");
        }
      }).catch(console.log);
    }).catch(console.log);
  }


  handleInputChange(e) {
    e.preventDefault();
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  renderQuesteeForm() {
    const { major, major2, grad_status, uid, involved, areas_of_expertise,
      past_internships, quest_clubs } = this.state;

    return (
      <form className="mt-3" >
        <b style={{ fontSize: "3em", color: "white" }}>QUESTEE Information</b>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="uid">UID</label>
            <input type="text" className="form-control" name="uid" value={uid} onChange={(e) => this.handleInputChange(e)} required />
          </div>
        </div>

        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="grad_status">Alumni?</label>
            <select className="custom-select" name="grad_status" value={grad_status} onChange={(e) => this.handleInputChange(e)} required>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="involved">Involved?</label>
            <select className="custom-select" name="involved" value={involved} onChange={(e) => this.handleInputChange(e)}>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="major">Major 1</label>
            <input type="text" className="form-control" name="major" value={major} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. History ..." required />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="major2">Major 2</label>
            <input type="text" className="form-control" name="major2" value={major2} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Art ..." />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-4 mb-3">
            <label htmlFor="quest_clubs">QUEST Club(s)</label>
            <textarea type="text" className="form-control" name="quest_clubs" rows="5" value={quest_clubs} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Club1, Club2, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="past_internships">Past Intership(s)</label>
            <textarea type="text" className="form-control" name="past_internships" rows="5" value={past_internships} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Engineer, Librarian, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="areas_of_expertise">Areas of Expertise</label>
            <textarea type="text" className="form-control" name="areas_of_expertise" rows="5" value={areas_of_expertise} onChange={(e) => this.handleInputChange(e)} />
          </div>
        </div>

        <div className="form-row">
          <div className="col mb-3">
            <Link to={{ pathname: '/usermgmt/' }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
          </div>
          <div className="col mb-3">
            <button type="submit" onClick={e => this.saveQuesteeChanges(e)} className="btn btn-warning float-right">Save changes</button>
          </div>
        </div>
      </form>
    )
  }

  renderTaForm() {
    const { major, major2, grad_status, uid, involved, areas_of_expertise, past_internships,
      quest_clubs, taId, course, semester, office_hours, office, semesterSeason, semesterYear } = this.state;

    return (

      <form className="mt-3" >
        {/* Questee information below */}
        <b style={{ fontSize: "3em", color: "white" }}>QUESTEE Information</b>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="uid">UID</label>
            <input type="text" className="form-control" name="uid" value={uid} onChange={(e) => this.handleInputChange(e)} required />
          </div>
        </div>

        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="grad_status">Alumni?</label>
            <select className="custom-select" name="grad_status" value={grad_status} onChange={(e) => this.handleInputChange(e)} required>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-2 mb-3">
            <label htmlFor="involved">Involved?</label>
            <select className="custom-select" name="involved" value={involved} onChange={(e) => this.handleInputChange(e)}>
              <option defaultValue>Choose...</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="major">Major 1</label>
            <input type="text" className="form-control" name="major" value={major} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. History ..." required />
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="major2">Major 2</label>
            <input type="text" className="form-control" name="major2" value={major2} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Art ..." />
          </div>
        </div>
        <div className="form-row">
          <div className="col-md-4 mb-3">
            <label htmlFor="quest_clubs">QUEST Club(s)</label>
            <textarea type="text" className="form-control" name="quest_clubs" rows="5" value={quest_clubs} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Club1, Club2, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="past_internships">Past Intership(s)</label>
            <textarea type="text" className="form-control" name="past_internships" rows="5" value={past_internships} onChange={(e) => this.handleInputChange(e)} placeholder="e.g. Engineer, Librarian, ..." />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="areas_of_expertise">Areas of Expertise</label>
            <textarea type="text" className="form-control" name="areas_of_expertise" rows="5" value={areas_of_expertise} onChange={(e) => this.handleInputChange(e)} />
          </div>
        </div>

        {/* TA information below */}
        <b className="mt-4" style={{ fontSize: "3em", color: "white" }}>TA Information</b>
        <div className="form-row">
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="course">Course</label>
            <select className="custom-select" name="course" value={course} onChange={(e) => this.handleInputChange(e)}>
              <option value="490">490</option>
              <option value="390">390</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="semesterSeason">Semester</label>
            <select className="custom-select" name="semesterSeason" value={semesterSeason} onChange={(e) => this.handleInputChange(e)}>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
          </div>
          <div className="custom-control custom-checkbox col-md-3 mb-3">
            <label htmlFor="semesterYear">Year</label>
            <select className="custom-select" name="semesterYear" value={semesterYear} onChange={(e) => this.handleInputChange(e)}>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2022">2023</option>
            </select>
          </div>
          <div className="col-md-3 mb-3">
            <label htmlFor="office">Office</label>
            <input type="text" className="form-control" name="office" value={office} onChange={(e) => this.handleInputChange(e)} />
          </div>
        </div>

        <div className="form-row mb-3">
          <label htmlFor="office_hours">Office Hours</label>
          <textarea type="text" className="form-control" name="office_hours" value={office_hours} defaultValue="MWF 1-2pm, TuThu 3-4pm, etc.." onChange={(e) => this.handleInputChange(e)} />
        </div>

        <div className="form-row">
          <div className="col mb-3">
            <Link to={{ pathname: '/usermgmt/' }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
          </div>
          <div className="col mb-3">
            <button type="submit" onClick={e => this.saveTaChanges(e)} className="btn btn-warning float-right">Save changes</button>
          </div>
        </div>
      </form>
    )
  }

  renderAdminForm() {
    const { office, office_hours } = this.state;
    return (
      <form className="mt-3">
        <b style={{ fontSize: "3em", color: "white" }}>Admin Information</b>
        <div className="form-row">
          <div className="col-md-3 mb-3">
            <label htmlFor="office">Office</label>
            <input type="text" className="form-control" name="office" value={office} onChange={(e) => this.handleInputChange(e)} />
          </div>
          <div className="col-md-5 mb-3">
            <label htmlFor="office_hours">Office Hours</label>
            <textarea type="text" className="form-control" name="office_hours" value={office_hours} onChange={(e) => this.handleInputChange(e)} />
          </div>
        </div>
        <div className="form-row">
          <div className="col mb-3">
            <Link to={{ pathname: '/usermgmt/' }}><button type="button" className="btn btn-secondary float-left" data-dismiss="modal">Back</button></Link>
          </div>
          <div className="col mb-3">
            <button type="submit" onClick={e => this.saveAdminChanges(e)} className="btn btn-warning float-right">Save changes</button>
          </div>
        </div>
      </form>
    )
  }

  render() {
    //Checking if this page was reached from a card with actual userData
    if (this.props.location.userData) {
      const { first_name, last_name, pronoun, contact_email, title, work_city,
        work_state, linkedin } = this.state;

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
                    <b style={{ fontSize: "4em", color: "white" }}>{this.props.location.userData[0].first_name} {this.props.location.userData[0].last_name}</b>
                  </div>
                  <div className="col">
                    {/* {this.props.location.userType == QUESTEE && <button className="btn btn-danger float-right" onClick={e => this.deleteQuestee(e)}>Remove Questee</button>}
                    {this.props.location.userType == TA && <button className="btn btn-danger float-right" onClick={e => this.deleteTa(e)}>Remove TA</button>}
                    {this.props.location.userType == ADMIN && <button className="btn btn-danger float-right" onClick={e => this.deleteAdmin(e)}>Remove Admin</button>} */}

                  </div>
                </div>
                {/*Person information below */}
                <div className="body mt-6">
                  <form className="needs-validation">
                    <div className="form-row">
                      <div className="col mb-3">
                        <label htmlFor="first_name">First name</label>
                        <input type="text" className="form-control" name="first_name" value={first_name} onChange={(e) => this.handleInputChange(e)} required="required" />
                      </div>
                      <div className="col mb-3">
                        <label htmlFor="last_name">Last name</label>
                        <input type="text" className="form-control" name="last_name" value={last_name} onChange={(e) => this.handleInputChange(e)} required="required" />
                      </div>
                      <div className="col mb-3">
                        <label htmlFor="pronoun">Pronouns</label>
                        <input type="text" className="form-control" name="pronoun" value={pronoun} onChange={(e) => this.handleInputChange(e)} required="required" />
                      </div>
                      <div className="col mb-3">
                        <label htmlFor="title">Title</label>
                        <input type="text" className="form-control" name="title" value={title} onChange={(e) => this.handleInputChange(e)} />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="col mb-3">
                        <label htmlFor="contact_email">Email</label>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text" id="inputGroupPrepend2">@</span>
                          </div>
                          <input require="require" type="email" className="form-control" name="contact_email" aria-describedby="inputGroupPrepend2" value={contact_email} onChange={(e) => this.handleInputChange(e)} />
                        </div>
                      </div>
                      <div className="col mb-3">
                        <label htmlFor="work_city">City</label>
                        <input require="require" type="text" className="form-control" name="work_city" value={work_city} onChange={(e) => this.handleInputChange(e)} />
                      </div>
                      <div className="col mb-3">
                        <label htmlFor="work_state">State</label>
                        <input type="text" className="form-control" name="work_state" value={work_state} onChange={(e) => this.handleInputChange(e)} required="required" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="col mb-3">
                        <label htmlFor="linkedin">LinkedIn URL</label>
                        <input type="text" className="form-control" name="linkedin" value={linkedin} onChange={(e) => this.handleInputChange(e)} />
                      </div>
                    </div>
                    {/* Respective user info generated here*/}
                    {this.props.location.userType == QUESTEE && this.renderQuesteeForm()}
                    {this.props.location.userType == TA && this.renderTaForm()}
                    {this.props.location.userType == ADMIN && this.renderAdminForm()}
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
      //The page was not given any data so go back to usermgmt
      this.props.history.push(`/usermgmt`)
      return (
        <h1>
          Error: No user info
        </h1>
      )
    }
  }
}

export default UserInfo;

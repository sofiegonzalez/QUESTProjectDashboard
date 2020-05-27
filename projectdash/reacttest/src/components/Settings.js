import React from 'react';
import jwt_decode from 'jwt-decode'
//css
import './assets/css/custom.css';
import './assets/css/dashboard.css';

//navbar
import NavDark from './Nav_Dark';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- Student Dashboard Page ----------
// student settings page

class Settings extends React.Component {
  componentDidMount(){
      document.title = "Student Dashboard"
  }

    // set values in form
  constructor(props) {
    super(props);
    this.state = {
      emailaddress: '',
      foreign_uid: 0,
      password: '',
      firstname: '',
      lastname: '',
      linkedin: '',
      title: '',
      workcity: '',
      workstate: '',
      person_id: '',
      pronouns: '',

      cohort_id: 0,
      grad_status: 0,
      questee_id: 0,
      involved: '',
      major: '',
      major2: '',
      past_internships: '',
      quest_clubs: '',
      uid: 0,
      questee_id: '',

      token: '',

      errors: {}
    };

      // when fields in form are updated, update state
      this.onChange = this.onChange.bind(this);

      // handle submission of new user data
      this.onUpdate = this.onUpdate.bind(this);
  }

  // when fields in form are updated, update state
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value }) 
  }

  // pull user information from token
  componentDidMount() {
    const token = localStorage.usertoken
    this.setState({token: localStorage.usertoken})
    const decoded = jwt_decode(token)

    // set state
    this.setState({
      foreign_uid: decoded.identity.id,
      emailaddress: decoded.identity.account_email
    })


    // get person -> user_id = id
    const requestOptionsPerson = {
        method: 'GET',
       
        headers: { 'Content-Type': 'application/json' }
    };

    // get person information
    fetch(`https://api.questumd.com/api/persons?user_id=${decoded.identity.id}`).then(res => res.json()).then(data => {
      var json = data[0]
      this.setState({
        firstname: json.first_name, 
        lastname: json.last_name, 
        linkedin: json.linkedin, 
        pronouns: json.pronouns,
        workcity: json.work_city, 
        workstate: json.work_state,
        person_id: json.id,
        title: json.title})
      var person_id = json.id
   
    // get questee information
      fetch(`https://api.questumd.com/api/questees?person_id=${person_id}`).then(res => res.json()).then(data => {
        var json = data[0]
        this.setState({
          cohort_id: json.cohort_id,
          grad_status: json.grad_status,
          questee_id: json.id,
          involved: json.involved,
          major: json.major,
          major2: json.major2,
          past_internships: json.past_internships,
          quest_clubs: json.quest_clubs,
          uid: json.uid,
          questee_id: json.id,
        })
        console.log(data)

      
      }).catch(console.log);
    }).catch(console.log);
    
  }

  // called when user submits form to update information
  onUpdate(e) {
    e.preventDefault()

    // token authorization
    var bearer = 'Bearer ' + localStorage.getItem('usertoken');

    const requestOptionsPut = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
        'Authorization': bearer},
        body: JSON.stringify({
          first_name: this.state.firstname,
          last_name: this.state.lastname, 
          linkedin: this.state.linkedin, 
          work_city: this.state.workcity, 
          work_state: this.state.workstate,
          title: this.state.title
      })};
     
      // update fields
      fetch(`https://api.questumd.com/api/person/${this.state.person_id}`, requestOptionsPut).then(res => {
          if(res.ok){
              res.json().then(data => {
                  alert("Updated User Settings");
                  window.location.reload(false);
              }).catch(console.log);
          }else{
            alert("Error Updating User Settings");
          }
      })

      const requestOptionsPutQuestee = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': bearer},
        body: JSON.stringify({
          cohort_id: this.state.cohort_id,
          grad_status: this.state.grad_status,
          questee_id: this.state.id,
          involved: this.state.involved,
          major: this.state.major,
          major2: this.state.major2,
          past_internships: this.state.past_internships,
          quest_clubs: this.state.quest_clubs,
          uid: this.state.uid,
      })};
     
      // update fields of questee
      fetch(`https://api.questumd.com/api/questee/${this.state.questee_id}`, requestOptionsPutQuestee).then(res => {
          if(res.ok){
              res.json().then(data => {
                  alert("Updated User Settings");
                  window.location.reload(false);
              }).catch(console.log);
          }else{
            alert("Error Updating User Settings");
          }
      })
    };

  render() {
    return (
      <div className="Settings">
          <NavDark/>
            <div class="container-fluid">
              <div class="row">
                <nav class="col-md-2 d-none d-md-block bg-light">
                  <div class="sidebar-sticky">
                    <ul class="nav flex-column">
                      <li class="nav-item">
                        <Link to="/submitproject"><a class="nav-link">
                          <span data-feather="file"></span>
                          Submit a Project
                        </a></Link>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" href="#">
                          <span data-feather="users"></span>
                          Resume
                        </a>
                      </li>
                    </ul>
                    <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                      <span>Account Information</span>
                      <a class="d-flex align-items-center text-muted" href="#" aria-label="Add a new report">
                        <span data-feather="plus-circle"></span>
                      </a>
                    </h6>
                    <ul class="nav flex-column mb-2">

                      <li class="nav-item">
                        <a class="nav-link" href="#">
                          <span data-feather="file-text"></span>
                          Settings
                        </a>
                      </li>
                    </ul>
                  </div>
                </nav>

                <div class="col py-3">
               
                    <div class="form-row">
                      <h1 class="border-bottom">Settings</h1>
                    </div>

                    <div class="container row bg-light py-3" style={{color: "black"}}>
                      <div class="form-group col-md-6">
                        <p>Name: {this.state.firstname} {this.state.lastname}</p>
                        <p>Pronoun: {this.state.pronouns}</p>
                        <p>Email: {this.state.emailaddress}</p>
                        <p>Major: {this.state.major}</p>
                        <p>Second Major: {this.state.major2}</p>
                        <p>Grad Status: {this.state.grad_status}</p>
                        <p>Cohort: {this.state.cohort_id}</p>
                      </div>

                      <div class="form-group col-md-6">
                        <p>Title: {this.state.title}</p>
                        <p>Work City: {this.state.workcity}</p>
                        <p>Work State: {this.state.workstate}</p>
                        <p>Bio: {this.state.description}</p>
                        <p>Linkedin: {this.state.linkedin}</p>
                        <p>Past Internships: {this.state.past_internships}</p>
                        <p>QUEST clubs: {this.state.quest_clubs}</p>
                      </div>
                    </div>

                    <h2>Reset Fields Below</h2>
                    {/*Student Settings Info*/}
                    <form className="mt-3" class="needs-validation" onSubmit={this.onUpdate} >
                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="name">First name</label>
                          <input
                              type="text"
                              className="form-control"
                              name="firstname"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault02">Last name</label>
                          <input
                              type="text"
                              className="form-control"
                              name="lastname"
                              placeholder="Enter your last name"
                     
                              onChange={this.onChange}
                            />                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault02">Pronouns</label>
                          <input type="text"  onChange={this.onChange} className="form-control" id="validationDefault02" placeholder="e.g. She/Her, He/Him" />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefaultUsername">Email</label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text" id="inputGroupPrepend2">@</span>
                            </div>
                          <input
                              type="text"
                              className="form-control"
                              name="emailaddress"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                             </div>
                        </div>

                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefaultUsername">Password</label>
                          <div className="input-group">

                            <input type="password" onChange={this.onChange}  className="form-control" id="validationDefaultUsername" aria-describedby="inputGroupPrepend2" />
                          </div>
                        </div>

                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefaultUsername">Confirm Password</label>
                          <div className="input-group">

                            <input type="password" onChange={this.onChange} className="form-control" id="validationDefaultUsername" aria-describedby="inputGroupPrepend2" />
                          </div>
                        </div>

                      </div>

                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault03">City</label>
                          <input
                              type="text"
                              className="form-control"
                              name="workcity"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault04">State</label>
                          <input
                              type="text"
                              className="form-control"
                              name="workstate"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                           </div>

                      </div>
                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault03">LinkedIn URL</label>
                          <input
                              type="text"
                              className="form-control"
                              name="linkedin"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                           </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="exampleFormControlFile1">Upload Resume</label>
                          <input type="file" onChange={this.onChange} className="form-control-file" id="exampleFormControlFile1"/>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault04">Cohort</label>
                          <input
                              type="text"
                              className="form-control"
                              name="cohort_id"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                           </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault05">Cohort Year</label>
                          <input type="text" onChange={this.onChange} className="form-control" id="validationDefault05" placeholder="e.g. 2019, 2020, ..."/>
                        </div>
                        <div className="custom-control custom-checkbox col-md-3 mb-3">
                          <label htmlFor="customCheck1">Alumni?</label>
                            <select  onChange={this.onChange} className="custom-select" id="customCheck1">
                              <option defaultValue>Choose...</option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                        </div>

                      </div>
                      <div className="form-row">
                        <div className="col-md-4 mb-3">
                          <label htmlFor="validationDefault04">Major(s)</label>
                          <input
                              type="text"
                              className="form-control"
                              name="major"
                              placeholder="Enter your last name"
                     
                              onChange={this.onChange}
                            />                          </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="validationDefault03">Area of Expertise</label>
                          <textarea onChange={this.onChange} type="text" className="form-control" id="validationDefault03"/>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault04">Title</label>
                          <input
                              type="text"
                              className="form-control"
                              name="title"
                              placeholder="Enter your first name"
                     
                              onChange={this.onChange}
                            />                           </div>
                        <div className="col-md-4 mb-3">
                          <label htmlFor="validationDefault05">Bio</label>
                          <input
                              type="text"
                              className="form-control"
                              name="description"
                              placeholder="Enter your bio"
                     
                              onChange={this.onChange}
                            />                           
                        </div>
                      </div>

                      <button className="btn btn-primary" type="submit">Update</button>
                    </form>
                </div>
              </div>
            </div>
      </div>
      );
    }
}



export default Settings;

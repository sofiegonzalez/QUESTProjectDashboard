import React from 'react';
import jwt_decode from 'jwt-decode'
//css
//import './assets/css/custom.css';
//import './assets/css/dashboard.css';

//for routing pages
import {Link} from 'react-router-dom';
import AdminTopNavBar from './AdminNav';
import AdminSidebar from './AdminSideBar';
// ---------- Admin Dashboard Page ----------

class AdminSettings extends React.Component {
  componentDidMount() {
    document.title = "Admin Dashboard"
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
      admin_id: 0,

      token: '',

      office: '',
      officehours: '', 

      errors: {}
    };

    this.onUpdate = this.onUpdate.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value }) 

  }

    // want to pull from local storage
  componentDidMount() {
    const token = localStorage.usertoken
    this.setState({token: localStorage.usertoken})
    const decoded = jwt_decode(token)

    
    this.setState({
      foreign_uid: decoded.identity.id,
      emailaddress: decoded.identity.account_email
    })


    // get person -> user_id = id
    const requestOptionsPerson = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    // get person
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


   
      fetch(`https://api.questumd.com/api/admins?person_id=${person_id}`).then(res => res.json()).then(data => {
        var json = data[0]
        this.setState({
          office: json.office,
          officehours: json.office_hours,
          admin_id: json.id
        })
      
      }).catch(console.log);
    }).catch(console.log);
    
  }

  // update info
  onUpdate(e) {
   
    e.preventDefault()

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

    var bearer = 'Bearer ' + localStorage.getItem('usertoken');

      const requestOptionsPutQuestee = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
        'Authorization': bearer},
        body: JSON.stringify({
          office: this.state.office,
          office_hours: this.state.officehours,
          admin_id: this.state.id
      })};
     
      // update fields
      fetch(`https://api.questumd.com/api/admin/${this.state.admin_id}`, requestOptionsPutQuestee).then(res => {
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
    return (<React.Fragment>

      {/*TODO: NEW NAV NEEDS TO HAVE DIFFERENT OPTIONS ON THE NAV(E.G. MY ACCOUNT, LOGOUT)*/}
      <AdminTopNavBar/>
      <div className="container-fluid">
        <div className="row flex-xl-nowrap">
          {/* Sidebar */}
          <AdminSidebar/> {/* Page Content */}

          <div class="container-fluid">
              <div class="row">


                <div class="col py-3">
               
                    <div class="form-row">
                      <h1 class="border-bottom">Account Information</h1>
                    </div>

                    <div class="container row bg-light py-3" style={{color: "black"}}>
                      <div class="form-group col-md-6">
                        <p>Name: {this.state.firstname}</p>
                        <p>Pronoun: {this.state.pronouns}</p>
                        <p>Email: {this.state.emailaddress}</p>
                        <p>Office: {this.state.office}</p>
                        <p>Office Hours: {this.state.officehours}</p>
                      </div>

                      <div class="form-group col-md-6">
                        <p>Title: {this.state.title}</p>
                        <p>Work City: {this.state.workcity}</p>
                        <p>Work State: {this.state.workstate}</p>
                        <p>Bio: </p>
                        <p>Linkedin: {this.state.linkedin}</p>

                      </div>
                    </div>

                </div>
              </div>

                  {/*Admin Settings Info*/}
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
                          <label htmlFor="validationDefault03">Office</label>
                          <input
                              type="text"
                              className="form-control"
                              name="office"
                              placeholder="Enter your office"
                     
                              onChange={this.onChange}
                            />                        </div>
                        <div className="col-md-3 mb-3">
                          <label htmlFor="validationDefault04">Office Hours</label>
                          <input
                              type="text"
                              className="form-control"
                              name="officehours"
                              placeholder="Enter your office hours"
                     
                              onChange={this.onChange}
                            />                           
                          </div>

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
                            />                          
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
                          <textarea onChange={this.onChange} type="text"  className="form-control" id="validationDefault05"/>
                        </div>
                      </div>

                      <button className="btn btn-primary" type="submit">Update</button>
                    </form>
            </div>

        </div>
      </div>
    </React.Fragment>);
  }
}

export default AdminSettings;

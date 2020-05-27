import React from 'react';

//css
import './assets/css/custom.css';

//navbar
import Nav from './Nav';

//for routing pages - used below when something is clicked
import {Link} from 'react-router-dom'

// ---------- Create Account Page ----------

class CreateAccount extends React.Component {
  componentDidMount(){
      document.title = "Sign Up"
  }

  // set values in form
  constructor(props) {
    super(props);
    this.state = {
      emailaddress: '',
      password: '',
      firstname: '',
      lastname: '',
      errors: {}
    };

    // when user changes fields
    this.onChange = this.onChange.bind(this);

    // when accoutn submitted
    this.onSubmit = this.onSubmit.bind(this);

  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  // post request- create user and person object
  onSubmit(event) {
    event.preventDefault()

    const requestOptionsUser = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
       email: this.state.emailaddress, pwd: this.state.password
      })
    };

    //First creating a user
    fetch(`http://127.0.0.1:5000/api/users`, requestOptionsUser).then(res => 
      res.json()).then(postUser => {
      
      localStorage.setItem('usertoken', postUser)
      //Next get the created users ID
      fetch(`http://127.0.0.1:5000/api/users?email=${this.state.emailaddress}`).then(res => res.json()).then(gotUser => {
        console.log(gotUser)
        const requestOptionsPerson = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: 'firstName',
            last_name: 'lastName',
            pronoun: 'pronouns',
            contact_email: this.state.emailaddress,
            title: 'title',
            work_city: 'city',
            work_state: 'state',
            linkedin: 'linkedIn',
            user_id: gotUser[0].id
          })
        };
        //Next create a person
        fetch('http://127.0.0.1:5000/api/persons', requestOptionsPerson).then(res => res.json()).then(person => {
          console.log(person)
          const requestOptionsQuestee = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              major: 'majorOne',
              major2: 'majorTwo',
              grad_status: 0,
              uid: 0,
              involved: 0,
              area_of_expertise: 'areaOfExpertise',
              past_internships: 'pastInternships',
              quest_clubs: 'questClubs',
              //resume_id: 0, //TODO: GET RESUME ID 
              person_id: person[0].id,
              cohort_id: 1 //TODO: GET COHORT ID 
            })
          };
          //Finally create a Questee
          fetch(`http://127.0.0.1:5000/api/questees`, requestOptionsQuestee).then(res => res.json()).then(questee => {
            this.props.history.push(`/studentdashboard`)
          }).catch(console.log);
        }).catch(console.log);
      }).catch(console.log);
    }).catch(console.log);
  }


render() {
    return (

      <div className="CreateAccount">
      <Nav/>
     <div className="row">
      <div className="col-md-6 mt-5 mx-auto ">
        <h2 class="h2 mb-3 font-weight-normal text-center">Create an Account</h2>
          <form class="needs-validation" onSubmit={this.onSubmit} success={this.state.formSuccess} error={this.state.formError}>
              <div className="form-group">
                <label htmlFor="name">First name</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstname"
                  placeholder="Enter your first name"
                  value={this.state.firstname}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Last name</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastname"
                  placeholder="Enter your lastname name"
                  value={this.state.lastname}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="emailaddress"
                  placeholder="Enter email"
                  value={this.state.emailaddress}
                  onChange={this.onChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.onChange}
                />
              </div>

            <button className="btn btn-primary" type="submit">Create Account</button>
          </form>        
      </div>
      </div>
      </div>
    );
  }
}


export default CreateAccount;

import React from 'react'
import axios from 'axios'
import * as jwt_decode from 'jwt-decode'
//navbar
import Nav from './Nav';

//css
import './assets/css/custom.css';

//for routing pages - used below when something is clicked
import {Link} from 'react-router-dom'

// ---------- Main Sign In Page ----------
// users sign in here, page will redirect to correct dashboard
// based on the user type
// student -> student dashboard
// admin -> admin dashboard
// ta -> ta dashboard
// not a user -> error message

class SignIn extends React.Component {
  componentDidMount(){
    document.title = "Sign In"
  }

    constructor() {
    super()
    this.state = {
      emailaddress: '',
      password: '',
      errors: {}
    }

    // when fields in form are updated, update state
    this.onChange = this.onChange.bind(this)

    // when user attemps to login
    this.onSubmit = this.onSubmit.bind(this)
  }

  // when fields in form are updated, update state
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  // login
  onSubmit(e) {
    e.preventDefault()

    const requestOptionsPost = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email: this.state.emailaddress, pwd: this.state.password
        })
    };

    fetch('https://api.questumd.com/api/user/signin',requestOptionsPost).then(response => 
      {
        if (response.ok) {
          response.json().then(data =>{
            localStorage.setItem('usertoken', data)
            const decoded = jwt_decode(data)


            // get person info
            fetch(`https://api.questumd.com/api/persons?user_id=${decoded.identity.id}`).then(res => res.json()).then(data => {
              var json = data[0]
              var personid = json.id

              // get questee info
              fetch(`https://api.questumd.com/api/questees?person_id=${personid}`).then(res => res.json()).then(data_p => {
                // if not a questee -> admin dash
                if(data_p.length == []){
                  // not questee
                  this.props.history.push(`/projectmgmt`)
                }else{
                  // test if ta or student
                  var json = data_p[0]
                  var questeeid = json.id
            
                  // check if questee is a ta
                   fetch(`https://api.questumd.com/api/tas?questee_id=${questeeid}`).then(res => res.json()).then(data => {
                      // if not a questee -> ta dash
                      if(data.length == []){
                        // not a ta
                        this.props.history.push(`/studentdashboard`)
                      }else{
                        // not a student
                        this.props.history.push(`/ta/teammgmt`)
                      }
                    }).catch(console.log);
                  }

              }).catch(console.log);
            }).catch(console.log);

          })
        }else{
          // error message, login failed
          alert("Invalid Password or email, please try again");
        }})

      .catch(err => {
        console.log(err)
      })
  }

  render() {
    return (
      <div className="SignIn">
        <Nav/>
        <div class="container py-5 col-5">
        <form class="form-signi" onSubmit={this.onSubmit}>
          <Link to="/"><img class="mb-2 mx-auto d-block" src={require("./assets/images/quest_logo.png")} alt="Quest Logo" width="300" height="100"/></Link>
          <br></br>
          <h1 class="h3 mb-3 font-weight-normal text-center">Please Sign In</h1>
          
          <label htmlFor="email" class="sr-only">Email address</label>

          <input
            type="emailaddress"
            className="form-control"
            name="emailaddress"
            placeholder="Enter email"
            value={this.state.emailaddress}
            onChange={this.onChange}
          required/>

          <label htmlFor="password" class="sr-only">Password</label>
          <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.onChange}
          required/>        

          <br></br>
          <div class="checkbox mb-3">
            <label>
             <input name= "rememberme" type="checkbox" value="remember-me"/> Remember me
           </label>

          </div>


          <button
            type="submit"
            className="btn btn-lg btn-primary btn-block"
          >
          
          Sign in
          </button>


          <br></br> 


          <p class="mt-5 mb-3 text-muted"> QUEST 2020</p>
        </form>
      </div>
      </div>
      );
    }
}

export default SignIn;

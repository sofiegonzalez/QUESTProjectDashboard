import React from 'react';
import {useState, Fragment, options, FormGroup, Control} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import ReactDOM from 'react-dom';
import axios from 'axios'; 
//css
import './assets/css/custom.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
//navbar
import NavDark from './Nav_Dark';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- Project Submission Page ----------
// page for students to submit their projects

class Submit extends React.Component {
  componentDidMount(){
      document.title = "Submit A Project"
  }

  // set values in form
  constructor(props) {
    super(props);
    // state
    this.state = {
      render:'',
      projectname: '',
      company: '',
      description: '',
      cohort: '',
      industry: '',
      poster_path: '',
      project_status: '',
      faculty_advisor: '',
      project_status: 1,
      file: null,
      loaded: 0,
      url: '',
      message: 'Please wait...'};

    // when fields in form are updated, update state
    this.onChange = this.onChange.bind(this);

    // handle submission and file upload
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  // when fields in form are updated, update state
  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  // handle file upload - post request wit axios
  handleFileUpload = (event) => {
      this.setState({
        file: event.target.files[0],
        loaded: 0,
      })

      var bearer = 'Bearer ' + localStorage.getItem('usertoken');
      const config = {
          headers: { 'Authorization': bearer }
      };

      const data = new FormData() 
      data.append('file', event.target.files[0])

       axios.post("https://api.questumd.com/api/poster/", data, config)
        .then(res => { // then print response status
          this.setState({
            url: res.data.url
          })
      }).catch(console.log);
  }

  // post request- create user and person object, both will have same ID?
  handleSubmit(event) {
    // token authorization
    var bearer = 'Bearer ' + localStorage.getItem('usertoken');

    const requestOptionsProject = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'Authorization': bearer },
        body: JSON.stringify({
          name: this.state.projectname, 
          description: this.state.description, 
          faculty_advisor: this.state.faculty_advisor, 
          impact: this.state.impact,
          project_status: 0,
          poster_path: this.state.url,
        })
    };

    // post the project
    fetch('https://api.questumd.com/api/projects',requestOptionsProject).then(response => {
        if (response.ok) {
          response.json().then(data =>{
          alert("Project Submitted Successfully!");
            this.props.history.push(`/studentdashboard`)
          })
        }else{
          // error message
          alert("Invalid Password or email, please try again");
        }
    }).catch(console.log);

    event.preventDefault();
  }

  render() {
    // industry data
    var industrydata = [
      {label: 'Government Contracting'},
      {label: 'Manufacturing'},
      {label: 'Consulting'},
      {label: 'Food'},
      {label: 'Technology'},
      {label: 'Healthcare'},
      {label: 'Transportation'},
      {label: 'Construction'},
    ];

    return (
      <div className="Submit">
        <NavDark/>
        <div class="container">
          <div class="py-4 text-center">
            <h2>Submit A Project</h2>
          </div>

          <div class="container">
            <form class="needs-validation" onSubmit={this.handleSubmit} >
         
              <div class="mb-3">
                <label htmlFor="company">Project Name </label>
                <input type="text" onChange={this.onChange} class="form-control" name="projectname" placeholder="Project Name"></input>
                <div class="invalid-feedback">
                  Please enter a Project Name.
                </div>
              </div>

              <div class="mb-3">
                <label for="company">Company Name </label>
                <input type="text" onChange={this.onChange} class="form-control" name="company" placeholder="Company Name"></input>
                <div class="invalid-feedback">
                  Please enter a Company Name.
                </div>
              </div>

              <div class="mb-3">
                <label for="company">Faculty Advisor </label>
                <input type="text" onChange={this.onChange} class="form-control" name="faculty_advisor" placeholder="Faculty Advisor"></input>
                <div class="invalid-feedback">
                  Please enter a Faculty Advisor Name.
                </div>
              </div>

              <div class="mb-3">
                <label for="description">Description </label>
                <textarea type="text" onChange={this.onChange} class="form-control" name="description" placeholder="Description"></textarea>
                <div class="invalid-feedback">
                  Please enter a description.
                </div>
              </div>

              <div class="mb-3">
                <label for="description">Impact </label>
                <textarea type="text" onChange={this.onChange} class="form-control" name="impact" placeholder="Impact"></textarea>
                <div class="invalid-feedback">
                  Please enter impact.
                </div>
              </div>

              <label for="custom-file-input">Project File</label>
              <div class="mb-3 custom-file">
                <input type="file" class="custom-file-input" name="poster_path"  onChange={this.handleFileUpload} ></input>
                <label class="custom-file-label" for="poster_path">Choose file</label>
              </div>

              <div class="mb-3">
                <label for="company">Industry </label>

                <Typeahead
                  onChange={selected=> this.setState({industry: selected[0].label})}
                  {...this.state}
                  id="basic-example"
                  name="industry"
                  options={industrydata}
                  placeholder="Choose an industry..."
                />
              </div>

              <hr class="mb-4"></hr>
              <button class="btn btn-primary btn-lg btn-block" type="submit">Submit Project</button>
            </form>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
          
          </div>
        </div>
      </div>
      );
    }
}

export default Submit;

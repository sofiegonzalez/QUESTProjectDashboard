import React from 'react';

//css
import './assets/css/custom.css';

//navbar
import Nav from './Nav';

// ---------- Project Information Page ----------
// when a project from the homepage or any dashboard is clicked,
// this page is generated to display all information about the project

class Proj extends React.Component {
  constructor() {
    super()
    // state
    this.state = {
      errors: {},
      data: {},
      id: ''
    }
  }

  componentDidMount() {
      document.title = "Project Information"

      // grabs the project data from the previous page so it can be displayed
      var recieved = localStorage.getItem('project');

      this.setState({data : JSON.parse(recieved)});

      // grab questee ids and show

      // const requestOptionsQuestee = {
      //   method: 'GET',
      //   headers: { 'Content-Type': 'application/json' }
      // };

      // fetch('https://api.questumd.com/api/questees').then(res => res.json()).then(team => {
      //   // only display published projects
      //   this.setState({team: team.filter(proj => proj.id == this.state.data.team_id)});
      //   this.setState({
      //     teamname: this.state.team[0].name.toString(),
      //     semester: this.state.team[0].semester.toString()
      //   })
      // }).catch(console.log);

  }


  render() {
    // general html to be displayed 
    return (
      <div className="Proj">
        <Nav/>
        <div class="container bg-light">
          <br></br>

          <div class="container" style={{color: "black"}}>
            <div class="row no-gutters">
              <h1>{this.state.data.name}</h1>
            </div>

            <div class="row no-gutters py-3">
              <div class="col-md-4">
                <img className="bd-placeholder-img card-img-top " src={this.state.data.poster_path} width="100%" height="225"></img>
              </div>
              <div class="col-md-8">
                <div class="card-body">
                <ul class="list-inline">                   
                  <li class="list-inline-item"><h4><strong>Company:</strong> </h4></li>
                </ul>
                <ul class="list-inline">                   
                  <li class="list-inline-item"><h4><strong>Faculty Advisor: {this.state.data.faculty_advisor}</strong></h4></li>
                </ul>
                <ul class="list-inline">                   
                  <li class="list-inline-item"><h4><strong>Team Name: {this.state.data.team_name}</strong></h4></li>
                </ul>
              </div>
            </div>

            </div>

            <div class="row no-gutters py-3">
              <h1>Description</h1>
            </div>
            <div class="row no-gutters">
              <p>{this.state.data.description}</p>
            </div>

            <div class="row no-gutters py-3">
              <h1>Impact</h1>
            </div>
            <div class="row no-gutters">
              <p>{this.state.data.impact}</p>
            </div>

          </div>
        </div>
      </div>
      );
    }
}

export default Proj;

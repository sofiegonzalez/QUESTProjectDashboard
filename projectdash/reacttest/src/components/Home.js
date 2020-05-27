import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead'; // ES2015

//css
import './assets/css/custom.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
//navbar
import Nav from './Nav';

//for routing pages
import {Link} from 'react-router-dom'


// ---------- Home Page ----------
// this page is public to all, will display projects
// filteration functionalisty and links to sign in and about pages

class Home extends React.Component {
  componentDidMount(){
    document.title = "Project Dashboard"
  }

    // set values in form
  constructor() {
    super();
    // state
    this.state={
      proj: {},
      teams: {},
      projeacts: {},
      search: null
    };

    // filters the projects and team info from the db and organizes them
     this.filter = this.filter.bind(this);
  }

  // function specifies search criteria from drop downs
  searchSpace=(event)=>{
    // if undefined
    if(!event){
      this.setState({search:''})
    }else{
      // specify search criteria
      let searchval = event.target.value
      if(!isNaN(searchval)){
          if(searchval == 0){
            this.setState({search:''})
          }
          let keyword = searchval.toString();
          this.setState({search:keyword})
      }else{
          if(searchval == 0){
            this.setState({search:''})
          }
          let keyword = searchval.toString();
          this.setState({search:keyword})
      }
    }
  }

  // specify the search criteria needed for check boxes
  searchSpaceCheck=(event)=>{
    if(!event.target.checked){
        this.setState({ search: '' })
      }else{
        let keyword = event.target.value;
        this.setState({search:keyword})
      }
  }


  componentDidMount() {

    // fetch the get project information
    const requestOptionsProjects = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    fetch('https://api.questumd.com/api/projects').then(res => res.json()).then(data => {
      // only display published projects
      this.setState({proj: data.filter(proj => proj.project_status == 2)});

    }).catch(console.log);

    // fetch to get team information
    const requestOptionsTeams= {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    fetch('https://api.questumd.com/api/teams').then(res => res.json()).then(data => {
      // only display published projects
      this.setState({teams: data});
    }).catch(console.log);

  }

   // filters the projects and team info from the db and organizes them
  filter(){
     for(var x in this.state.proj){
      for(var y in this.state.teams){
        if(this.state.proj[x].team_id == this.state.teams[y].id){
          // set all fields
          this.state.proj[x]['semester'] = this.state.teams[y]['semester']
          this.state.proj[x]['course'] = this.state.teams[y]['course']
          this.state.proj[x]['team_name'] = this.state.teams[y]['name']
          this.state.proj[x]['questee_ids'] = this.state.teams[y]['questee_ids']
          this.state.proj[x]['ta_ids'] = this.state.teams[y]['ta_ids']
        }
      }
     }
  }

  render() {
    // call filter function
    this.filter()
    console.log(this.state.search)

    // filter through the current projects so the projects displayed match the search criteria
    const items = Object.values(this.state.proj).filter((data)=>{
      // no search criteria
      if(this.state.search == null){
          return data
      // search criteria
      }else if((data.name||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.impact||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.search_tags||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.status||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.faculty_advisor||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.semester ||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.course ||'').toLowerCase().includes(this.state.search.toLowerCase())
        || (data.team_name ||'').toLowerCase().includes(this.state.search.toLowerCase())        ){
          
          return data
      }
      // map data onto home page
      // the View button sends the specific project data to the project information page
      // to be displayed
    }).map(data=>{
      return(
        <div className="col-md-4">
          <div className="card mb-4 shadow-sm">
            <img className="bd-placeholder-img card-img-top" src={data.poster_path} width="100%" height="225"/>
            <title>project3</title>
            <div className="card-body">
              <p className="card-text" style={{
                  color: 'black'
                }}><strong>Project Name: </strong>{data.name}</p>
              <p className="card-text" style={{
                  color: 'black'
                }}><strong>Description: </strong> {data.description}</p>
              <div className="d-flex justify-content-between align-items-center">
                <div className="btn-group">
                   <button type="button" className="btn btn-sm btn-outline-secondary" onClick={(e)=>{localStorage.setItem('project', JSON.stringify(data)); this.props.history.push(`/proj`)}}>View</button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    })

  return (
    <div className="Home">
    <Nav/>
      <main role="main">
        <div className="album py-4 bg-light">
          <div className="container py-3">
            <h2 className="py-1" style={{
                color: 'black'
              }}>QUEST Projects</h2>
            <form className="form-inline d-flex justify-content-center md-form form-sm mt-0 py-2" >

              <input className="form-control form-control-sm ml-3 w-100" id="searchbox" type="text" placeholder="Search" onChange={(e)=>this.searchSpace(e)} aria-label="Search"/>

              <ul className="list-inline text-center py-2" style={{color : "black"}}>
                <li className="list-inline-item" style={{padding: "15px"}}>

                <div class="dropdown list-inline-item">
                  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">Cohort
                    <span class="caret"></span></button>
                    <ul className="dropdown-menu py-2" aria-labelledby="dropdownMenuButton" onClick={(e)=>this.searchSpace(e)}>
                      <option value={''} className="dropdown-item" style={{color: 'black'}}>Clear Filter</option>
                      <option value="30" className="dropdown-item" style={{color: 'black'}}>30</option>
                      <option value="29" className="dropdown-item" style={{color: 'black'}}>29</option>
                      <option value="28" className="dropdown-item" style={{color: 'black'}}>28</option>
                    </ul>
                </div>

                <div class="dropdown list-inline-item">
                  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">Year
                    <span class="caret"></span></button>
                    <ul className="dropdown-menu py-2" aria-labelledby="dropdownMenuButton" onClick={(e)=>this.searchSpace(e)}>
                      <option value={''}  className="dropdown-item" style={{color: 'black'}}>Clear Filter</option>
                      <option value={'Spring 2020'} className="dropdown-item" style={{color: 'black'}}>Spring 2020</option>
                      <option value={'Fall 2019'} className="dropdown-item" style={{color: 'black'}}>Fall 2019</option>
                      <option value={'Spring 2019'} className="dropdown-item" style={{color: 'black'}}>Spring 2019</option>
                    </ul>
                </div>

                <div class="dropdown list-inline-item">
                  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">Industry
                    <span class="caret"></span></button>
                    <ul className="dropdown-menu py-2" aria-labelledby="dropdownMenuButton" onChange={(e)=>this.searchSpaceCheck(e)}>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={'Government Contracting'} class="form-check-input" id="govcontract"></input>Government Contracting</li>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={'Manufacturing'}  class="form-check-input" id="manufacturing"></input>Manufacturing</li>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={'Consulting'}  class="form-check-input" id="sonsulting"></input>Consulting</li>
                    </ul>
                </div>

                <div class="dropdown list-inline-item">
                  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown">Company
                   </button>
                    <ul className="dropdown-menu py-2" aria-labelledby="dropdownMenuButton" onClick={(e)=>this.searchSpaceCheck(e)}>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={''} class="form-check-input" id="govcontract"></input>Example One</li>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={''}  class="form-check-input" id="manufacturing"></input>Example Two</li>
                      <li className="dropdown-item" style={{color: 'black'}}><input type="checkbox" value={''}  class="form-check-input" id="sonsulting"></input>Example Three</li>
                    </ul>
                </div>

                <li className="list-inline-item" style={{padding: "15px"}}>
                  Best Capstone
                </li>
                <li className="list-inline-item" style={{padding: "15px"}}>
                  Best Poster
                </li>
                </li>
              </ul>
            </form>
          </div>

          <div className="container">
            <div className="row">
            {items}
            </div>
          </div>
        </div>
      </main>
    </div>       
    );
    }
}
export default Home;

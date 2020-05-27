import React from 'react';

//css
import './assets/css/custom.css';

//navbar
import Nav from './Nav';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- Contact QUEST Page ----------

class AboutQuest extends React.Component {
  componentDidMount(){
    document.title = "About"
  }

  render() {
    return (
      <div className="About">
        <Nav/>
        <main role="main">
            <div class="album py-4 bg-light">
                <div class=" container jumbotron" style={{color: "black"}}>
                    <h1 class="display-4">Contact Us</h1>
                    <hr class="my-4"></hr>
                    <p class = "lead">The QUEST (Quality Enhancement Systems and Teams) Honors Program is a three-year program for University of Maryland undergraduates studying business, engineering, and/or science. QUEST's five-course curriculum focuses on experiential learning through multidisciplinary, team-based, and hands-on projects. In the program’s capstone course, companies engage teams of QUEST students with real organizational challenges and dedicate resources to help students address these problems. Student teams must enhance their skills in quality management, process improvement, and systems design and will apply these to add value to a client. The purpose of this page is to highlight the quantifiable impact students have made through their recommendations.</p> 
                    <p class="lead">More Info Can be found at <a href="https://www.rhsmith.umd.edu/programs/undergraduate-programs/academics/fellows-special-programs/quest">quest.umd.edu</a></p>
                    <p class="lead">Ready to be a Corporate Sponsor? <a href="mailto:jroffe@rhsmith.umd.edu?Subject=Corporate%20Sponsor" target="_top">Email Us</a> at jroffe@rhsmith.umd.edu</p>
                </div>
            </div>
        </main>
      </div>
      );
    }
}

export default AboutQuest;

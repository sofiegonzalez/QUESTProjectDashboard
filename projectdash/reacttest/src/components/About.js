import React from 'react';

//css
import './assets/css/custom.css';

//navbar
import Nav from './Nav';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- About 490/QUEST Page ----------
// this page is a simple about page

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
                    <h1 class="display-4">About 490H Sponsorship</h1>
                    <p class="lead">QUEST welcomes the opportunity to partner with organizations interested in contributing to student learning and gaining access to talented undergraduate students in business, engineering, and science. Our corporate partners provide experiential learning opportunities for QUEST students through project sponsorship in both our capstone course and our data analysis course. Corporate partners are also invited to our annual networking event and receive QUEST resume books every semester.</p>
                    <hr class="my-4"></hr>
                                        <p class="lead">More Info at <a href="https://www.rhsmith.umd.edu/programs/undergraduate-programs/academics/fellows-special-programs/quest">quest.umd.edu</a></p>
                    <p class="lead">Ready to be a Corporate Sponsor?<Link to="/contact"> Contact Us!</Link></p>
                </div>
            </div>
        </main>
      </div>
      );
    }
}

export default AboutQuest;

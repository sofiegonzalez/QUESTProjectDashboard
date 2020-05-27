import React from 'react';

//css
import './assets/css/custom.css';

//navbar
import Nav from './Nav';

//for routing pages
import {Link} from 'react-router-dom'

// ---------- About QUBIT Page ----------
// simple about the quibit team page

class AboutQuest extends React.Component {
  componentDidMount(){
      document.title = "About Qubit"
  }

  render() {
    return (
      <div className="About">
        <Nav/>
        <main role="main">
            <div class="album py-4 bg-light">
                <div class="container">
                  <h1 style={{ color: 'black', padding: "10px"}}>Team Qubit</h1>
                  <p style={{ color: 'black', padding: "10px"}} > The QUBIT team is a group of 7 computer science seniors at the University of Maryland in Dr. Purtilo’s CMSC435: Software Engineering course. Over the course of the Spring 2020 semester, they were tasked with improving the data management process and designing a platform to better highlight student work for QUEST which resulted in this platform being built. Meet the members of the team below! </p>
                  <div class="row">
                    <div class="col-4">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Sam.jpg")} width="100px" height="225"/>
                      </div>
                    </div>
                    <div class="col">
                      <h3 style={{ color: 'black' }}>Samuel Baer</h3>
                      <p class="text-justify" style={{ color: 'black' }}>Samuel is a senior from Annapolis, Maryland pursuing a degree in Computer Science. He is involved with UMD flying terps, UMDs’ premier drone club. In his free time he loves to cook, kayak, and hike.</p>
                    </div>
                  </div>

                  <div class="row">

                    <div class="col">
                      <h3 style={{ color: 'black' }}>Jacqueline Deprey </h3>
                      <p class="text-justify" style={{ color: 'black' }}>Jacqueline is a senior from Rockville, Maryland pursuing a dual-degree in Computer Science, Operations Management and Business Analytics. This Gemstone and QUEST Honors Program mentor hosts Maryland Survivor, leads professional events for Alpha Omega Epsilon, tutors through the Iribe Initiative for Inclusion and Diversity, and gives tours with Maryland Images. </p>
                    </div>
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Jacq.jpg")} width="100%" height="225"/>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Sofie.PNG")} width="100%" height="225"/>
                      </div>
                    </div>
                    <div class="col">
                      <h3 style={{ color: 'black' }}>Sofia Gonzalez</h3>
                      <p class="text-justify" style={{ color: 'black' }}>Sofia is a senior at the University of Maryland majoring in Computer Science. She grew up in Boston but moved to Annapolis Maryland before high school. Most of her professional experience has been through  jobs ranging from tutoring elementary students in computer science concepts to interning at Children’s National Hospital as Research Assistant. She loved cooking, hiking with friends and making music with her high school band.</p>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col">
                      <h3 style={{ color: 'black' }}>Mark Kapuscinski</h3>
                      <p class="text-justify" style={{ color: 'black' }}>Samuel is a senior from Annapolis, Maryland pursuing a degree in Computer Science. He is involved with UMD flying terps, UMDs’ premier drone club. In his free time he loves to cook, kayak, and hike.</p>
                    </div>
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Mark.PNG")} width="100%" height="225"/>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Will.PNG")} width="100%" height="225"/>
                      </div>
                    </div>
                    <div class="col">
                      <h3 style={{ color: 'black' }}>William Pierson</h3>
                      <p class="text-justify" style={{ color: 'black' }}>William is a senior from Kent Island, Maryland majoring in Computer Science. His hobbies include soccer, video games, and cooking.</p>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col">
                      <h3 style={{ color: 'black' }}>Luke Vacek</h3>
                      <p class="text-justify" style={{ color: 'black' }}>Samuel is a senior from Annapolis, Maryland pursuing a degree in Computer Science. He is involved with UMD flying terps, UMDs’ premier drone club. In his free time he loves to cook, kayak, and hike.</p>
                    </div>
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Luke.PNG")} width="100%" height="225"/>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-3">
                      <div className="card mb-4 shadow-sm">
                        <img className="bd-placeholder-img card-img-top" src={require("./assets/images/Ronaldo.PNG")} width="100%" height="225"/>
                      </div>
                    </div>
                    <div class="col">
                      <h3 style={{ color: 'black' }}>Ronaldo Zavala</h3>
                      <p class="text-justify" style={{ color: 'black' }}>Ronaldo is a senior from Morningside, Maryland pursuing a degree in Computer Science. Some of his areas of interest include Computer Vision, Handheld Programming, and Web Development.</p>
                    </div>
                  </div>

                </div>
            </div>
        </main>
      </div>
      );
    }
}

export default AboutQuest;

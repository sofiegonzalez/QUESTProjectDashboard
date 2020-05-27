import React from 'react';
import { Link } from 'react-router-dom'

const QUESTEE = 0;
const TA = 1;
const ADMIN = 2;
//---------- User cards populated on admin dashboards' UserMgmt page ----------
const UserCards = ({
  userData,
  //Questees are made up of an array [array of[{personData}, {questeeData}]]
  //Admins are made up of an array [array of[{personData}, {adminData}]]
  //TAs are made up of an array [array of[{personData}, {questeeData}, {taData}]]
  userDataType,
}) => {
  switch (userDataType) {
    //Questee user card
    case QUESTEE:
      return (
        <a className=" card list-group-item mb-2">
          <div className="d-flex flex-row">
            <div className="col-md-3">
              <i style={{
                color: 'black',
                paddingLeft: '30px',
                paddingBottom: '10px'
              }} className="far fa-user fa-4x"></i>
              {/* User Name */}
              <h4 style={{ color: 'black' }}>
                {userData[0].first_name} {userData[0].last_name}
              </h4>
              {/* button below is for editing/viewing more info*/}
              <Link to={{ pathname: '/usermgmt/userinfo/', userData: userData, userType: QUESTEE }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
            </div>

            <div className="col-md-4">
              {/* User Emailt */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">Email:</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8">{userData[0].contact_email}</p>
              </div>
              {/* User Pronouns */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">UID</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8">{userData[1].uid}</p>
              </div>
              {/* User Title */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">Major(s):</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8"> {(userData[1].major2 ? userData[1].major + ", " + userData[1].major2 : userData[1].major)}</p>
              </div>
            </div>

            <div className="col-md-5 ">
              {/* User Location */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">Pronoun(s):</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8">{userData[0].pronoun}</p>
              </div>
              {/* User Linkedin */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">Grad Status:</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8">{userData[1].grad_status == 1 ? "Alumni": "Student"}</p>
              </div>
              {/* User description */}
              <div className="row">
                <label style={{
                  color: 'black'
                }} className="h6">LinkedIn:</label>
              </div>
              <div className="row">
                <p style={{
                  color: 'black'
                }} className="h8">{userData[0].linkedin}</p>
              </div>
            </div>
          </div>
        </a>)
      case TA:
        return (
          <a className=" card list-group-item mb-2 bg-secondary">
            <div className="d-flex flex-row">
              <div className="col-md-3">
                <i style={{
                  paddingLeft: '30px',
                  paddingBottom: '10px'
                }} className="far fa-user fa-4x"></i>
                {/* User Name */}
                <h4>
                  {userData[0].first_name} {userData[0].last_name}
                </h4>
                {/* button below is for editing/viewing more info*/}
                <Link to={{ pathname: '/usermgmt/userinfo/', userData: userData, userType: TA }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
              </div>
  
              <div className="col-md-4">
                {/* User Emailt */}
                <div className="row">
                  <label  className="h6">Email:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].contact_email}</p>
                </div>
                {/* User Pronouns */}
                <div className="row">
                  <label className="h6">UID:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[1].uid}</p>
                </div>
                {/* User Title */}
                <div className="row">
                  <label className="h6">Major(s):</label>
                </div>
                <div className="row">
              <p className="h8"> {(userData[1].major2 ? userData[1].major + ", " + userData[1].major2 : userData[1].major)}</p>
                </div>
              </div>
  
              <div className="col-md-5 ">
                {/* User Location */}
                <div className="row">
                  <label  className="h6">Pronoun(s):</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].pronoun}</p>
                </div>
                {/* User Linkedin */}
                <div className="row">
                  <label className="h6">Course/Semester TA'd:</label>
                </div>
                <div className="row">
                <p className="h8">{userData[2].semester && userData[2].course ? userData[2].semester + " - " + userData[2].course : (userData[2].course ?userData[2].course: userData[2].semester ) }</p>
                </div>
                {/* User description */}
                <div className="row">
                  <label className="h6">Office Hours:</label>
                </div>
                <div className="row">
                  <p  className="h8">{userData[2].office_hours}</p>
                </div>
              </div>
            </div>
          </a>)   
      case ADMIN:
        return (
          <a className=" card list-group-item mb-2 bg-dark">
            <div className="d-flex flex-row">
              <div className="col-md-3">
                <i style={{
                  paddingLeft: '30px',
                  paddingBottom: '10px'
                }} className="far fa-user fa-4x"></i>
                {/* User Name */}
                <h4 >
                  {userData[0].first_name} {userData[0].last_name}
                </h4>
                {/* button below is for editing/viewing more info*/}
                <Link to={{ pathname: '/usermgmt/userinfo/', userData: userData, userType: ADMIN }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
              </div>
  
              <div className="col-md-4">
                {/* User Emailt */}
                <div className="row">
                  <label className="h6">Email:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].contact_email}</p>
                </div>
                {/* User Pronouns */}
                <div className="row">
                  <label className="h6">Office:</label>
                </div>
                <div className="row">
                  <p  className="h8">{userData[1].office}</p>
                </div>
                {/* User Title */}
                <div className="row">
                  <label className="h6">Title:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].title}</p>
                </div>
              </div>
  
              <div className="col-md-5 ">
                
                <div className="row">
                  <label className="h6">Pronoun(s):</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].pronoun}</p>
                </div>
                <div className="row">
                  <label className="h6">Office Hours:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[1].office_hours}</p>
                </div>
                {/* User Linkedin */}
                <div className="row">
                  <label className="h6">LinkedIn:</label>
                </div>
                <div className="row">
                  <p className="h8">{userData[0].linkedin}</p>
                </div>
                
              </div>
            </div>
          </a>)
         
    default:
      return (null)
  }
}

export default UserCards

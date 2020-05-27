import React from 'react';
 
//css
import './assets/css/custom.css';

//linking to other pages
import { NavLink } from 'react-router-dom';

// ---------- Navbar Code ----------
// used on dashboard pages to signify the user is logged in
 
const Navigation = () => {
    return (
       <div className="NavDark">
       <header>
	       	<div class="navbar navbar-expand-lg navbar-dark bg-dark">
				<div class="container d-flex justify-content-between">
					<NavLink to="/studentdashboard"><img src={require("./assets/images/quest_logo.png")} height="50px" ></img></NavLink>
					<div class="navbar" id="navbarText">
					    <ul class="navbar-nav mr-auto">
					      <li class="nav-item active">
					        <a class="nav-link" ><NavLink to="/settings">Settings</NavLink><span class="sr-only">(current)</span></a>
					      </li>
					      <li class="nav-item">
					        <a class="nav-link"><NavLink to="/signin">Sign Out</NavLink></a>
					      </li>
					    </ul>
		  			</div>
				</div>
			</div>
		</header>       
       </div>
    );
}
 
export default Navigation;
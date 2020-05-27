import React from 'react';

//css
import './assets/css/custom.css';

//linking to other pages
import { NavLink } from 'react-router-dom';

// ----------  Navbar Code ----------

const Navigation = () => {
    return (
       <div className="Nav">
       <header>
	       	<div class="navbar navbar-expand-lg navbar-light bg-light">
				<div class="container d-flex justify-content-between">
					<NavLink to="/"><img src={require("./assets/images/quest_logo.png")} height="50px" ></img></NavLink>
					<div class="navbar" id="navbarText">
					    <ul class="navbar-nav mr-auto">
					      <li class="nav-item active">
					        <a class="nav-link" ><NavLink to="/aboutquest">About Us</NavLink><span class="sr-only">(current)</span></a>
					      </li>
					      <li class="nav-item">
					        <a class="nav-link"><NavLink to="/signin">Sign In</NavLink></a>
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

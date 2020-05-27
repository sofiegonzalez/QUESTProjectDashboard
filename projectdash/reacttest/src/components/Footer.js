import React from 'react';

//css
import './assets/css/custom.css';

//routing
import { Link } from 'react-router-dom';


// ---------- Universal Footer Code ----------

const Footer = () => {
    return (
       <div className="Footer">
	    <footer className="page-footer font-small">
	        <ul className="list-inline text-center py-2">
	            <li className="list-inline-item " ><Link to="/aboutquest">About Us</Link></li>
	            <li className="list-inline-item "> - </li>
	            <li className="list-inline-item"><Link to="/signin">Login</Link></li>
	            <li className="list-inline-item "> - </li>
	            <li className="list-inline-item"><Link to="/contact">Contact</Link></li>
	            <li className="list-inline-item "> - </li>
	            <li className="list-inline-item"><Link to="/aboutqubit">qubit</Link></li>
	        </ul>
	    </footer>
       </div>
    );
}

export default Footer;

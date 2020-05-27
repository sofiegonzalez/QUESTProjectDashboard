//This document is used to render out project cards on the project mgmt, and view all projects page
//TODO: MAYBE MAKE ALL CARDS THE SAME SIZE?
import React from 'react';
import { Link } from 'react-router-dom'
import { useEffect } from 'react';

//const apiLink = "http://127.0.0.1:5000/api";
const apiLink = "https://api.questumd.com/api";

//Project status'
const INPROGRESS = 0;
const INQUEUE = 1;
const PUBLISHED = 2;
const ALL = -1;

const ProjectCards = ({
    projectData,
    projectType,
    props,
    approveFun,
    from
}) => {

    //Helper function used to render out the right amount of text on a card so theres no overflow
    const outputEnoughChars = (text, numAllowed) => {
        return (text.length > numAllowed ? text.substring(0, numAllowed) + "..." : text);
    }

    switch (projectType == ALL ? projectData.project_status : projectType) {
        //In Queue project cards rendered here
        case INQUEUE:
            if (projectData.project_status === INQUEUE) {//add || projectType == ALL){ to filter all
                return (
                    <div className="card text-white bg-dark" key={projectData.id} style={{ minHeight: '300px', maxHeight: '500px', maxWidth: '400px', minWidth: '300px', marginRight: '5px' }}>
                        <div className="card-header text-white bg-dark">
                            <h4 className="card-title text-white bg-dark" style={{ minHeight: '100px', maxHeight: '200px' }}>
                                {projectData.name ? outputEnoughChars(projectData.name, 65) : ""}
                            </h4>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title text-white bg-dark">Description</h4>
                            <p className="card-text text-white bg-dark" style={{ height: '109px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                                {projectData.description ? outputEnoughChars(projectData.description, 157) : ""}
                            </p>
                            <h4 className="card-title text-white bg-dark">Impact</h4>
                            <p className="card-text text-white bg-dark" style={{ height: '50px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                            {projectData.impact ? outputEnoughChars(projectData.impact, 53) : ""}
                            </p>
                        </div>
                        <div className="card-footer">
                            <Link to={{ pathname: '/projectmgmt/projectinfo/', data: projectData, from: from }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
                            <button type="button" className="btn btn-warning float-right" key={projectData.id} onClick={approveFun}>Approve</button>
                        </div>
                    </div>
                );
            } else { return (null) }
        //In progress project cards rendered here
        case INPROGRESS:
            if (projectData.project_status === INPROGRESS) {
                return (
                    <div className="card text-white bg-secondary" key={projectData.id} style={{ minHeight: '300px', maxHeight: '500px', maxWidth: '400px', minWidth: '300px', marginRight: '5px' }}>
                        <div className="card-header text-white bg-secondary">
                            <h4 className="card-title text-white bg-secondary" style={{ minHeight: '100px', maxHeight: '200px' }}>
                                {projectData.name ? outputEnoughChars(projectData.name, 65) : ""}
                            </h4>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title text-white bg-secondary">Description</h4>
                            <p className="card-text text-white bg-secondary" style={{ height: '109px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                                {projectData.description ? outputEnoughChars(projectData.description, 157) : ""}
                            </p>
                            <h4 className="card-title text-white bg-secondary">Impact</h4>
                            <p className="card-text text-white bg-secondary" style={{ height: '50px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                                {projectData.impact ? outputEnoughChars(projectData.impact, 53) : ""}
                            </p>
                        </div>
                        <div className="card-footer">
                            <Link to={{ pathname: '/projectmgmt/projectinfo/', data: projectData, from: from }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
                        </div>
                    </div>
                );
            } else { return (null) }
        //Published project cards rendered here
        case PUBLISHED:
            if (projectData.project_status === PUBLISHED) {
                return (
                    
                     <div className="card text-dark bg-white" key={projectData.id} style={{ minHeight: '300px', maxHeight: '500px', maxWidth: '400px', minWidth: '300px', marginRight: '5px' }}>
                        <div className="card-header text-dark bg-white">
                            <h4 className="card-title text-dark bg-white" style={{ minHeight: '100px', maxHeight: '200px' }} >
                                {projectData.name ? outputEnoughChars(projectData.name, 65) : ""}
                            </h4>
                        </div>
                        <div className="card-body">
                            <h4 className="card-title text-dark bg-white">Description</h4>
                            <p className="card-text text-dark bg-white" style={{ height: '109px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                                {projectData.description ? outputEnoughChars(projectData.description, 157) : ""}
                            </p>
                            <h4 className="card-title text-dark bg-white">Impact</h4>
                            <p className="card-text text-dark bg-white" style={{ height: '50px', whiteSpace: 'wrap', overflow: 'hidden' }}>
                                {projectData.impact ? outputEnoughChars(projectData.impact, 53) : ""}
                            </p>
                        </div>
                        <div className="card-footer">
                            <Link to={{ pathname: '/projectmgmt/projectinfo/', data: projectData, from: from }}><button type="button" className="btn btn-success float-left">View/Edit</button></Link>
                        </div>
                    </div>
                )
            } else { return (null) }
        default:
            return (
                <div>Error: Project Type not specified</div>);
    }

}

export default ProjectCards

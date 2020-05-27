
create database qubit_truth;
use qubit_truth;

create table users (
	id int not null auto_increment,
    account_email varchar(255) not null,
    account_password varchar(255) not null,
    salt varchar(255) not null,
    primary key (id)
);

create table permissions (
	id int not null auto_increment,
    name varchar(255),
    description varchar(255),
    primary key (id)
);

create table persons (
	id int not null auto_increment,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    contact_email varchar(255),
    pronoun varchar(255),
    title varchar(255),
    work_city varchar(255),
    work_state varchar(255),
    linkedin varchar(255),
    user_id int not null,
    foreign key (user_id) references users(id),
    primary key (id)
);

create table admins (
	id int not null auto_increment,
    office varchar(255),
    office_hours varchar(255),
    person_id int not null,
    foreign key (person_id) references persons(id),
    primary key (id)
);

create table corporations (
	id int not null auto_increment,
    name varchar(255),
    website varchar(255),
    description varchar(255),
    primary key (id)
);

create table clients (
	id int not null auto_increment,
    person_id int not null,
    corporation_id int not null,
    foreign key (corporation_id) references corporations(id),
    foreign key (person_id) references persons(id),
    primary key (id)
);

create table teams (
	id int not null auto_increment,
    name varchar(255) not null,
    semester varchar(255) not null,
    course varchar(255) not null,
    primary key (id)
);

create table projects (
	id int not null auto_increment,
    name varchar(255),
    description varchar(1500),
    poster_path varchar(255),
    project_status int,
    impact varchar(1500),
    faculty_advisor varchar(255),
    team_id int,
    client_id int,
    foreign key (team_id) references teams(id),
    foreign key (client_id) references clients(id),
    primary key (id)
);

create table cohorts (
	id int not null auto_increment,
    number int not null,
    year int not null,
    primary key (id)
);

create table resumes (
	id int not null auto_increment,
    resume_path varchar(255),
    date_updated varchar(255),
    status bit not null,
    primary key (id)
);

create table questees (
	id int not null auto_increment,
    major varchar(255) not null,
    major2 varchar(255),
    grad_status int not null,
    uid int,
    involved int,
    areas_of_expertise varchar(255),
    past_internships varchar(255),
    quest_clubs varchar(255),
    resume_id int,
    person_id int not null,
    cohort_id int not null,
    foreign key (cohort_id) references cohorts(id),
    foreign key (resume_id) references resumes(id),
    foreign key (person_id) references persons(id),
    primary key (id)
);

create table tas (
    id int not null auto_increment,
    course varchar(255),
    semester varchar(255),
    office_hours varchar(255),
    office varchar(255),
    questee_id int not null,
    foreign key (questee_id) references questees(id),
    primary key (id)
);

create table industries (
	id int not null auto_increment,
    name varchar(255),
    primary key (id)
);

create table industries_projects_rel (
	industry_id int not null,
    project_id int not null,
    foreign key (industry_id) references industries(id) on delete cascade,
    foreign key (project_id) references projects(id) on delete cascade
);

create table questees_teams_rel (
    questee_id int not null,
    team_id int not null,
    foreign key (questee_id) references questees(id) on delete cascade,
    foreign key (team_id) references teams(id) on delete cascade
);

create table users_permissions_rel (
    user_id int not null,
    permission_id int not null,
    foreign key (user_id) references users(id) on delete cascade,
    foreign key (permission_id) references permissions(id) on delete cascade
);

create table tas_teams_rel (
    ta_id int not null,
    team_id int not null,
    foreign key (ta_id) references tas(id) on delete cascade,
    foreign key (team_id) references teams(id) on delete cascade
)
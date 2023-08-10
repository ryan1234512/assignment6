/*********************************************************************************
* WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: Ryan Paul Domingo        Student ID: 151918216         Date: 2023-08-09
*
* Online (Cyclic) Link: 
*
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var app = express();
var path = require('path');
var collegeData = require('./modules/collegeData.js');
const { error } = require('console');
const exphbs = require('express-handlebars');
const { col } = require('sequelize');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', 
    helpers: {
        navLink: function(url, options){ 
            return '<li' +  
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +  
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'; 
        },
        equal: function (lvalue, rvalue, options) { 
            if (arguments.length < 3) 
                throw new Error("Handlebars Helper equal needs 2 parameters"); 
            if (lvalue != rvalue) { 
                return options.inverse(this); 
            } else { 
                return options.fn(this); 
            } 
        } 
    }
    }));
app.set('view engine', '.hbs');

app.use(function(req,res,next){ 
    let route = req.path.substring(1); 
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));     
    next(); 
});


// route to show all the students
app.get("/students", (req, res) => {
    course = req.query.course;
    if(course) {
        collegeData.getStudentsByCourse(course)
        .then( studentsByCourse => res.json(studentsByCourse))
        .catch(error => res.json({message: "no results"}))
    } else {
    collegeData.getAllStudents()
    .then((students) => {
        if(students.length > 0){
            res.render('students', {students: students});
        } else {
            res.render('students', {message: "no results"});
        }
    })
    .catch(error => res.render('students', {message: "no results"}));
    }
});

// route to show all the courses
app.get("/courses", (req, res) => {
    collegeData.getCourses()
    .then((courses) => {
        if (courses.length > 0){
            res.render('courses', {courses: courses});
        } else {
            res.render('courses',{message : "no results"});
        }
    })
    .catch(error => res.render('courses',{message : "no results"}));
});

// route to show the student by number
// app.get("/student/:num", (req, res) => {
//     const num = req.params.num;
//     collegeData.getStudentByNum(num)
//     .then(studentByNum => res.render('student', {student: studentByNum}))
//     .catch(error => res.render('student', {message : error}));
// });

app.get("/student/:studentNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data; //store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // set student to null if none were returned
            }
        }).catch(() => {
            viewData.student = null; // set student to null if there was an error
        }).then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"
            // loop through viewData.courses and once we have found the courseId that matches
            // the student's "course" value, add a "selected" property to the matching
            // viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId == viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.courses = []; // set courses to empty if there was an error
        }).then(() => {
            if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
            } else {
            res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
});
   

app.get("/course/:id", (req, res) => {
    const id = req.params.id;
    collegeData.getCourseById(id)
    .then(courseById => {
        if(!courseById) {
            res.status(404).send("Course Not Found");
        } else {
            res.render('course', {course: courseById});
        }
    })
    .catch( error => res.render('course', {message : error}))
});

app.get("/course/delete/:id", (req, res) => {
    const id = req.params.id;
    collegeData.deleteCourseById(id)
      .then(() => {
        res.redirect('/courses');
      })
      .catch(error => {
        res.status(500).send("Unable to Remove Course / Course not found"); 
      });
});

app.get("/student/delete/:studentNum", (req, res) => {
    const num = req.params.studentNum;
    collegeData.deleteStudentByNum(num)
        .then(() => res.redirect('/students'))
        .catch(error => res.status(500).send("Unable to Remove Student / Student not found"))
});

app.post("/student/update", (req, res) => { 
    collegeData.updateStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => res.status(500).send({ message: "no results" }));
});

app.post("/course/update", (req, res) => { 
    collegeData.updateCourse(req.body)
    .then(() => res.redirect("/courses"))
    .catch((err) => res.status(500).send({ message: "no results" }));
});
// route to show the home.html file
app.get("/", (req, res) => {
    res.render('home');
});

// route to show the about.html file
app.get("/about", (req, res) => {
    res.render('about');
});

// route to show the htmlDemo.html file
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

// route to the addStudent.html file
app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then(courses => res.render('addStudent', {courses: courses}))
        .catch(error => res.render('addStudent', {courses: []}));
});

// route for the addStudent Post request
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch(error => res.json({message : "could not add student"}));
});

app.get("/courses/add", (req, res) => {
    res.render('addCourse');
});

app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
    .then(() => res.redirect("/courses"))
    .catch(error => res.json({message : "could not add course"}));
});

// setup for the page not found
app.use((req, res) => {
    res.status(404).render('pageNotFound');
});

// setup http server to listen on HTTP_PORT
collegeData.initialize()
.then(dataCollection => {
    app.listen(HTTP_PORT, () => console.log("server listening on port: " + HTTP_PORT));
})
.catch( error => console.log(error));
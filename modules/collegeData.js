const Sequelize = require('sequelize');

var sequelize = new Sequelize('lsczafej', 'lsczafej', 'l8QDAmECuKDJGCHNL4s7B2yRHPKNyaBw', {
 host: 'drona.db.elephantsql.com',
 dialect: 'postgres',
 port: 5432,
 dialectOptions: {
     ssl: { rejectUnauthorized: false }
 },
 query:{ raw: true }
});

var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

var Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, {foreignKey:'course'});


const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                console.log('Database synced successfully.');
                resolve();
            })
            .catch(() => {
                reject('Unable to sync the database');
            });
    });
};

const getAllStudents = () => {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                resolve(students);
            })
            .catch(error => {
                console.error('Error fetching students:', error);
                reject('Error fetching students');
            });
    });
};

const getStudentsByCourse = (course) => {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                const studentsByCourse = students.filter(student => student.course === course);

                if(studentsByCourse.length === 0){
                    reject('No results returned');
                } else {
                    resolve(studentsByCourse);
                }
            })
            .catch(error => {
                console.error('Error fetching studentsByCourse:', error);
                reject('Error fetching studentsByCourse');
            });
    });
};

const getStudentByNum = (num) => {
    return new Promise((resolve, reject) => {
        Student.findAll()
            .then(students => {
                const studentByNum = students.filter(student => student.studentNum == num);
                if (studentByNum.length === 0) {
                    reject('No results returned');
                } else {
                    resolve(studentByNum[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching studentsByNum:', error);
                reject('Error fetching studentsByNum');
            });
    });
};

const getCourses = () => {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                if (courses.length === 0) {
                    reject('No results returned');
                } else {
                    resolve(courses);
                }
            })
            .catch(error => {
                console.error('Error fetching Course:', error);
                reject('Error fetching Course');
            });
    });
};

const getCourseById = (id) => {
    return new Promise((resolve, reject) => {
        Course.findAll()
            .then(courses => {
                const courseById = courses.filter(course => course.courseId == id);
                if (courseById.length === 0) {
                    reject('No results returned');
                } else {
                    resolve(courseById[0]);
                }
            })
            .catch(error => {
                console.error('Error fetching CourseById:', error);
                reject('Error fetching CourseById');
            });
    });
};

const addStudent = (studentData) => {
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData[key] === '') {
            studentData[key] = null;
        }
    }

    return new Promise((resolve, reject ) => {
        Student.create(studentData)
            .then(() => {
                console.log('Student created successfully.');
                resolve();
            })
            .catch(error => {
                console.error('Unable to create student:', error);
                reject('Unable to create student'); 
              });
    });
};



const updateStudent = (studentData) => {
    studentData.TA = (studentData.TA) ? true : false;
    for (const key in studentData) {
        if (studentData[key] === '') {
            studentData[key] = null;
        }
    }
    
    return new Promise((resolve, reject ) => {
        Student.update(studentData, {
            where: {studentNum: studentData.studentNum}
        }).then(() => {
                console.log('Student updated successfully.');
                resolve();
            })
            .catch(error => {
                console.error('Unable to update student:', error);
                reject('Unable to update student'); 
              });
    });
};

const addCourse = (courseData) => {
    for (const key in courseData) {
        if (courseData[key] === '') {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject ) => {
        Course.create(courseData)
            .then(() => {
                console.log('Course created successfully.');
                resolve();
            })
            .catch(error => {
                console.error('Unable to create course:', error);
                reject('Unable to create course'); 
              });
    });
};


const updateCourse = (courseData) => {
    for (const key in courseData) {
        if (courseData[key] === '') {
            courseData[key] = null;
        }
    }

    return new Promise((resolve, reject ) => {
        Course.update(courseData, {
            where: {courseId: courseData.courseId}
        }).then(() => {
                console.log('Course updated successfully.');
                resolve();
            })
            .catch(error => {
                console.error('Unable to update course:', error);
                reject('Unable to update course'); 
              });
    });
};

const deleteCourseById = (id) => {
    return new Promise((resolve, reject) => {
        Course.destroy({
            where: {courseId: id}
        })
            .then(() => resolve())
            .catch(() => reject('"Destroy" method encountered an error.'));
    });
};

const deleteStudentByNum = (studentNum) => {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: {studentNum: studentNum}
        })
            .then(() => resolve())
            .catch(() => reject('"Destroy" method encountered an error.'));
            
    })
};

module.exports = {initialize, getAllStudents, getCourses, getStudentsByCourse,
    getStudentByNum, addStudent, getCourseById, updateStudent, addCourse,
    updateCourse, deleteCourseById, deleteStudentByNum};
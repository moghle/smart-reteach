var app = new Vue({
    el: '#dashboardApp',
    data: {
        courses: [],
    },
    mounted() {

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const ref = firebase.firestore().collection('Courses');
                ref.onSnapshot(snapshot => {
                    let courses = [];
                    snapshot.forEach(doc => {
                        courses.push({ ...doc.data(), id: doc.id });
                    });

                    this.courses = courses;
                    self = this
                    firebase.firestore().collection("Users").doc(user.uid).get().then((doc) => {
                        if (doc.exists) {
                            progress = doc.data().Progress;
                            console.log(progress)
                            self.courses.forEach(course => {
                                counter = 0;
                                progressCourse = 0;
                                //progress has been made
                                if (progress != undefined) {
                                    progress.forEach(lecture => {
                                        if (lecture.courseID == course.id) {
                                            if (lecture.progress != "undefined") {
                                                progressCourse = progressCourse + lecture.progressStatus

                                            }
                                            counter=counter+1;
                                        }

                                    })
                                }
                                else {
                                    course.progress = 0;
                                }
                                course.progress = Math.floor(progressCourse/counter)

                            })
                            self.$forceUpdate();


                        } else {
                            // doc.data() will be undefined in this case
                            console.log("No such document!");
                        }
                    }).catch((error) => {
                        console.log("Error getting document:", error);
                    });
                })

            } else {
                // User is signed out
                // ...
            }
        });


    },
    methods: {
        getid: function () {
            this.userid = localStorage.getItem("buttonId");
        },
        chooseCoursefn: function (event) {
            targetId = event.currentTarget.id;
            localStorage.setItem("targetCourseID", targetId);
            window.location.replace("videoplayer.html")
        }
    },
});
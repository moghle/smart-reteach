var app = new Vue({
    el: '#coursesApp',
    data: {
        courses: [],
        readyToSubmit: false,
        videoPath: "no-file",
        modal: true,
        open: false,
        openC: false,
        lectures: [],
        currentCourseId: "no-ID"
    },
    mounted() {
        this.getid();
        const ref = firebase.firestore().collection('Courses');
        ref.onSnapshot(snapshot => {
            let courses = [];
            snapshot.forEach(doc => {
                courses.push({ ...doc.data(), id: doc.id });
            });

            this.courses = courses;
        });


    },
    methods: {
        getid: function () {
            this.userid = localStorage.getItem("buttonId");
        },
        addLecturefn: function (event) {
            this.open = true;

            // close "add lectures" modal
            document.querySelector('.new-lecture').addEventListener('click', (e) => {
                if (e.target.classList.contains('new-lecture')) {
                    this.open = false;
                }
            });

            /* Upload Functionality*/
            var uploader = document.getElementById('uploader');
            var fileButton = document.getElementById('fileButton');

            var self = this;
            /* Upload Functionality*/
            fileButton.addEventListener('change', function (e) {

                //get file
                var file = e.target.files[0];
                //create storage ref
                var storageRef = firebase.storage().ref('courses/' + file.name);
                //upload file
                var UploadTask = storageRef.put(file);

                //update progress bar
                const promise = new Promise((resolve, reject) => {
                    UploadTask.on('state_changed',

                        function progress(snapshot) {
                            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            uploader.value = percentage;
                        },
                        function error(err) {
                            reject(error); // added this line
                            alert(error);
                        },
                        function complete() {
                            UploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                console.log('File available at', downloadURL);
                                resolve(downloadURL);
                            });
                        }
                    );
                });

                promise.then(function (downloadURL) {
                    playerDuration = document.getElementById("video_player");
                    playerDuration.innerHTML = "<source src=" + downloadURL + " type='video/mp4'></source>"
                    self.videoPath = downloadURL;
                    self.readyToSubmit = true;
                });
            });


        },
        submitLecturefn: function () {
            const lectureForm = document.getElementById('lectureForm');
            playerDuration = document.getElementById("video_player");
            console.log(playerDuration.duration);
            if (this.readyToSubmit) {
                firebase.firestore().collection('Courses').doc(this.currentCourseId).get().then((doc) => {
                    if (doc.exists) {
                        newLecture = {
                            title: lectureForm.title.value,
                            videoPath: this.videoPath,
                            duration: playerDuration.duration,
                            created: firebase.firestore.Timestamp.now()
                        }
                        this.lectures.push(newLecture);
                        console.log(this.lectures);

                        firebase.firestore().collection('Courses').doc(this.currentCourseId).update("lectures",this.lectures)
                        lectureForm.reset();
                        lectureForm.querySelector('.error').textContent = '';
                        this.readyToSubmit = false;
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });





                // firebase.firestore().collection("Courses").add({
                //     title: lectureForm.title.value,
                //     videoPath: this.videoPath,
                //     duration: playerDuration.duration
                // })
                //     .then((docRef) => {
                //         // firebase.firestore().collection("lecturesID").add({
                //         //     id: docRef.id,

                //         // });
                //         lectureForm.reset();
                //         lectureForm.querySelector('.error').textContent = '';
                //         this.readyToSubmit = false;
                //     });
            }

        },
        newCoursefn: function () {

            const courseForm = document.querySelector('.courseForm');
            firebase.firestore().collection("Courses").add({
                subject: courseForm.subject.value,
                class: courseForm.class.value,
                year: courseForm.year.value,
                semester: courseForm.semester.value,
                created: firebase.firestore.Timestamp.now()

            })
                .then((docRef) => {
                    // firebase.firestore().collection("coursesID").add({
                    //     id: docRef.id,
                    // });
                    courseForm.reset();
                    courseForm.querySelector('.error').textContent = '';
                    this.openC = false;
                });
        },
        openCourseModalfn: function () {
            this.openC = true;
            // close course modal
            document.querySelector('.new-course').addEventListener('click', (e) => {
                if (e.target.classList.contains('new-course')) {
                    this.openC = false
                }
            });
        },
        signoutfn: function () {
            console.log("signout is working");
            firebase.auth().signOut()
                .then(() => window.location.replace("../index.html"));
        },
        displayCourse: function (event) {
            targetId = event.currentTarget.id;
            this.currentCourseId = targetId;
            firebase.firestore().collection('Courses').doc(targetId).get().then((doc) => {
                if (doc.exists) {
                    this.lectures = Object.values(doc.data().lectures);
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });

        }
    },
});
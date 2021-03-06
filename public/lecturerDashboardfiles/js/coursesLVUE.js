var app = new Vue({
    el: '#coursesApp',
    data: {
        courses: [],
        readyToSubmit: true,
        videoPath: "no-file",
        modal: true,
        open: false,
        openC: false,
        lectures: [],
        currentCourseId: "no-ID",
        currentCourseName: "Please select a class to display",
        lecturestemp: []
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

                //rename file to avoid errors (path changing)
                const chars =
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let autoId = '';
                for (let i = 0; i < 10; i++) {
                    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                filename = file.name +autoId;

                //create storage ref
                var storageRef = firebase.storage().ref('courses/' + filename);
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

            //creating unique ID for each lecture
            const chars =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let autoId = '';
            for (let i = 0; i < 20; i++) {
                autoId += chars.charAt(Math.floor(Math.random() * chars.length));
            }


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
                            created: firebase.firestore.Timestamp.now().toDate(),
                            lectureID: autoId,
                            courseID: this.currentCourseId
                        }
                        this.lectures.push(newLecture);
                        console.log(this.lectures);

                        firebase.firestore().collection('Courses').doc(this.currentCourseId).update("lectures", this.lectures)
                        lectureForm.reset();
                        lectureForm.querySelector('.error').textContent = '';
                        this.readyToSubmit = true;
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
            lectures = []
            const courseForm = document.querySelector('.courseForm');
            firebase.firestore().collection("Courses").add({
                subject: courseForm.subject.value,
                grade: courseForm.grade.value,
                year: courseForm.year.value,
                semester: courseForm.semester.value,
                created: firebase.firestore.Timestamp.now(),
                lectures: lectures

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
            self = this;
            firebase.firestore().collection('Courses').doc(targetId).get().then((doc) => {
                if (doc.exists) {
                    lectures = Object.values(doc.data().lectures);

                    lectures.sort(function (x, y) {
                        return x.created - y.created;
                    })
                    lectures.forEach(lecture => {
                        date = lecture.created.toDate().toDateString();
                        time = lecture.created.toDate().toLocaleTimeString('en-US');
                        lecture.dateFormat = date + " " + time;
                        lecture.durationformat = self.FormatDuration(lecture.duration)
                    })

                    this.lectures = lectures;
                    this.currentCourseName = doc.data().subject;
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });

        },
        FormatDuration: function (time) {   
            // Hours, minutes and seconds
            var hrs = ~~(time / 3600);
            var mins = ~~((time % 3600) / 60);
            var secs = ~~time % 60;
        
            // Output like "1:01" or "4:03:59" or "123:03:59"
            var ret = "";
            if (hrs > 0) {
                ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            }
            ret += "" + mins + ":" + (secs < 10 ? "0" : "");
            ret += "" + secs;
            return ret;
        }
    },
});
var app = new Vue({
    el: '#coursesApp',
    data: {
        courses: [],
        readyToSubmit: false,
        filePath: "no-file",
        modal: true,
        open: false,
        openC: false,
    },
    mounted() {
        this.getid();
        const ref = firebase.firestore().collection('Courses');
        ref.onSnapshot(snapshot => {
            let courses = [];
            snapshot.forEach(doc => {
                courses.push({...doc.data(), id: doc.id });
            });

            this.courses = courses;
        });
    },
    methods: {
        getid: function() {
            this.userid = localStorage.getItem("buttonId");
        },
        addLecturefn: function(event) {
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
            fileButton.addEventListener('change', function(e) {

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

                promise.then(function(downloadURL) {
                    self.filePath = downloadURL;
                    self.readyToSubmit = true;
                });
            });


        },
        submitLecturefn: function() {
            const lectureForm = document.getElementById('lectureForm');

            if (this.readyToSubmit) {
                firebase.firestore().collection("Courses").add({
                        title: lectureForm.title.value,
                        filePath: this.filePath

                    })
                    .then((docRef) => {
                        // firebase.firestore().collection("lecturesID").add({
                        //     id: docRef.id,

                        // });
                        lectureForm.reset();
                        lectureForm.querySelector('.error').textContent = '';
                        this.readyToSubmit = false;
                    });
            }

        },
        newCoursefn: function() {

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
        openCourseModalfn: function() {
            this.openC = true;
            // close course modal
            document.querySelector('.new-course').addEventListener('click', (e) => {
                if (e.target.classList.contains('new-course')) {
                    this.openC = false
                }
            });
        }
    },
});
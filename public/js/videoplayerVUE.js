var app = new Vue({
    el: '#playerApp',
    data: {
        courses: [],
        lectures: [],
        markers: [],
        video: "no-video",
        bookmarks: [],
        currentlyPlaying: "http://vjs.zencdn.net/v/oceans.mp4",
        currentBookmarks: [],
        Progress: [],
        currentCourse: "",
        title:"Lectures"
    },
    mounted() {
        this.currentCourse = localStorage.getItem("targetCourseID");
        currentVideo = document.getElementById("my-video");
        console.log(currentVideo);
        var video = videojs(currentVideo, {
            playbackRates: [0.25, 0.5, 1, 1.5, 2, 2.5, 3],
            fluid: true,
            controls: true
        });
        this.video = video;
        var self = this;

        console.log(self.markers);

        //intiate markers
        video.markers({
            markers: []
        });


        //if user authenticated then -> render:
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log(user.uid);



                firebase.firestore().collection('Courses').doc(self.currentCourse).get().then((doc) => {
                    if (doc.exists) {
                        lecturesMap = doc.data().lectures;
                        self.title = doc.data().subject;
                        lecturesMap = Object.values(lecturesMap);
                        lecturesMap.forEach(lecture => {
                            progressReached = 0;
                            lecture.currentProgress = 0;
                            lecture.durationFormat = self.FormatDuration(lecture.duration);
                        })

                        self.currentlyPlaying = lecturesMap[0];
                        self.video.src({ type: 'video/mp4', src: lecturesMap[0].videoPath });


                        self.lectures = lecturesMap;



                        firebase.firestore().collection('Users').doc(user.uid).get().then((doc) => {
                            if (doc.exists) {
                                bookmarkInitialized = doc.data().Markers;
                                if (typeof bookmarkInitialized !== 'undefined') {

                                    bookmarks = Object.values(doc.data().Markers)
                                    bookmarks.sort(function (a, b) {
                                        return a.time - b.time;
                                    });
                                    self.bookmarks = bookmarks;

                                }
                                progressInitialized = doc.data().Progress;
                                if (typeof progressInitialized == 'undefined') {

                                    firebase.firestore().collection('Users').doc(user.uid).update("Progress", [])
                                }
                                else {
                                    self.Progress = Object.values(doc.data().Progress)

                                    self.lectures.forEach(lecture => {
                                        self.Progress.forEach(lectureProgress => {
                                            if (lectureProgress.lectureID == lecture.lectureID) {
                                                lecture.currentProgress = lectureProgress.progressStatus
                                            }
                                        })
                                    })
                                    self.$forceUpdate();
                                }
                            } else {
                                // doc.data() will be undefined in this case 
                                console.log("No bookmarks!");
                            }
                        }).catch((error) => {
                            console.log("Error getting document:", error);
                        });

                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });







                // video.autoplay("muted");
                self.video = video;






            }
        });

        // this.getid();




    },
    methods: {
        getid: function () {
            this.userid = localStorage.getItem("buttonId");
        },
        addBookmarkfn: function (event) {
            var userID = firebase.auth().currentUser.uid;
            var marker;
            var hint = document.getElementById("hintText").value;
            this.video.pause();
            console.log(this.video.currentTime())
            marker = { time: this.video.currentTime(), text: hint }


            this.video.markers.add([marker]);

            marker.lectureID = this.currentlyPlaying.lectureID

            this.bookmarks.push(marker);
            // console.log(this.video.currentTime());
            firebase.firestore().collection('Users').doc(userID).update("Markers", this.bookmarks)
            this.$forceUpdate();

        },
        playFromPlaylistfn: function (event) {
            targetId = event.currentTarget.id;
            currentBookmarks = [];

            this.lectures.forEach(lecture => {
                if (lecture.lectureID == targetId) {
                    this.video.src({ type: 'video/mp4', src: lecture.videoPath });
                    this.currentlyPlaying = lecture;
                }
            })

            //add lecture markers:
            this.video.markers.removeAll();
            this.bookmarks.forEach(marker => {
                if (marker.lectureID == this.currentlyPlaying.lectureID) {
                    this.video.markers.add([{ time: marker.time, text: marker.text }]);
                    currentBookmarks.push(marker);
                }
            })
            this.currentBookmarks = currentBookmarks;
        },
        saveProgressfn: function () {
            var userID = firebase.auth().currentUser.uid;
            found = false;
            this.video.pause();
            progressReached = this.video.currentTime();
            progressCalculation = Math.round((((this.currentlyPlaying.duration - progressReached) / this.currentlyPlaying.duration) * 100) - 100) * -1;


            //in case length = 1 
            this.Progress.forEach(element => {

                if (element.lectureID == this.currentlyPlaying.lectureID) {
                    element.progressStatus = progressCalculation;
                    found = true;
                }
            })
            //in case no progress yet (length = 0) or new progress 
            if (this.Progress.length == 0 || !found) {
                newProgress = { 
                    progressStatus: progressCalculation,
                    lectureID: this.currentlyPlaying.lectureID,
                    courseID: this.currentCourse
                };
                this.Progress.push(newProgress);
                console.log("test")
            }


            console.log(this.Progress)
            firebase.firestore().collection('Users').doc(userID).update("Progress", this.Progress)

            this.lectures.forEach(lecture => {
                if (lecture.lectureID == this.currentlyPlaying.lectureID) {
                    lecture.currentProgress = Math.round((((lecture.duration - progressReached) / lecture.duration) * 100) - 100) * -1;
                    if (lecture.currentProgress >= 95)
                        lecture.currentProgress = 100;
                }
            })
            this.$forceUpdate();
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


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
        Progress: []
    },
    mounted() {

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
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log(user.uid);

                //if user authenticated render:

                const ref = firebase.firestore().collection('Courses').where("subject", "==", "Biology");
                ref.onSnapshot(snapshot => {
                    let courses = [];
                    snapshot.forEach(doc => {
                        courses.push({ ...doc.data(), id: doc.id });
                    });

                    self.courses = courses;
                    lecturesMap = self.courses[0].lectures;
                    lecturesMap = Object.values(lecturesMap);
                    lecturesMap.forEach(lecture => {
                        progressReached = 0;
                        lecture.currentProgress = Math.round((((lecture.duration - progressReached) / lecture.duration) * 100) - 100) * -1;
                        if (lecture.currentProgress >= 95)
                            lecture.currentProgress = 100;
                    })
                    console.log(lecturesMap)
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
                                        console.log("lecture: " + lecture.lectureID + " progress " + lectureProgress.lectureID)
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

                });






                video.autoplay("muted");
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
            this.video.pause();
            progressReached = this.video.currentTime();

            this.Progress.forEach(element => {
                if (element.lectureID == this.currentlyPlaying.lectureID) {
                    element.progressStatus = progressReached;
                }
                else {
                    newProgress = { progressStatus: progressReached, lectureID: this.currentlyPlaying.lectureID };
                    this.Progress.push(newProgress);
                }
            })
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
        }
    },
});









// //to add new lecture 
// const ref = firebase.firestore().collection('Courses').where("subject", "==", "math");
//         ref.onSnapshot(snapshot => {
//             let courses = [];
//             snapshot.forEach(doc => {
//                 courses.push({ ...doc.data(), id: doc.id });
//             });

//             this.courses = courses;
//             console.log(typeof (this.courses))
//             lecturesMap = this.courses[0].lectures
//             console.log(Object.values(lecturesMap));
//             this.lectures = Object.values(lecturesMap);
//             lecturesKeys = Object.keys(lecturesMap);
//             lecturesMap[3] = {
//                 videoPath: "lecture 3"
//             };
//             console.log(lecturesKeys+" "+Math.max(...lecturesKeys) +" "+ typeof(lecturesKeys));
//             console.log(this.lectures)
//             firebase.firestore().collection('Courses').doc("XbRMhnaMLPGHHyUsXbTS").update("lectures",lecturesMap)
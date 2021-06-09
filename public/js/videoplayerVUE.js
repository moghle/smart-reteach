var app = new Vue({
    el: '#playerApp',
    data: {
        courses: [],
        lectures: [],
        markers: [],
        video: "no-video",
        bookmarks: [],
        currentlyPlaying: "http://vjs.zencdn.net/v/oceans.mp4"
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
                        progressReached = 6;
                        lecture.currentProgress = Math.round(((lecture.duration - progressReached) / lecture.duration) * 100);
                        if (lecture.currentProgress >= 95)
                            lecture.currentProgress = 100;
                    })
                    console.log(lecturesMap)
                    self.lectures = lecturesMap;

                });


                firebase.firestore().collection('Users').doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        console.log("Document data:", doc.data().mathMarkers);//todo
                        bookmarks = Object.values(doc.data().mathMarkers)
                        bookmarks.sort(function (a, b) {
                            return a.time - b.time;
                        });
                        self.bookmarks = bookmarks;
                        bookmarks.forEach(marker => {
                            console.log(marker.time + " " + marker.text)
                            self.video.markers.add([{ time: marker.time, text: marker.text }]);
                        })
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No bookmarks!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
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

            this.bookmarks.push(marker);
            // console.log(this.video.currentTime());
            console.log(firebase.auth().currentUser.uid);
            console.log(this.bookmarks);
            firebase.firestore().collection('Users').doc(userID).update("mathMarkers", this.bookmarks)

        },
        playFromPlaylistfn: function (event) {
            targetId = event.currentTarget.id;

            console.log(targetId);
            this.lectures.forEach(lecture =>{
                if(lecture.lectureID == targetId){
                    this.video.src({ type: 'video/mp4', src: lecture.videoPath});
                    console.log(this.currentlyPlaying);
                }
            })

            
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
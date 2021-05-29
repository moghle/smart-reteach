var app = new Vue({
    el: '#playerApp',
    data: {
        courses: [],
        lectures: [],
        markers: [
            { time: 9.5, text: "this" },
            { time: 16, text: "is" },
            { time: 23.6, text: "so" },
            { time: 28, text: "cool" }
        ]
    },
    mounted() {
        // this.getid();
        const ref = firebase.firestore().collection('Courses').where("subject", "==", "math");
        ref.onSnapshot(snapshot => {
            let courses = [];
            snapshot.forEach(doc => {
                courses.push({ ...doc.data(), id: doc.id });
            });

            this.courses = courses;
            console.log(typeof (this.courses))
            lecturesMap = this.courses[0].lectures
            console.log(Object.values(lecturesMap));
            this.lectures = Object.values(lecturesMap);
            console.log(this.lectures)
        });
        currentVideo = document.getElementById("my-video");
        console.log(currentVideo);
        var video = videojs(currentVideo, {
            playbackRates: [0.25, 0.5, 1, 1.5, 2, 2.5, 3],
            fluid: true,
            controls: true
        });
        console.log(this.markers);
        video.markers({
            markers: this.markers
         });

        video.markers.next()
        video.autoplay("muted");
        this.markers.pop();
        this.markers.pop();

    },
    methods: {
        getid: function () {
            this.userid = localStorage.getItem("buttonId");
        },
        playVideofn: function (event) {

        }
    },
});
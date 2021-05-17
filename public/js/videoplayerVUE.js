var app = new Vue({
    el: '#playerApp',
    data: {
        courses: [],
        lectures: []
    },
    mounted() {
        // this.getid();
        const ref = firebase.firestore().collection('Courses').where("subject","==","math");
        ref.onSnapshot(snapshot => {
            let courses = [];
            snapshot.forEach(doc => {
                courses.push({ ...doc.data(), id: doc.id });
            });

            this.courses = courses;
            console.log(typeof(this.courses))
            lecturesMap = this.courses[0].lectures
            console.log(Object.values(lecturesMap));
            this.lectures = Object.values(lecturesMap);
            console.log(this.lectures)
        });
    },
    methods: {
        getid: function () {
            this.userid = localStorage.getItem("buttonId");
        },
        playVideofn: function (event) {

        }
    },
});
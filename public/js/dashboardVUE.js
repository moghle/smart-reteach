var app = new Vue({
    el: '#dashboardApp',
    data: {
        courses: [],
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
        chooseCoursefn: function(event){
            targetId = event.currentTarget.id;
            localStorage.setItem("targetCourseID", targetId);
            window.location.replace("videoplayer.html")
        }
    },
});
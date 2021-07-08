var app = new Vue({
    el: '#studentInfoApp',
    data: {
        users: [],
        currentUser: "Sami Ayoob"
    },
    mounted() {

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const ref = firebase.firestore().collection('Users');
                ref.onSnapshot(snapshot => {
                    let courses = [];
                    snapshot.forEach(doc => {
                        courses.push({ ...doc.data(), id: doc.id });
                    });

                });
            }
            else {
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
        },
        signoutfn: function () {
            console.log("signout is working");
            firebase.auth().signOut()
                .then(() => window.location.replace("../index.html"));
        },
    },
});
var app = new Vue({
    el: '#homeApp',
    data: {
        currentUser: "None",
        user:"",
        news: [],
        notes: []
    },
    mounted() {
        const newsfeed = firebase.firestore().collection('newsfeed');
        const notes = firebase.firestore().collection('notes');

        newsfeed.onSnapshot(snapshot => {
            let news = [];
            snapshot.forEach(doc => {
                news.push({ ...doc.data(), id: doc.id });
            });

            this.news = news;
        });

        notes.onSnapshot(snapshot => {
            let notes = [];
            snapshot.forEach(doc => {
                notes.push({ ...doc.data(), id: doc.id });
            });

            this.notes = notes;
        });

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              console.log(user)
              this.user = user;
              this.currentUser = user.displayName;

              // ...
            } else {
              // User is signed out
              // ...
            }
          });
          
    },
    methods: {
        addEventfn: function () {
            var userID = firebase.auth().currentUser.uid;
            date = new Date(document.getElementById("dateFeed").value);
            title = 
            body = document.getElementById("bodyFeed").value;
            const month = date.toLocaleString('default', { month: 'long' });
            const day = date.getDay();
            console.log(month + " "+day);

            firebase.firestore().collection("newsfeed").add({
                titleFeed: title,
                bodyFeed: body,
                dateFeed: date,
                day: day,
                month: month,
                user: userID
            }).then(() => {
                alert("posted");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });


        },
        addNotefn: function(){
            noteText = document.getElementById("noteText").value;

            firebase.firestore().collection("notes").add({
                text: noteText,
                user: this.user.uid
            }).then(() => {
                alert("posted");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });
        },

        signoutfn: function () {
            console.log("signout is working");
            firebase.auth().signOut()
                .then(() => window.location.replace("../index.html"));
        }
    },
});
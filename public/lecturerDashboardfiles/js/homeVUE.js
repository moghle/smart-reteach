var app = new Vue({
    el: '#homeApp',
    data: {
        currentUser: "None",
        user: "",
        news: [],
        notes: [],
        calendarInstance: ""
    },
    mounted() {
        firebase.firestore().settings({
            ignoreUndefinedProperties: true,
        })
        const newsfeed = firebase.firestore().collection('newsfeed');
        const notes = firebase.firestore().collection('notes');

        //init calendar
        myCalendar = document.getElementById("myCalendar");
        var calendarInstance = new calendarJs("myCalendar", {
            exportEventsEnabled: true,
            manualEditingEnabled: true,
            showTimesInMainCalendarEvents: false,
            minimumDayHeight: 0,
            manualEditingEnabled: true,
            organizerName: "Your Name",
            organizerEmailAddress: "your@email.address",
            visibleDays: [0, 1, 2, 3, 4, 5, 6]
        });


        this.calendarInstance = calendarInstance;


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



                var docRef = firebase.firestore().collection("Users").doc(user.uid);

                docRef.get().then((doc) => {
                    if (doc.exists) {
                        var events = []
                        firebaseEvents = doc.data().calendar;
                        firebaseEvents.forEach(event => {
                            eventFrom = event.from.toDate();
                            eventTo = event.to.toDate();
                            currentEvent = [{
                                id: event.id,
                                from: eventFrom,
                                to: eventTo,
                                title: event.title,
                                description: event.description,
                                location: event.location,
                                color: event.color,
                                colorText: event.colorText,
                                colorBorder: event.colorBorder,
                                isAllDay: event.isAllDay,
                                repeatEvery: event.repeatEvery,
                                repeatEveryExcludeDays: event.repeatEveryExcludeDays,
                                seriesIgnoreDates: event.seriesIgnoreDates,
                                created: event.created,
                                organizerName: event.organizerName,
                                organizerEmailAddress: event.organizerEmailAddress,
                                repeatEnds: event.repeatEnds,
                                group: event.group
                            }]
                            console.log(currentEvent)
                            this.calendarInstance.addEvents(currentEvent)


                            events.push(event);
                        })
                        console.log("***" + events)
                    } else {
                        // doc.data() will be undefined in this case
                        console.log("No such document!");
                    }
                }).catch((error) => {
                    console.log("Error getting document:", error);
                });


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
            console.log(month + " " + day);

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
        addNotefn: function () {
            noteText = document.getElementById("noteText").value;


            // firebase.firestore().collection("notes").add({
            //     text: noteText,
            //     user: this.user.uid
            // }).then(() => {
            //     alert("posted");
            // }).catch((error) => {
            //     console.error("Error writing document: ", error);
            // });
        },

        signoutfn: function () {
            console.log("signout is working");
            firebase.auth().signOut()
                .then(() => window.location.replace("../index.html"));
        },
        saveCalendarfn: function () {
            console.log("clicked")
            firebase.firestore().collection('Users').doc(this.user.uid).update("calendar", this.calendarInstance.getEvents())

        }
    },
});
const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
// const signOut = document.querySelector('.sign-out');
var lecturer = false;

// toggle auth modals
authSwitchLinks.forEach(link => {
    link.addEventListener('click', () => {
        authModals.forEach(modal => modal.classList.toggle('active'));
    });
});

// register form
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = registerForm.email.value;
    const password = registerForm.password.value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return firebase.firestore().collection("Users").doc(cred.user.uid).set({
                email: email,
                lecturer: false
            });

        }).then(() => {
            registerForm.reset();
            login();
        })
        .catch(error => {
            registerForm.querySelector('.error').textContent = error.message;
        });
});

// login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(user => {
            console.log('logged in', user);
            console.log(user.displayName);
            loginForm.reset();
            login();
        })
        .catch(error => {
            loginForm.querySelector('.error').textContent = error.message;
        });
});

// // sign out
// signOut.addEventListener('click', () => {
//   firebase.auth().signOut()
//     .then(() => console.log('signed out'));
// });

// auth listener
function login() {
    firebase.auth().onAuthStateChanged(user => {
        firebase.firestore().collection('Users').doc(user.uid).get().then((docRef) => {
            console.log(docRef.data())
            if (user && docRef.data().lecturer) {
                authWrapper.classList.remove('open');
                authModals.forEach(modal => modal.classList.remove('active'));
                //window.open("player.html")
                window.location.replace("lecturerDashboardHtml/index.html")
            }
            if (user && docRef.data().lecturer == false) {
                authWrapper.classList.remove('open');
                authModals.forEach(modal => modal.classList.remove('active'));
                //window.open("player.html")
                window.location.replace("dashboard.html")
            }
            else {
                authWrapper.classList.add('open');
                authModals[0].classList.add('active');
            }
        })
    })

};

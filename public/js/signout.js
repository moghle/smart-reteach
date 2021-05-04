const signOut = document.querySelector('.sign-out');


// sign out
signOut.addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => window.location.replace("index.html"));
});


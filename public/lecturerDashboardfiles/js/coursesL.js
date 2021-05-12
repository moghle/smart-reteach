// const courseModal = document.querySelector('.new-course');
// const courseOpen = document.querySelector('.add-course');
// const courseForm = document.querySelector('.courseForm');

// // /* Upload Functionality*/  
// var uploader = document.getElementById('uploader');
// var fileButton = document.getElementById('fileButton');
// const lectureModal = document.querySelector('.new-lecture');
// const lectureOpen = document.querySelector('.add-lecture');
// const lectureForm = document.querySelector('.lectureForm');
// filePath = 'no-file-yet'
// var readytoSubmit = false;


// // open course modal
// courseOpen.addEventListener('click', () => {
//     courseModal.classList.add('open');
// });

// // close course modal
// courseModal.addEventListener('click', (e) => {
//     if (e.target.classList.contains('new-course')) {
//         courseModal.classList.remove('open');
//     }
// });

// courseForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     firebase.firestore().collection("Courses").add({
//             subject: courseForm.subject.value,
//             class: courseForm.class.value,
//             year: courseForm.year.value,
//             semester: courseForm.semester.value,
//             created: firebase.firestore.Timestamp.now()

//         })
//         .then((docRef) => {
//             firebase.firestore().collection("coursesID").add({
//                 id: docRef.id,
//             });
//             courseForm.reset();
//             courseForm.querySelector('.error').textContent = '';
//             courseModal.classList.remove('open');
//         });
// });



// // open "add lectures" modal
// lectureOpen.addEventListener('click', () => {
//     lectureModal.classList.add('open');
// });

// // close "add lectures" modal
// lectureModal.addEventListener('click', (e) => {
//     if (e.target.classList.contains('new-lecture')) {
//         lectureModal.classList.remove('open');
//     }
// });


// // add new lecture to a course
// lectureForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     if (readytoSubmit) {
//         firebase.firestore().collection("Courses").add({
//                 title: lectureForm.title.value,
//                 filePath: filePath

//             })
//             .then((docRef) => {
//                 // firebase.firestore().collection("lecturesID").add({
//                 //     id: docRef.id,

//                 // });
//                 lectureForm.reset();
//                 lectureForm.querySelector('.error').textContent = '';
//                 lectureModal.classList.remove('open');
//             });
//     }
// });








// /* Upload Functionality*/
// fileButton.addEventListener('change', function(e) {
//     //get file
//     var file = e.target.files[0];
//     //create storage ref
//     var storageRef = firebase.storage().ref('courses/' + file.name);
//     //upload file
//     var UploadTask = storageRef.put(file);

//     //update progress bar
//     UploadTask.on('state_changed',

//         function progress(snapshot) {
//             var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//             uploader.value = percentage;
//         },
//         function error(err) {

//         },
//         function complete() {
//             UploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
//                 console.log('File available at', downloadURL);
//                 filePath = downloadURL;
//                 readytoSubmit = true;
//             });
//         }
//     );
// });
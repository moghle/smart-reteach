const courseModal = document.querySelector('.new-course');
const courseOpen = document.querySelector('.add-course');
const courseForm = document.querySelector('.courseForm');

// open course modal
courseOpen.addEventListener('click', () => {
    courseModal.classList.add('open');
});

// close course modal
courseModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('new-course')) {
        courseModal.classList.remove('open');
    }
});

courseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    firebase.firestore().collection("Courses").add({
            subject: courseForm.subject.value,
            class: courseForm.class.value,
            year: courseForm.year.value,
            semester: courseForm.semester.value,
        })
        .then((docRef) => {
            firebase.firestore().collection("coursesID").add({
                id: docRef.id,

            });
            courseForm.reset();
            courseForm.querySelector('.error').textContent = '';
            //courseModal.classList.remove('open');
        });
});
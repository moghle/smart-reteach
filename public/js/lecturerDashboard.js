
/* Upload Functionality*/
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');


/* Upload Functionality*/
fileButton.addEventListener('change', function (e) {
    //get file
    var file = e.target.files[0];
    //create storage ref
    var storageRef = firebase.storage().ref('courses/' + file.name);
    //upload file
    var UploadTask = storageRef.put(file);

    //update progress bar
    UploadTask.on('state_changed',

        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploader.value = percentage;
        },
        function error(err) {

        },
        function complete() {
            UploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
            });
        }
    );
});
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAJNS71JJNa_k3bKMuSS-SqUeHRFik_8QE",
  authDomain: "madproject-2c3b4.firebaseapp.com",
  databaseURL: "https://madproject-2c3b4.firebaseio.com",
  projectId: "madproject-2c3b4",
  storageBucket: "madproject-2c3b4.appspot.com",
  messagingSenderId: "445214233554"
};
firebase.initializeApp(config);
var uid;
var ref = firebase.database().ref('users/'+uid);
var refStorage = firebase.storage().ref('users/');
var url;






      
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
    profilePhoto = user.photoURL;
    uid = user.uid;
    var ref = firebase.database().ref('users/'+uid);

    if(user.displayName !== null){
      $('#formNameInput').attr('value', user.displayName);
    }
    if(profilePhoto === null){
      $('#profileImage').attr('src', 'assets/images/defaultProfilePhoto.png');
      $('#updateImage').attr('src', 'assets/images/defaultProfilePhoto.png');
    }
    else{
      $('#profileImage').attr('src', profilePhoto);
      $('#updateImage').attr('src', profilePhoto);
    }
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var file = evt.target.files[0];

        var metadata = {
          'contentType': file.type
        };

        // Push to child path.
        // [START oncomplete]
        refStorage.child(uid + '/images/' + file.name).put(file, metadata).then(function(snapshot) {
          url = snapshot.downloadURL;
          var profile = {
            image: {
              img: url
            }
          }
          ref.update(profile); //This updates the users profile that we handle through firebase
          user.updateProfile({ //This updates the actual user data that google handles through their server
            photoURL: url
          })
        }).catch(function(error) {
          // [START onfailure]
          console.error('Upload failed:', error);
          console.log(uid)
          // [END onfailure]
        });
        // [END oncomplete]
      }
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
        document.getElementById('file').disabled = true;


    //Checking for user information and loading it on the page
    ref.on('child_added', function(snapshot){
      if(snapshot.val().bio === undefined || snapshot.val().bio === ""){
        $('#formBioTextarea').attr('placeholder', "Tell us a little bit about yourself");
      }
      else {
        $('#formBioTextarea').html(snapshot.val().bio)
      }
      if(snapshot.val().img){
        profilePhoto = snapshot.val().img;
      }
    });
    ref.on('child_changed', function(snapshot){
      profilePhoto = snapshot.val();
      $('#profileImage').attr('src', profilePhoto.img);
      $('#updateImage').attr('src', profilePhoto.img);
    })
    //Makes changes to profile
    $('#updateProfileBtn').on('click', function(){
      event.preventDefault();
      var name = $('#formNameInput').val().trim();
      var bio = $('#formBioTextarea').val().trim();
      var profile = {
        profile: {
          name: name,
          bio: bio
        }
      };
      user.updateProfile({ //This updates the actual user data that google handles through their server
        displayName: name
      })
      ref.update(profile); //This updates the users profile that we handle through firebase
    })
    document.getElementById('file').disabled = false;
    //Handles sign out
    $('#signOut').on('click', function(){
      firebase.auth().signOut();
    });
  } else {
    // No user is signed in.
    window.location = 'index.html';
  }
});
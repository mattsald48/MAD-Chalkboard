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
var name, email, photoUrl, uid, emailVerified;
var refStorage;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
    email = user.email;
    emailVerified = user.emailVerified;
    uid = user.uid;
    profilePhoto = user.photoURL;
    var ref = firebase.database().ref('users/'+uid);
    var refRoster = firebase.database().ref('users/'+uid+'/roster');
    refStorage = firebase.storage().ref('users/');
    if(profilePhoto === null){
      $('#profileImage').attr('src', 'assets/images/defaultProfilePhoto.png')
    }
    else{
      $('#profileImage').attr('src', profilePhoto);
    }
    //Handles sign out
    $('#signOut').on('click', function(){
      firebase.auth().signOut();
    })
  } else {
    // No user is signed in.
    window.location = 'index.html';
  }
});
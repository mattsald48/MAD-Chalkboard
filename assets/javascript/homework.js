firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
    email = user.email;
    emailVerified = user.emailVerified;
    uid = user.uid;
    profilePhoto = user.photoURL;
    var ref = firebase.database().ref('users/'+uid);
    var refHomework = firebase.database().ref('users/'+uid+'/homework');
    var refRoster = firebase.database().ref('users/'+uid+'/roster');
    document.getElementById('file').addEventListener('change', function(evt){
      for (var i = 0; i < evt.target.files.length; i++) {
        var docFile = evt.target.files[i];
        uploadDocFilesAsPromise(docFile);
      }
    });
    //Handle waiting to upload each file using promise
    function uploadDocFilesAsPromise (docFile) {
      var metadata = {
        'contentType': docFile.type
      };
      return new Promise(function (resolve, reject) {
        refStorage.child(uid + '/homework/' + docFile.name).put(docFile, metadata).then(function(snapshot) {
          homeworkMetaData = snapshot.metadata;
          console.log(homeworkMetaData)
          dataObject = {
            url: snapshot.downloadURL,
            name: homeworkMetaData.name,
            size: homeworkMetaData.size,
            timeCreated: homeworkMetaData.timeCreated,
            type: homeworkMetaData.type,
            updated: homeworkMetaData.updated,
            generation: homeworkMetaData.generation
          }
          refHomework.push(dataObject); //This updates the users profile that we handle through firebase
        }).catch(function(error) {
          // [START onfailure]
          console.error('Upload failed:', error);
          console.log(uid)
          // [END onfailure]
        });
        // [END oncomplete]
      })
    }
    refHomework.on('child_added', function(snapshot){
      var storage = firebase.storage();
      var hw = snapshot.val();
      var downloadHomework = $('<div>');
      var date = moment(hw.updated).format('MMMM Do, YYYY');
      var httpReference = storage.refFromURL(hw.url);
      var downURL;
      // Get the download URL
      httpReference.getDownloadURL().then(function(url) {
        // Insert url into an <img> tag to "download"
        downURL = url
        downloadHomework.addClass('col-lg-6 mb-3').append('<div class="card"><div class="card-block"><h6 class="card-title">' + hw.name + '</h6><p class="card-text">' + date + '</p><a class="btn bg-coral" href="' + hw.url + '" target="_blank">Open</a><a class="btn bg-lightGreen mx-2" href="' + downURL + '" download>Download</a><a href="" class="btn btn-warning">Message</a></div></div>')
        $('#fileView').append(downloadHomework);
      }).catch(function(error) {

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/object_not_found':
            // File doesn't exist
            break;

          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;

          case 'storage/canceled':
            // User canceled the upload
            break;

          //

          case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
      });


    })
  } else {
    // No user is signed in.
    window.location = 'index.html';
  }
});
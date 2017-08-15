var ref = firebase.database().ref();
var message = "";         //var that holds the message from text area
var selection = "";       //var that holds the student choosen for the message.  Might rename to mail.
var subject = "";         //var that holds the subject of the message.  
var student = "";         //var to hold the snapshot
var studentMID = "";      //var to hold the student id of the message recipient 
var name = "";            //var that holds student name
var studentID = "";       //var holds student id as well but on child_added
var space = 0;            //var for finding the where the space between id number and name is
var currentMessages = 0;  //current number of messages student selected has
var totalMessages = 0;    //total number of messages added
var newMessage = {};      //ussed for adding new messages as well as a date stamp
var updateNum = {};       //used for updating the number of messages
var messageNum = "";      //
var name, email, photoUrl, uid, emailVerified;
var ref;
//Kind of confusing Messages is the key for the number of messages the student currently has
//Message is the key for the messages.  I'm going to rename them if i get a chance.
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
    email = user.email;
    emailVerified = user.emailVerified;
    uid = user.uid;
    ref = firebase.database().ref('users/'+uid);
    var refRoster = firebase.database().ref('users/'+uid+'/roster');
    var messageRef = firebase.database().ref('users/'+uid+'/roster/'+studentMID);
    var messageRecal = firebase.database().ref('users/'+uid+'/roster/'+studentMID+'/Message/'+messageNum);
    var refMessages = firebase.database().ref('users/'+uid+'/messages/'+studentMID+'/'+messageNum)
    var refMessagesList = firebase.database().ref('users/'+uid+'/messages/')
    refMessagesList.on('child_added', function(snapshot){
      console.log(snapshot.val())
    })
    //This section adds all the students into the dropdown selection
    refRoster.on('child_added', function(snapshot, prevChildKey){
      student = snapshot.val();   //student object
      studentID = student.ID;    //holder for ID
      $('#studentSelect1').append("<option>" +studentID+ " " +student.Student);
      $('#studentSelectSent').append("<option>" +studentID+ " " +student.Student);
    });

    //clicking the submit button 
    $("#button").on('click', function(){
      event.preventDefault();
      //getting the inputs
      selection = $("#studentSelect1").val().trim();  //student selection
      message = $("#submitTextArea").val().trim();    //the message being sent to the student.  thinking of renaming it mail because there are too many message variables
      subject = $("#subjectLine").val().trim();        //subject of the message
      //converting the selection from  123456 Student Name to just 123456
      //space is where the space after the number is found
      //turn this into function if there is time since it is done in more than one spot 
      space = selection.indexOf(" ");
      studentMID = selection.substring(0, space);
      name = selection.substring(space+1);
      //finding the current amount of messages the student has before adding one more  
      refRoster.once("value", function(snap) { 
         currentMessages = snap.child(studentMID).val().Messages;
         console.log(currentMessages);
      });
      //tracking the number of messages
      currentMessages++;
      totalMessages++;
      //creating an node with correct message number
      messageNum = "m"+currentMessages; //creating m+currentMessages(m2, m3, m4.....)
      totalMessagesNum = totalMessages;
      newMessage = {
        student: studentMID,
        name: name,
        message: message,
        subject: subject,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };
      messageStack = {
        student: studentMID,
        name: name,
        message: message,
        subject: subject,
        totalMessages: totalMessages,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };
      //updating message number in the student ID object
      updateNum = {
        Messages: currentMessages,
      };
      //used for the total number of messages
      var currentCount = {
        numMessagesTotal: totalMessages,
      };
      //adds m+currentMessages to database(m2, m3, m4....)
      messageRef.child(studentMID).child("Message").child(messageNum).update(newMessage);
      //updating the currentCount number
      ref.child("Current Sent Count").update(currentCount);
      //this is making a node that holds all messagse and stores them when they are created.
      ref.child("AllMessages").child(totalMessagesNum).update(messageStack); 
      //updates the number of messages the student has
      messageRef.child(studentMID).update(updateNum);
      //finding the current amount of total messages  
      ref.once("value", function(snap) { 
        totalMessages = snap.child("Current Sent Count").val().numMessagesTotal;
        console.log(totalMessages);
      });
      $("#subjectLine").val("");
      $("#submitTextArea").val("");
    });//end of Send button click

    $("#buttonSent").on('click', function(){
      event.preventDefault();
      //clears the sentMessage div
      $("#sentMessages").empty();
      selection = $("#studentSelectSent").val().trim();
      console.log(selection);
      if(selection === "All Messages"){
        messageRecal = firebase.database().ref('users/'+uid+'/AllMessages').orderByKey();
        messageRecal.once("value").then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            var lineOne = childData.student+" "+childData.name;
            var lineTwo = childData.subject;
            var lineThree = childData.message;
            console.log(childData.message);
            $("#sentMessages").prepend('<div class="card cardStack"><div class="card-block"><h4 id="outID" class="card-title"><h4 id="outID" class="card-title">'+lineOne+'</h4><h6 id="outSubject" class="card-subtitle mb-2 text-muted">Subject: '+lineTwo+'</h6><p id="outMessage" class="card-text">'+lineThree+'</p></div></div></div><br>');
            $(".card.cardStack").on("click", function(){
              console.log("hi");
              $(this).remove();
            });
          });
        });
      }else{
        //need to turn this into a function
        space = selection.indexOf(" ");
        studentMID = selection.substring(0, space);
        messageRecal = firebase.database().ref('users/'+uid+'/roster/'+studentMID+'/Message').orderByKey();
        messageRecal.once("value").then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            var lineOne = childData.student;
            var lineTwo = childData.subject;
            var lineThree = childData.message;
            console.log(childData.message);
            $("#sentMessages").prepend('<div class="card cardStack"><div class="card-block"><h4 id="outID" class="card-title"><h4 id="outID" class="card-title">'+selection+'</h4><h6 id="outSubject" class="card-subtitle mb-2 text-muted">Subject: '+lineTwo+'</h6><p id="outMessage" class="card-text">'+lineThree+'</p></div></div></div><br>');
            $(".card.cardStack").on("click", function(){
              console.log("hi");
              $(this).remove();
            });
          });
        });
      }
    });//end of Sent button click
      //hide/shows the selection area
      $("#messageCard").on("click", function(){
        if ($("#formMessage").data("show") === "hidden"){
          $('#sentMessages').empty()
          $("#formMessage").show();
          $("#formMessage").data("show", "visible");
          $("#messageHolder").data("show", "hidden");
          $("#messageHolder").hide();
        }else{
          $("#formMessage").hide();
          $("#formMessage").data("show", "hidden");
        }
      });
      //hide/shows sent messages
      $("#sentCard").on("click", function(){
        if ($("#messageHolder").data("show") === "hidden"){
          $("#messageHolder").show();
          $("#messageHolder").data("show", "visible");
          $("#formMessage").data("show", "hidden");
          $("#formMessage").hide();       
        }else{
          $("#messageHolder").hide();
          $("#messageHolder").data("show", "hidden");
        }
      });
  }else{
    // No user is signed in.
    window.location = 'index.html';
  }
})
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAJNS71JJNa_k3bKMuSS-SqUeHRFik_8QE",
  authDomain: "madproject-2c3b4.firebaseapp.com",
  databaseURL: "https://madproject-2c3b4.firebaseio.com",
  projectId: "madproject-2c3b4",
  storageBucket: "madproject-2c3b4.appspot.com",
  messagingSenderId: "445214233554"
};
var name, email, photoUrl, uid, emailVerified, todayDate;
var ref;
var students = [];
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
  	email = user.email;
  	emailVerified = user.emailVerified;
  	uid = user.uid;
    todayDate = new Date();
    ref = firebase.database().ref('users/'+uid);
    var refRoster = firebase.database().ref('users/'+uid+'/roster');
    var refAttendance = firebase.database().ref('users/'+uid+'/attendance/'+todayDate);
    //Firebase to run after all childs have been added
    refRoster.on('child_added', function(snapshot, prevChildKey){
      displayRoster(snapshot, true);
    });
    //When the attendance card is clicked this will run
    $('#attendance').on('click', function(event){
      event.preventDefault();
      if($(this).attr('data-toggled')==='on'){
        $('th').off('click', tableHeadClick);
        $(this).attr('data-toggled', 'off').removeClass('bg-coral').addClass('bg-lightGreen');
        $(this).find('h4').text('Exit');
        $(this).find('h6').text('Or submit below');
        $('#tableGrade, .studentGrade, #tableHomework, .studentHomework, #tableMessages, .studentMessages').hide();
        $('#roster').prepend('<th class="bg-coral" id="tableAttendance">Attendance</th>');
        $("tbody tr").each(function( index ) {
          console.log($(this))
          var checkID = $(this).children('.studentID').text();
          students.push(checkID);
          $(this).prepend('<td class="studentAttendance" id="' + checkID + '">'+
          '<label class="radio-inline mr-2 mb-0">'+
          '<input data-att="T" type="radio" name="optradio' + checkID + '"> T'+
          '</label>'+
          '<label class="radio-inline mr-2 mb-0">'+
          '<input data-att="P" type="radio" name="optradio' + checkID + '"> P'+
          '</label></td>');
        });
        $('table').append('<button id=attendanceBtn class="btn bg-coral">submit</button>');
        //This grabs all checked students (tardy or present)
        $(document).on('click', '#attendanceBtn', function(){
          var resultChecked = [];
          var dataToSendChecked;
          $("input[type=radio]:checked").each(function(){
            var studentId = $(this).parent().parent().attr('id');
            var dataChecked = {
                ID: studentId,
                attendance: $(this).attr('data-att')
            }
            resultChecked.push(dataChecked)
          })
          //This makes the property be the name of the object
          dataToSendChecked = resultChecked.reduce((prev, current) => { prev[current.ID] = current; return prev; }, {});
          //This grabs all unchecked students (those who were not marked tardy or present)
          var resultUnchecked = [];
          var dataToSendUnchecked;
          for(i=0;i<students.length;i++){
            if (!(students[i] in dataToSendChecked)) {
              var dataUnchecked = {
                ID: students[i],
                attendance: 'A'
              }
              resultUnchecked.push(dataUnchecked)
            }
          }
          //This makes the property be the name of the object
          dataToSendUnchecked = resultUnchecked.reduce((prev, current) => { prev[current.ID] = current; return prev; }, {});
          //This 'merges' both objects into one
          var dataToSend = $.extend(dataToSendChecked, dataToSendUnchecked);
          refAttendance.update(dataToSend);
          //Get rids of attendance
          $('th').on('click', tableHeadClick);
          hideAttendance('#attendance')
        })
      }
      else{
        $('th').on('click', tableHeadClick);
        hideAttendance(this);
      }
      function hideAttendance(attendance){
        $('#tableGrade, .studentGrade, #tableHomework, .studentHomework, #tableMessages, .studentMessages').show();
        $('#tableAttendance, .studentAttendance, #attendanceBtn').remove();
        $(attendance).attr('data-toggled', 'on').removeClass('bg-lightGreen').addClass('bg-coral');
        $(attendance).find('h4').text('Attendance');
        $(attendance).find('h6').text('Is just a tap away');
      }
    })

    //This allows me to bind and unbind the click event on the table headers
    function tableHeadClick(){
      //This removes all the table rows
      $('.studentID, .studentName, .studentPeriod, .studentGrade, .studentHomework, .studentMessages').parent().remove();
      var orderBy;
      if($(this).attr('data-order')==='firstLast'){
        $(this).attr('data-order', 'lastFirst');
        orderBy = $(this).attr('data-firebase');
        firebase.database().ref('/users/'+uid+'/roster').orderByChild(orderBy).on('child_added', function(snapshot, prevChildKey){
          displayRoster(snapshot, true);
        });       
      }
      else{
        $(this).attr('data-order', 'firstLast');
        orderBy = $(this).attr('data-firebase');
        firebase.database().ref('/users/'+uid+'/roster').orderByChild(orderBy).on('child_added', function(snapshot, prevChildKey){
          displayRoster(snapshot, false);
        });  
      }
    }
    $('th').on('click', tableHeadClick);
    function displayRoster(snapshot, append) {
      var tableRow = $('<tr>');
      if(append){
        $('#roster-body').append(tableRow);
      }
      else{
        $('#roster-body').prepend(tableRow);
      }
      var student = snapshot.val();
      tableRow.append('<td class="studentID">' + student.ID + '</td>');
      tableRow.append('<td class="studentName">' + student.Student + '</td>');
      tableRow.append('<td class="studentPeriod text-center">' + student.Period + '</td>');
      tableRow.append('<td class="studentGrade text-center">' + student.Grade + '</td>');
      tableRow.append('<td class="studentHomework text-center">' + student.Homework + '</td>');
      tableRow.append('<td class="studentMessages text-center">' + student.Messages + '</td>');
    }
  } else {
    // No user is signed in.
    window.location = 'index.html';
  }
});

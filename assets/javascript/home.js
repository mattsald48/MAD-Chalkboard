firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    //User is signed in.
    email = user.email;
    emailVerified = user.emailVerified;
    uid = user.uid;
    profilePhoto = user.photoURL;
    var ref = firebase.database().ref('users/'+uid);
    var refRoster = firebase.database().ref('users/'+uid+'/roster');
    var refGrades = firebase.database().ref('users/'+uid+'/grades');
    var grades = [];
    var names = [];
    var gradesA = 0;
    var gradesB = 0;
    var gradesC = 0;
    var gradesD = 0;
    var gradesF = 0;
    //Firebase to run after all childs have been added
    refRoster.on('child_added', function(snapshot, prevChildKey){
      var student = snapshot.val();
      
      gradeBreakDown(student.Grade);
      function gradeBreakDown(grade){
        if(0<=grade && grade<70){
          gradesF++;
        }
        else if(70<=grade && grade<75){
          gradesD++;
        }
        else if(75<=grade && grade<80){
          gradesC++;
        }
        else if(80<=grade && grade<90){
          gradesB++;
        }
        else{
          gradesA++;
        }
      }
    });
    firebase.database().ref('users/'+uid+'/roster').orderByChild('Grade').on('child_added', function(snapshot, prevChildKey){
      var student = snapshot.val();
      grades.push(Number(student.Grade));
      names.push(student.Student);
    });
    $('#gradesCard').on('click', function(event){
      event.preventDefault();
      if($(this).attr('data-card')==='off'){
        refRoster.limitToLast(1).on('child_added', function(snapshot) {
          //I use this to calculate the total grades
          var sum = grades.reduce((a, b) => a + b, 0);
          var gradesData = {
            total: sum,
            records: grades.length,
            average: Math.round(sum/grades.length),
            a: gradesA,
            b: gradesB,
            c: gradesC,
            d: gradesD,
            f: gradesF
          }
          refGrades.update(gradesData);
          // Load the Visualization API and the corechart package.
          google.charts.load('current', {'packages':['corechart', 'controls']});          
          // Set a callback to run when the Google Visualization API is loaded.
          google.charts.setOnLoadCallback(drawChart)
          // Callback that creates and populates a data table,
          // instantiates the pie chart, passes in the data and
          // draws it.
          function drawChart() {
            // Create the data table.
            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Names');
            data.addColumn('number', 'Grades Filter');
            var arr1 = [];
            for(i=0;i<names.length;i++){
              arr1.push([names[i], grades[i]]);
            }
            data.addRows(
              arr1
            );
            // Create a dashboard.
            var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashboard_div'));
            // Create a range slider, passing some options
            var gradeRangeSlider = new google.visualization.ControlWrapper({
              'controlType': 'NumberRangeFilter',
              'containerId': 'filter_div',
              'options': {
                'filterColumnLabel': 'Grades Filter'
              }
            });
            // Create a pie chart, passing some options
            var pieChart = new google.visualization.ChartWrapper({
              'chartType': 'PieChart',
              'containerId': 'chart_div',
              'options': {
                'backgroundColor': 'transparent',
                pieSliceText: 'value',
                chartArea: {
                  width: '100%',
                  height: '100%',
                },
                'is3D': true,
                legend: {
                  textStyle: {
                    color: 'blue', 
                    fontSize: 16
                  },
                  alignment: 'center',
                  position: 'none'
                }
              }
            });
            // Establish dependencies, declaring that 'filter' drives 'pieChart',
            // so that the pie chart will only display entries that are let through
            // given the chosen slider range.
            dashboard.bind(gradeRangeSlider, pieChart);
            // Draw the dashboard.
            $.when(dashboard.draw(data)).then(rosterHead); 
          }
          function rosterHead(){
            var rosterDiv = $('<div>');
            rosterDiv.addClass('table-responsive').append('<table class="table table-striped">'+
              '<thead><tr id="roster">'+
              '<th class="bg-coral" id="tableID" data-order="lastFirst" data-firebase="ID">ID</th>'+
              '<th class="bg-coral" id="tableName" data-order="firstLast" data-firebase="Student">Name</th>'+
              '<th class="bg-coral" id="tablePeriod" data-order="firstLast" data-firebase="Period" class="text-center">Period</th>'+
              '<th class="bg-coral" id="tableGrade" data-order="firstLast" data-firebase="Grade" class="text-center">Grade</th>'+
              '<th class="bg-coral" id="tableHomework" data-order="firstLast" data-firebase="Homework" class="text-center">Homework</th>'+
              '<th class="bg-coral" id="tableMessages" data-order="firstLast" data-firebase="Messages" class="text-center">Messages</th>'+
              '</tr></thead><tbody id="roster-body"></tbody></table>');
            $('main').append(rosterDiv);
            refRoster.on('child_added', function(snapshot, prevChildKey){
              displayRoster(snapshot, true);
            });
          }
        });  
        $(this).attr('data-card', 'on');
        $(document).on('click', 'th', tableHeadClick);
      }
      else{
        $('#filter_div').empty();
        $('#chart_div').empty();
        $('.table-responsive').remove();
        $(this).attr('data-card', 'off');
        $(document).off('click', 'th', tableHeadClick);

      }
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
    });
  } else {
    // No user is signed in.
    window.location = 'index.html';
  }
});
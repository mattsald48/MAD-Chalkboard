# MAD
### Overview
Created an app that allows teachers to upload assignments, take attendance, and send messages. The app is built with the authentication, database, and storage that firebase provides. The database and storage bucket is kept shallow in order to make queries more efficient by loading only the data that is necessary. Authenthication is used to maintain persistance by saving user data by their unique User Identification (uid) that firebase provides.
### Instructions
1. Sign-Up/Sign-In
* E-mail Verification
  * E-mail verification is disabled in order to produce the Minimum Viable Product (mvp).
* Sign-up
  * Directed to the settings page
* Sign-in
  * Directed to the dashboard page
2. On Roster tab and click on the 'Add a class'
* Upload csv file, [roster](./roster.csv) provided
  * Most schools already have csv files with at least student id's and names
* Sort data by id, name, messages, etc.
3. On Roster tab click on 'Take attendance'
* Check off students if they're tardy/present
  * If nothing is checked the student will be presumed absent
  * Either submit by clicking on the 'Submit' button below the table or
  * Exit the attendance screen by clicking on 'Exit'
4. On Homework tab click on Add File
* Can upload pdfs, docs, etc. 
  * Uploads can be downloaded
  * Viewed on seperate tab
  * Messages (under construction)
5. On Messages tab
* Compose a message
  * Send a message to a particular student
* View sent messages
  * View all messages or messages to particular students
6. On Dashboard tab
* Click on Grades
  * Allows for filtering using the Google Charts API
* Attendance 
  * Disabled
7. Signout 
---
### How It Works 
1. Sign-Up/Sign-In
* Firebase authentication rules:
  * Read, only if client has been authenticated
  * Write, only on users uid
2. Roster: Add a Class
* papaParse.js 
  * Local csv files are opened with FileReader
  * Delimited data is parsed out of said file
* App (in house javascript, see rosterParser.js)
  * Declared a variable, columns, as the 0 index of the results array obtained from papaParse.js
  * Declared a variable, rows, as the rest of the results array
  * Reduce rows by the particular result of the column and mapped rows into a variable called results
  * Before sending the results to firebase the data is reduced again by the student id
   * To keep data shallow
  * Data is pushed to firebase
  * Table gets made
3. Homework: Add a file
  * Uploads are made using the input file type
  * Client uploads an image and said image gets sent to firebase
  * Download
    * Firebase generates a specific download url
    * Gets set to the on click 'download' button
  * View 
    * Firebase generates a url to view file
    * Gets set to the on click 'view' button
4. Dashboard: Grades
  * Pull grades from each student found in the roster node on firebase database
  * Use google charts api to render a pie chart and filter slider
---
### Issues
* Messages are not viewable by students (users are not linked)
  * Need to set up administrator (only possible using node without allowing malicious changing of roles)
* Assumption is made that schools will have csv files readily available 
    
  

  

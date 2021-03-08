// "use strict";
// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start("#firebaseui-auth-container", {
  signInOptions: [
    // firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // {
    //       provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //       requireDisplayName: false
    //     }
    // List of OAuth providers supported.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //optional display name
    // provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // requireDisplayName: false
  ],
  // Other config options...
});

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return false;
    },
    uiShown: function () {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById("loader").style.display = "none";
    },
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  signInSuccessUrl: "",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: "<your-tos-url>",
  // Privacy policy url.
  privacyPolicyUrl: "<your-privacy-policy-url>",
};

// The start method will wait until the DOM is loaded.
ui.start("#firebaseui-auth-container", uiConfig);

var signin = document.getElementById("firebaseui-auth-container");
var authContainer = document.getElementById("auth-container");
var logout = document.getElementById("logoutbtn");
// var uid;
var uid;
var userRef;
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const timer = document.getElementById("timer");
const projectSelector = document.getElementById("project");
const projectSelect = document.getElementById("projectselect");
const projectEntry = document.getElementById("projectentry");
const hours = document.getElementById("hours-table");
const oldHoursTable = document.getElementById("oldhours-table");
const enterHoursBtn = document.getElementById("enterhoursbtn");
const keyBox = document.getElementById("key");
var db = firebase.database();
var uninvoicedRef = db.ref(userRef + "/uninvoiced");
var invoicedRef = db.ref(userRef + "/invoiced");
var activepid, activeProject, activeClient;
var activeChallenges = [];
var activeChallenge = [];
var projectObj = Object;
var uninvoicedSnapshot, invoicedSnapshot;
timer.addEventListener("click", startTimer);
var projectmodal = document.getElementById("projectmodal");
var projectbtn = document.getElementById("projectbtn");
var challengebtn = document.getElementById("challenge-btn");
var challengeAcceptedbtn = document.getElementById("challenge-accepted-btn");
var challengeModal = document.getElementById("challenge-modal");
var editingKey;
var starttime;
var hoursArray;
var active = false;
//AUTH CHECK
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    authContainer.style.display = "none";
    console.log(user.email, "logged in");
    uid = user.uid;
    userRef = "users/" + uid;
    hide(signin);
    // logout.style.display = "block";
    show(logout);
    liveProjects();
    liveHours();
    liveInvoices();
    db.ref(userRef + "/state").on("value", function (snapshot) {
      try {
        // console.log("trying to read /state");
        active = snapshot.val().active;
        activepid = snapshot.val().pid;
        starttime = snapshot.val().starttime;
        console.log("activePid: ", activepid);
        // console.log("PROJECTactive: ", projectObj[activepid]);
        // console.log("PROJECTactive: ", projectObj[activepid].projectName);
        activeProject = projectObj[activepid].projectName;
        activeChallenges = snapshot.val().challenges
          ? snapshot.val().challenges
          : [];
        // activeClient = snapshot.val().client;
        console.log(
          "Updating state to:",
          "\npid: ",
          activepid,
          "\nProject: ",
          activeProject,
          "\nClient: ",
          activeClient,
          "\nActive?:",
          active
        );
        projectbtn.innerHTML = activeProject
          ? "Project: " + activeProject
          : "Select Project...";
        active
          ? projectbtn.classList.add("inactive")
          : projectbtn.classList.remove("inactive");
        starttime = snapshot.val().starttime;
      } catch (err) {
        console.log("couldn't reach active, creating it now...", err);
        db.ref(userRef + "/state").set({ active: false });
      }
    });
    show(timer);
    show(projectbtn);
  } else {
    // No user is signed in.
    // signin.style.display = "block";
    hide(logout);
    show(signin);
    show(authContainer);
    hide(timer);
    hide(projectbtn);
    console.log("no user logged in");
  }
});

logout.onclick = function () {
  // if (confirm("are you sure?")) {
  firebase
    .auth()
    .signOut()
    .then(function () {
      show(signin);
      show(authContainer);
      hide(timer);
      hours.innerHTML = "";
      console.log("logged out");
    })
    .catch(function (error) {
      console.log(error);
    });
  // }
};

//INITIALIZE HOURS TABLE
function liveHours() {
  // console.log("1");
  db.ref(userRef + "/uninvoiced").on("value", function (snapshot) {
    uninvoicedSnapshot = snapshot;
    hoursArray = [];
    hoursHeaders = ["Date", "Client", "Project", "Hours", "key"];
    // var entries =
    // "<tr><td>Date</td><td>Client</td><td>Project</td><td>Hours</td></tr>";
    hours.innerHTML = "";
    snapshot.forEach(function (entry) {
      var rowArray = [];
      var cell = entry.val();
      var date = new Date(cell.date);
      rowArray.push(cell.date);
      if (cell.pid !== undefined) {
        var pid = cell.pid;
        var project = projectObj[pid].projectName;
        var client = projectObj[pid].client;
        rowArray.push(client);
        rowArray.push(project);
      } else {
        rowArray.push(cell.client + " (dated entry)");
        rowArray.push(cell.project + " (dated entry)");
      }
      rowArray.push((cell.hours / 1000 / 60 / 60).toFixed(2));
      rowArray.push(entry.key);
      hoursArray.push(rowArray);
      // console.log(rowArray, hoursArray);
      //OLD HOURS TABLE
      // if (cell.hours) {
      //   entries += "<tr>";
      //   entries += "<td>" + cell.date + "<td>";
      //   entries += "<td>" + cell.project + "<td>";
      //   var time = (Math.round((cell.hours / 1000 / 60 / 60) * 4) / 4).toFixed(
      //     2
      //   );
      //   entries += "<td>" + time + "<td>";
      //   entries += '<td style="display:none">' + entry.key + "<td>";
      //   entries +=
      //     '<td> <button id="' +
      //     entry.key +
      //     '" onClick="editEntry(this.id)"> ✎ </button></td> <td><button id="' +
      //     entry.key +
      //     '" onClick="deleteEntry(this.id)"> X </button> </td>';
      //   entries += "</tr>";
      // }
    });
    hoursArray.reverse();
    hoursArray.unshift(hoursHeaders);
    // console.log(hoursArray);
    for (var i = 0; i < hoursArray.length; i++) {
      var row = document.createElement("tr");
      row.innerHTML +=
        '<td><input type="checkbox" data-entrykey="' +
        hoursArray[i][4] +
        '"></td>';
      for (var j = 0; j < hoursArray[0].length + 1; j++) {
        var cell = document.createElement("td");
        cell.innerHTML += hoursArray[i][j];
        if (j === hoursArray[i].length - 1) {
          cell.style.display = "none";
        }
        if (j === hoursArray[i].length) {
          cell.innerHTML =
            '<button id="' +
            hoursArray[i][4] +
            '" onClick="editEntry(this.id)"> ✎ </button><button id="' +
            hoursArray[i][4] +
            '" onClick="deleteEntry(this.id)"> X </button>';
        }
        row.appendChild(cell);
      }
      hours.appendChild(row);
    }
    console.log("hours innerHTML:", hours);
    // oldHoursTable.innerHTML = entries;
  });
}
//TICKING TIMER
var x = setInterval(() => {
  if (starttime !== undefined) {
    var now = new Date().getTime();
    var distance = now - starttime;
    var hours = twoDigits(
      Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    );
    var minutes = twoDigits(
      Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    );
    var seconds = twoDigits(Math.floor((distance % (1000 * 60)) / 1000));
    timer.innerHTML =
      '<span id="timerstop">' +
      hours +
      ":" +
      minutes +
      ":" +
      seconds +
      "</span>";
  } else {
    timer.innerHTML = "START";
  }
}, 1000);

//START/STOP TIMER FUNCTIONS
function startTimer() {
  console.log("running startTimer");
  db.ref(userRef + "/state")
    .once("value")
    .then(function (snapshot) {
      if (activepid) {
        // console.log("activeclient: ", activeClient);
        if (!snapshot.exists() || !snapshot.val().active) {
          /*THEN START TIMER*/ timer.innerHTML = "00:00:00";
          const currentTime = new Date();
          var newKey = db.ref(userRef).push().key;
          // console.log("2");
          // activeChallenge = [activeChallenges[activeChallenges.length - 1]];
          db.ref(userRef + "/state").set({
            active: true,
            key: newKey,
            starttime: {
              ".sv": "timestamp",
            },
            pid: activepid,
            challenges: activeChallenge,
            // client: activeClient,
          });
          // db.ref(userRef + "/uninvoiced" + "/" + newKey).set({
          //   starttime: {
          //     ".sv": "timestamp",
          //   },
          //   stoptime: null,
          //   project: activepid,
          // });
          console.log("startTimer running for project:", activepid);
        } /*THEN STOP TIMER*/ else {
          var key = snapshot.val().key;
          var stoptime = new Date();
          var starttime = snapshot.val().starttime;
          var hours = stoptime - starttime;
          var pid = activepid;
          var challenges = activeChallenges;
          // var client = activeClient;
          var date =
            new Date(starttime).getFullYear() +
            "-" +
            twoDigits(new Date(starttime).getMonth() + 1) +
            "-" +
            twoDigits(new Date(starttime).getDate());
          db.ref(userRef + "/state").update({
            active: false,
            key: null,
            starttime: null,
            challenges: null,
          });
          db.ref(userRef + "/uninvoiced" + "/" + key).set({
            starttime: starttime,
            stoptime: {
              ".sv": "timestamp",
            },
            hours: hours,
            date: date,
            pid: pid,
            challenges: challenges,
            // client: client,
          });
        }
      } else {
        console.log("no project selected");
      }
    });
}
// ENTER HOURS MODAL
var enterhoursmodal = document.getElementById("enterhours");
var enterhoursbtn = document.getElementById("enterhoursbtn");
var span = document.getElementsByClassName("close")[0];
var editmodal = document.getElementById("edit");
// var editbtn = document.getElementById("editbtn");
var editspan = document.getElementsByClassName("close")[1];
var enterTitle = document.getElementById("enter-title");
var editTitle = document.getElementById("edit-title");
var oldHours, oldDate, oldProject, oldpid;
enterhoursbtn.onclick = function () {
  hoursEntry.value = "";
  dateEntry.value = "";
  projectEntry.value = "";
  keyBox.value = "";
  enterhoursmodal.style.display = "block";
  hide(editTitle);
};
span.onclick = function () {
  console.log("closing...");
  hide(enterhoursmodal);
};
window.onclick = function (event) {
  if (event.target == enterhoursmodal) {
    hide(enterhoursmodal);
  } else if (event.target == projectmodal) {
    hide(projectmodal);
    hide(addprojectinput);
    hide(addclientinput);
    hide(addproject);
  } else if (event.target == challengeModal) {
    hide(challengeModal);
  } else if (event.target == bulkEditModal) {
    hide(bulkEditModal);
  } else if (event.target == invoiceModal) {
    hide(invoiceModal);
  }
};

// function hides() {
//     var modals = document.getElementsByClassName('modal');
//     console.log(modals);
//     modals.forEach(modal => hide(modal))m
//     }

function hide(element) {
  element.style.display = "none";
}

function show(element) {
  element.style.display = "block";
}
//PROJECT SCREEN
projectbtn.onclick = function () {
  if (!active) {
    console.log("choosing project");
    show(projectmodal);
  }
};
//LIVE PROJECT INFO
function liveProjects() {
  db.ref(userRef + "/projects").on("value", function (snapshot) {
    var projectsHTML = "";
    projectObj = snapshot.val();
    // activeProject = projectObj
    console.log("projectObj:VVVVVVVV");
    console.log(projectObj);
    var projectListLength = projectEntry.options.length;
    for (i = projectListLength - 1; i >= 0; i--) {
      projectEntry.options[i] = null;
    }
    if (snapshot.val()) {
      // console.log(snapshot.val());
      snapshot.forEach(function (projectKey) {
        // console.log('HERE');
        // console.log(projectKey.key);
        var pid = projectKey.key;
        var projectName = projectKey.val().projectName;
        var clientName = projectKey.val().client;
        // console.log(
        //   "Found project: " + projectName,
        //   "with client: ".clientName
        // );
        var option = document.createElement("option");
        option.value = pid;
        option.textContent = projectName + " for " + clientName;
        option.setAttribute("data-client", clientName);
        option.setAttribute("data-project", projectName);
        var optionb = option.cloneNode(true);
        var optionc = option.cloneNode(true);
        // projectEntry.appendChild(option).setAttribute('data-client', clientName);
        // projectEntry.appendChild(option).setAttribute('data-project', projectName);
        projectEntry.appendChild(option);
        // var optionb = document.createElement("option");
        // optionb.value = pid;
        // optionb.textContent = projectName + ' for ' + clientName;
        // optionb.setAttribute('data-client', clientName)
        // optionb.setAttribute('data-project', projectName);
        projectEdit.appendChild(optionb);
        projectToInvoice.appendChild(optionc);
        var dataClient = "'data-client'";
        projectsHTML +=
          '<button id="' +
          pid +
          '" data-client="' +
          clientName +
          '" class="projectselectbtns" onclick="selectProject(this.id);">' +
          projectName +
          '<br/><p style="font-size: 1vw;"> for ' +
          clientName +
          "</p>" +
          "</button>" +
          '<button id="' +
          projectKey.key +
          '" onclick="deleteProject(this.id)"">X</button><br>';
      });
      // console.log(projectsHTML);
      projectlist.innerHTML = projectsHTML;
    } else {
      projectlist.innerHTML = "Add a new Project";
    }
  });
}

function selectProject(pid) {
  activepid = pid;
  activeProject = projectObj[pid].projectName;
  activeClient = projectObj[pid].client;
  console.log(
    "Selected new active project: ",
    pid,
    activeProject,
    activeClient
  );
  db.ref(userRef + "/state").update({
    pid: pid,
  });
  console.log("activepid: ", activepid, activeProject, activeClient);
  hide(projectmodal);
}

function deleteProject(projectKey) {
  if (confirm("Delete Project?")) {
    db.ref(userRef + "/projects/" + projectKey).once("value", function (snap) {
      db.ref(userRef + "/projects-deleted/" + projectKey).set(
        snap.val(),
        function (error) {
          if (!error) {
            db.ref(userRef + "/projects" + "/" + projectKey).remove();
          } else if (typeof console !== "undefined" && console.error) {
            console.error(error);
          }
        }
      );
    });
  } else {
    //Do Nothing
    console.log("Not Deleted");
  }
}

//ADD PROJECT
var addprojectinput = document.getElementById("addprojectinput");
var addclientinput = document.getElementById("addclientinput");
var addprojectbtn = document.getElementById("addprojectbtn");
var addproject = document.getElementById("addproject");
addprojectbtn.onclick = function () {
  addprojectinput.style.display = "block";
  addclientinput.style.display = "block";
  addproject.style.display = "block";
  addprojectinput.value = "";
  addclientinput.value = "";
};
addproject.onclick = function () {
  if (/* it doesnt exist already && */ addprojectinput.value !== "") {
    db.ref(userRef + "/projects").push({
      projectName: addprojectinput.value,
      client: addclientinput.value,
    });
  }
  hide(addprojectinput);
  hide(addclientinput);
  hide(addproject);
};

var challengeTextArea = document.getElementById("challenge-input");
//CHALLENGE Screen
challengebtn.onclick = function () {
  console.log("opening challenge modal");

  document.getElementById("challenge-input").value = "";
  show(challengeModal);

  challengeTextArea.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      challengeAcceptedbtn.click();
    }
  });
};

challengeAcceptedbtn.onclick = () => {
  console.log("Challenge Accepted!!");
  hide(challengeModal);
  // if(challengeArr){

  var challengeInput = challengeTextArea.value;
  // }
  challengebtn.innerHTML = challengeInput
    ? challengeInput
    : "What's the current challenge?";
  // challengeArr.push(challengeInput);
  activeChallenge = [challengeInput];
  activeChallenges.push(challengeInput);
  active
    ? db.ref(userRef + "/state").update({ challenges: activeChallenges })
    : console.log("not active");
  console.log(activeChallenges);
  // db.console.log("Challenges", activeChallenges);
};

//SUBMIT HOURS
var submit = document.getElementById("submit");
var dateEntry = document.getElementById("dateentry");
var hoursEntry = document.getElementById("hoursentry");
submit.onclick = function () {
  console.log("Submitting with key(undefined if new entry): ", editingKey);
  const pid = projectEntry.options[projectEntry.selectedIndex].value;
  console.log("HERE", pid);
  const project = projectEntry.options[projectEntry.selectedIndex].getAttribute(
    "data-project"
  );
  const client = projectEntry.options[projectEntry.selectedIndex].getAttribute(
    "data-client"
  );
  // const client = "clientEntry.options[]"
  const date = dateEntry.value;
  const hours = hoursEntry.value * 60 * 60 * 1000;
  // const key = keyBox.value;
  if (!editingKey) {
    db.ref(userRef + "/uninvoiced").push({
      submittedtime: {
        ".sv": "timestamp",
      },
      pid: pid,
      // client: client,
      hours: hours,
      date: date,
    });
  } else {
    console.log("updating old entry", oldpid);
    db.ref(userRef + "/uninvoiced" + "/" + editingKey).set({
      history: {
        hours: toMS(oldHours),
        date: oldDate,
        pid: oldpid,
        // client: oldClient
      },
      hours: hours,
      date: date,
      pid: pid,
      // client: client
    });
    editingKey = undefined;
  }
  hide(enterhoursmodal);
};
//EDIT MODAL

var projectEdit = document.getElementById("project-edit");
var bulkEditBtn = document.getElementById("bulk-edit-btn");
var bulkEditModal = document.getElementById("bulk-edit-modal");
var submitBulkEdit = document.getElementById("submit-bulk-edit");
var bulkDeleteBtn = document.getElementById("bulk-delete-btn");

bulkDeleteBtn.onclick = () => {
  var bulkEditKeys = {};
  var checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((checkbox) => {
    var entrykey = checkbox.dataset.entrykey;
    if (checkbox.checked && entrykey) {
      var path = entrykey;
      bulkEditKeys[path] = null;
    }
  });
  var numberOfEntries = Object.keys(bulkEditKeys).length;
  if (numberOfEntries > 1) {
    var deleteConfirmText = "Delete " + numberOfEntries + " entries?";
  } else if (numberOfEntries == 1 && checkboxes[0].checked) {
    return;
  } else if (numberOfEntries == 1) {
    var deleteConfirmText = "Delete Entry?";
  }
  if (confirm(deleteConfirmText)) {
    console.log("deleting:", bulkEditKeys);
    //make object with only checked entries and their new pid
    // COPY to DELETED
    var uninvoicedObj = {};
    db.ref(userRef + "/uninvoiced").once("value", function (snap) {
      console.log("entries obj:", snap.val());
      Object.keys(bulkEditKeys).forEach((key) => {
        console.log("key to move: ", key, snap.val()[key]);
        // console.log(key.val());
        var deletedEntry = snap.val()[key];
        deletedEntry.deleted = {
          ".sv": "timestamp",
        };
        // deletedEntry[deleted] = newDate();
        uninvoicedObj[key] = deletedEntry;
      });
      console.log("uninvoicedObj: ", uninvoicedObj);
      db.ref(userRef + "/deleted").update(uninvoicedObj);
      console.log("did it work?");
    });
    // REMOVE from UNINVOICED
    db.ref(userRef + "/uninvoiced").update(bulkEditKeys);
  } else {
    console.log("bulk delete cancelled");
  }
};

bulkEditBtn.onclick = () => {
  show(bulkEditModal);
};

submitBulkEdit.onclick = () => {
  var bulkEditKeys = {};
  const pid = projectEdit.options[projectEdit.selectedIndex].value;
  var checkboxes = document.querySelectorAll("input[type=checkbox]");
  checkboxes.forEach((checkbox) => {
    var entrykey = checkbox.dataset.entrykey;
    if (checkbox.checked && entrykey) {
      // console.log(checkbox.dataset.entrykey);
      // console.log(bulkEditKeys, pid);
      var path = entrykey + "/pid";
      bulkEditKeys[path] = pid;
    }
  });
  console.log("updating:", bulkEditKeys);
  //make object with only checked entries and their new pid
  db.ref(userRef + "/uninvoiced").update(bulkEditKeys);
  hide(bulkEditModal);
};

function editEntry(key) {
  console.log("editing: " + key);
  enterhoursmodal.style.display = "block";
  hide(enterTitle);

  db.ref(userRef + "/uninvoiced").once("value", function (snapshot) {
    try {
      oldHours = toHours(snapshot.val()[key].hours);
    } catch {
      console.log("No old hours");
      oldHours = "NA";
    }
    try {
      oldDate = snapshot.val()[key].date;
    } catch {
      console.log("No old date");
      oldDate = "NA";
    }
    try {
      oldProject = snapshot.val()[key].project;
    } catch {
      console.log("No old project");
      oldProject = "NA";
    }

    if (snapshot.val()[key].pid != undefined) {
      oldpid = snapshot.val()[key].pid;
      console.log(snapshot.val()[key].pid, "set old pid");
    } else {
      oldpid = "NA";
    }
    try {
      oldClient = snapshot.val()[key].client;
    } catch {
      console.log("No old client");
      oldClient = "NA";
    }
    console.log(
      key,
      ": ",
      oldHours,
      ", ",
      oldDate,
      ", ",
      oldProject,
      ", ",
      oldpid
    );
    hoursEntry.value = oldHours;
    dateEntry.value = oldDate;
    projectEntry.value = oldpid;
    keyBox.value = key;
    editingKey = key;
    console.log(keyBox.value);
  });
}

function deleteEntry(key) {
  if (confirm("Are you sure you want to delete?")) {
    console.log("deleting: " + key);
    db.ref(userRef + "/uninvoiced" + "/" + key).once(
      "value",
      function (snapshot) {
        // oldHours = toHours(snapshot.val()[key].hours);
        // oldDate = snapshot.val()[key].date;
        // oldProject = snapshot.val()[key].project;
        // console.log(key, ': ', oldHours, ', ', oldDate, ', ', oldProject);
        db.ref(userRef + "/deleted/" + key).set(
          snapshot.val(),
          function (error) {
            if (!error) {
              db.ref(userRef + "/deleted/" + key).update({
                deleted: {
                  ".sv": "timestamp",
                },
              });
              db.ref(userRef + "/uninvoiced" + "/" + key).remove();
            } else if (typeof console !== "undefined" && console.error) {
              console.error(error);
            }
          }
        );
      }
    );
  } else {
    //Do Nothing
    console.log("Delete Canceled");
  }
}
//DOWNLOAD TRIGGER
var invoicebtn = document.getElementById("invoicebtn");
var invoiceModal = document.getElementById("invoice-modal");
invoicebtn.onclick = function () {
  // if (confirm("Invoice selected entries?")) {
  // console.log("invoicing....");
  show(invoiceModal);
  // var itemsFormatted;
  // }
};

var invoiceProjectBtn = document.getElementById("invoice-project-btn");
invoiceProjectBtn.onclick = function () {
  console.log("invoicing....");
  collectEntries();
};

// show(invoiceModal);
var projectToInvoice = document.getElementById("project-to-invoice");
var fromDate = document.getElementById("from-date");
var toDate = document.getElementById("to-date");

//collect Entries
function collectEntries() {
  var selectedPID = projectToInvoice.value;
  // var from = fromDate.value;
  // var to = toDate.value;
  // console.log(selectedPID, "from to: ", from, to);
  var keysToInvoice = {};
  // console.log(.5);
  var allKeys = Object.keys(uninvoicedSnapshot.val());
  // console.log(allKeys);
  allKeys.forEach((entry) => {
    // console.log(entry.val().pid, selectedPID);
    // console.log(uninvoicedSnapshot.val()[entry]);
    if (uninvoicedSnapshot.val()[entry].pid == selectedPID) {
      // console.log(entry.val()[key]);
      keysToInvoice[entry] = uninvoicedSnapshot.val()[entry];
      // console.log(entry.val());
    }
  });

  // console.log(keysToInvoice);
  // var checkboxes = document.querySelectorAll("input[type=checkbox]");
  // checkboxes.forEach((checkbox) => {
  //   var entrykey = checkbox.dataset.entrykey;
  //   if ( entrykey ) {
  //     var path = entrykey;
  //     keysToInvoice[path] = null;
  //   }
  // });
  var numberOfEntries = Object.keys(keysToInvoice).length;
  var confirmText = "No time available to invoice";
  if (numberOfEntries > 1) {
    confirmText = "Invoice " + numberOfEntries + " entries?";
  } else if (numberOfEntries == 1) {
    confirmText = "Invoice Entry?";
  }
  if (confirm(confirmText)) {
    // console.log("Invoicing:", keysToInvoice);

    //make object with only checked entries and their new pid
    //SEPARATE to MULTIPLE OBJs for EACH PROJECT

    // COPY to INVOICED
    var uninvoicedObj = {};
    var entriesObj = {};
    db.ref(userRef + "/uninvoiced").once("value", function (snap) {
      // console.log("entries obj:", snap.val());
      // console.log(keysToInvoice);
      var totaltime = 0;
      Object.keys(keysToInvoice).forEach((key) => {
        // console.log("key to move: ", key, snap.val()[key]);
        // console.log(key.val());
        var invoicedEntry = snap.val()[key];
        // var hours = snap.key.hours
        totaltime += snap.val()[key]["hours"];
        // console.log(invoicedEntry);
        // invoicedEntry.invoiced = {
        //   ".sv": "timestamp",
        // };
        // console.log(uninvoicedObj);
        entriesObj[key] = invoicedEntry;
        // console.log("uninvoicedObj = ", uninvoicedObj);
      });
      // console.log(totaltime);
      // console.log("uninvoicedObj: ", uninvoicedObj);
      var invoiceTimestamp = new Date();
      uninvoicedObj["pid"] = selectedPID;
      uninvoicedObj["totaltime"] = totaltime;
      // uninvoicedObj["date"] = invoiceTimestamp;
      uninvoicedObj["entries"] = entriesObj;
      uninvoicedObj["date"] = {
        ".sv": "timestamp",
      };
      // uninvoicedObj[date] = date;
      // console.log("uninvoicedObj: ", uninvoicedObj);
      console.log("invoice timestamp: ", invoiceTimestamp);
      db.ref(`${userRef}/invoiced`).push(uninvoicedObj);
      console.log("uninvoicedObj:VVVVVVVVVVV");
      console.log(uninvoicedObj);
      var entriesArray = Object.values(uninvoicedObj["entries"]);
      // var entriesArray;
      // for (key in uninvoicedObj) {
      //   console.log(uninvoicedObj.key);
      //   entriesArray.push(uninvoicedObj.key);
      // }
      console.log(entriesArray);
      itemsNotFormatted = entriesArray;
      var itemsFormatted = formatData(itemsNotFormatted);
      console.log(itemsFormatted);
      //CREATE file TITLE
      // fileTitle = projectObj.pid.projectName + 'for' + projectObj.pid.client
      exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
    });
    // REMOVE from UNINVOICED
    Object.keys(keysToInvoice).forEach((key) => {
      db.ref(userRef + "/uninvoiced/" + key).remove();
    });
  } else {
    console.log("invoice cancelled");
  }
}

//create CSV
function convertToCSV(objArray) {
  // console.log(objArray);
  var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
  var str = "";

  for (var i = 0; i < array.length; i++) {
    var line = "";
    for (var index in array[i]) {
      if (line != "") line += ",";

      line += array[i][index];
    }

    str += line + "\r\n";
  }

  // console.log(str);
  return str;
}

function exportCSVFile(headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  var jsonObject = JSON.stringify(items);

  var csv = this.convertToCSV(jsonObject);

  var exportedFilenmae = fileTitle + ".csv" || "export.csv";

  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilenmae);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
  // console.log("csv downloaded I think");
  //clear itemsFormatted
  itemsFormatted = [];
  hide(invoiceModal);
}

var headers = {
  // model: "Phone Model".replace(/,/g, ""), // remove commas to avoid errors
  // chargers: "Chargers",
  // cases: "Cases",
  // earphones: "Earphones",
  date: "Date",
  hours: "Hours",
  starttime: "Start Time",
  stoptime: "Stop Time",
  // notes: "notes",
};

// itemsNotFormatted = [
//   {
//     model: "Samsung S7",
//     chargers: "55",
//     cases: "56",
//     earphones: "57",
//     scratched: "2",
//   },
//   {
//     model: "Pixel XL",
//     chargers: "77",
//     cases: "78",
//     earphones: "79",
//     scratched: "4",
//   },
//   {
//     model: "iPhone 7",
//     chargers: "88",
//     cases: "89",
//     earphones: "90",
//     scratched: "6",
//   },
// ];

// format the data
function formatData(data) {
  var itemsFormatted = [];
  itemsNotFormatted.forEach((item) => {
    itemsFormatted.push({
      // model: item.model.replace(/,/g, ""), // remove commas to avoid errors,
      // chargers: item.chargers,
      // cases: item.cases,
      // earphones: item.earphones,
      date: item.date,
      hours: toHours(item.hours),
      starttime: item.starttime ? timeFromUnix(item.starttime) : "",
      stoptime: item.stoptime ? timeFromUnix(item.stoptime) : "",
      // notes: item.notes,
    });
  });
  console.log(itemsFormatted);
  return itemsFormatted;
}

function timeFromUnix(unix) {
  var date = new Date(unix);
  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var time = hours + ":" + minutes;
  return time;
}

var fileTitle = "Invoice"; // or 'Timestamp + Client + Project'

function twoDigits(time) {
  return (time < 10 ? "0" : "") + time;
}

function toHours(ms) {
  return (Math.round((ms / 1000 / 60 / 60) * 4) / 4).toFixed(2);
}

function toMS(hours) {
  return hours * 1000 * 60 * 60;
}

var reportSection = document.getElementById("report");
var openReport = document.getElementById("my-time");
let report_Style_Display = window.getComputedStyle(reportSection).display;
function openReporting() {
  (reportSection.style.display || report_Style_Display) === "none"
    ? show(reportSection)
    : hide(reportSection);
}

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks, activeTab;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    if (tabcontent[i].style.display == "block") {
      activeTab = tabcontent[i].getAttribute("id");
      // console.log(activeTab);
    }
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  console.log(tabName, activeTab, activeTab == tabName);
  if (tabName != activeTab) {
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }
}

//invoices tab
var invoicesTable = document.getElementById("invoices-table");

function liveInvoices() {
  console.log("liveInvoices running");
  db.ref(userRef + "/invoiced").on("value", function (snapshot) {
    invoicedSnapshot = snapshot;
    invoicesArray = [];
    // hoursHeaders = ["Date", "Client", "Project", "Hours", "Paid", "key"];
    var invoicesHeaders = [
      "Invoice Date",
      "Project",
      "Client",
      "Hours",
      "Status",
      "UNDO",
    ];
    // var entries =
    // "<tr><td>Date</td><td>Client</td><td>Project</td><td>Hours</td></tr>";
    invoicesTable.innerHTML = "";
    snapshot.forEach(function (entry) {
      var rowArray = [];
      var cell = entry.val();
      // console.log(cell.date);
      var invoiceDate = formatDate(cell.date);
      // invoiceDate = ('0' + (1 + invoiceDate.getMonth())).slice(-2) + '/' + ('0' + invoiceDate.getDay()).slice(-2) + '/' + String(invoiceDate.getFullYear()) + ' ' + ('0' + invoiceDate.getHours()).slice(-2) + ':' + ('0' + invoiceDate.getMinutes()).slice(-2)
      // console.log(invoiceDate);
      rowArray.push(invoiceDate);
      var invoicedHours = cell.totaltime
        ? (cell.totaltime / 1000 / 60 / 60).toFixed(2)
        : "NA";
      var paid = cell.paid;
      if (cell.pid !== undefined) {
        var pid = cell.pid;
        var project = projectObj[pid].projectName;
        var client = projectObj[pid].client;
        rowArray.push(client);
        rowArray.push(project);
      } else {
        rowArray.push(cell.client + " (dated entry)");
        rowArray.push(cell.project + " (dated entry)");
      }
      rowArray.push(invoicedHours);
      if (paid) {
        rowArray.push("PAID");
      } else {
        rowArray.push("Due");
      }
      // console.log(invoicedHours);
      rowArray.push(entry.key);
      invoicesArray.push(rowArray);
      // console.log(rowArray, hoursArray);
      //OLD HOURS TABLE
      // if (cell.hours) {
      //   entries += "<tr>";
      //   entries += "<td>" + cell.date + "<td>";
      //   entries += "<td>" + cell.project + "<td>";
      //   var time = (Math.round((cell.hours / 1000 / 60 / 60) * 4) / 4).toFixed(
      //     2
      //   );
      //   entries += "<td>" + time + "<td>";
      //   entries += '<td style="display:none">' + entry.key + "<td>";
      //   entries +=
      //     '<td> <button id="' +
      //     entry.key +
      //     '" onClick="editEntry(this.id)"> ✎ </button></td> <td><button id="' +
      //     entry.key +
      //     '" onClick="deleteEntry(this.id)"> X </button> </td>';
      //   entries += "</tr>";
      // }
    });
    invoicesArray.sort();
    invoicesArray.unshift(invoicesHeaders);
    // console.log(invoicesArray);
    for (var i = 0; i < invoicesArray.length; i++) {
      var row = document.createElement("tr");
      // console.log(invoicesArray[i]);
      if (invoicesArray[i][4] == "PAID") {
        row.className = "paid-invoice";
      }
      // row.innerHTML +=
      //   '<td><input type="checkbox" data-entrykey="' +
      //   invoicesArray[i][4] +
      //   '"></td>';
      for (var j = 0; j < invoicesArray[0].length + 1; j++) {
        var cell = document.createElement("td");
        cell.innerHTML += invoicesArray[i][j];
        if (j === invoicesArray[i].length - 1) {
          cell.style.display = "none";
        }
        if (j === invoicesArray[i].length) {
          cell.innerHTML =
            '<button class="invoice-button undo-invoice" id="' +
            invoicesArray[i][5] +
            '" onClick="undoInvoice(this.id)"> UNDO </button>' +
            '<button class="invoice-button mark-paid" id="' +
            invoicesArray[i][5] +
            '" onClick="togglePaid(this.id)">Mark Paid</button>';
        }
        row.appendChild(cell);
      }
      invoicesTable.appendChild(row);
    }
    // console.log("invoices innerHTML:", invoicesTable);
    // oldHoursTable.innerHTML = entries;
  });
}

function undoInvoice(id) {
  var invoiceToUndoRef = invoicedRef.child("id");
  console.log("undoing Invoice" + id);
  // moveFBRecord(invoiceToUndoRef, uninvoicedRef);
  db.ref(userRef + "/invoiced/" + id).once("value", function (snap) {
    console.log(snap.val().entries);
    db.ref(userRef + "/uninvoiced").update(
      snap.val().entries,
      function (error) {
        if (!error) {
          db.ref(userRef + "/invoiced/" + id).remove();
        } else if (typeof console !== "undefined" && console.error) {
          console.error(error);
        }
      }
    );
  });
}

function togglePaid(id) {
  db.ref(userRef + "/invoiced/" + id).once("value", function (snap) {
    if (snap.val() == undefined || snap.val().paid == false) {
      if (confirm('Are you sure you want to mark this invoice as "Paid"?')) {
        db.ref(userRef + "/invoiced/" + id).update({ paid: true });
      }
    } else {
      if (
        confirm('Are you sure you want to mark this invoice as "Not Paid"?')
      ) {
        db.ref(userRef + "/invoiced/" + id).update({ paid: false });
      }
    }
  });
}

// function moveFBRecord(oldRef, newRef) {
//   console.log("running moveFBRecord");
//   oldRef.once("value", function (snap) {
//     console.log(snap.val());
//     newRef.update(snap.val(), function (error) {
//       if (!error) {
//         oldRef.remove();
//       } else if (typeof console !== "undefined" && console.error) {
//         console.error(error);
//       }
//     });
//   });
// }

var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(date) {
  var d = new Date(date);
  var month = ("0" + (d.getMonth() + 1)).slice(-2);
  var day = ("0" + d.getDate()).slice(-2);
  var year = d.getFullYear();
  var hours = ("0" + d.getHours()).slice(-2);
  var minutes = ("0" + d.getMinutes()).slice(-2);
  var seconds = ("0" + d.getSeconds()).slice(-2);
  var ampm = "a";
  if (hours >= 12) {
    hours = hours - 12;
    ampm = "p";
  }
  if (hours == 0) {
    hours = 12;
  }
  return year + "/" + month + "/" + day + " " + hours + ":" + minutes + ampm;
}

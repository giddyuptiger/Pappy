let db = firebase.database();
db.ref("test").set({ test: "123" });
Logger.log("te");
Logger.log(db.ref());

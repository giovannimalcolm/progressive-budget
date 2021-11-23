let db;

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

  const req = indexedDB.open("budget", 1);

  req.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
  };
  
  req.onsuccess = ({ target }) => {
    db = target.result;
  
    // read the db if the app is online
    if (navigator.onLine) {
      checkDatabase();
    }
  };
  
  req.onerror = function(event) {
    console.log("Error! " + event.target.errorCode);
  };
  
  function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
  
    store.add(record);
  }
  
  function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => {        
          return response.json();
        })
        .then(() => {
          // delete records if successful
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
      }
    };
  }
  
  // whenever app comes online check the db 
  window.addEventListener("online", checkDatabase);
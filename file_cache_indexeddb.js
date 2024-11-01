var db;
var dbName = 'FileCacheDB';
var storeName = 'FileStore';
var dbVersion = 1;

// Function to open the IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore(storeName, { keyPath: 'efileid' });
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

// Function to delete a file from IndexedDB
async function deleteFile(key) {
    try {
        const db = await openDatabase();
        const message = await deleteFileFromStore(db, key);
        console.log(message);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to delete a file from the store by its key
function deleteFileFromStore(db, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.delete(key);

        request.onsuccess = function () {
            resolve(`File with id ${key} deleted successfully.`);
        };

        request.onerror = function () {
            reject(`Error deleting file with id ${key}: ${request.error}`);
        };
    });
}

// Function to get a file from IndexedDB
function getFileFromStore(db, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.get(key);
        request.onsuccess = function (event) {
            resolve(event.target.result);
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

// Function to add a file to IndexedDB
function addFileToStore(db, file, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const data = {
            efileid: key,
            filesize: file.size || 0,
            filepath: 'file/' + key,
            filename: 'testfile',
            filetype: file.type || 'application/pdf',
            filecontent: file,
            updatedat: new Date()
        };
        const request = objectStore.add(data);
        request.onsuccess = function () {
            resolve();
        };
        request.onerror = function () {
            reject(request.error);
        };
    });
}

// Function to update a file in the store
function updateFileInStore(db, updatedFile) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(updatedFile); // Using put to update

        request.onsuccess = function () {
            resolve('File updated successfully.');
        };

        request.onerror = function () {
            reject('Error updating file: ' + request.error);
        };
    });
}

// Main function to check and retrieve the file
// async function saveOrUpdateFileInStore(fileId, file, efileid) {
//     try {
//         const db = await openDatabase();
//         const existingfile = await getFileFromStore(db, efileid);
//         if (existingfile) {
//             // const fetchedFile = await getFileFromStorage(fileId);
//             const updateddata = {
//                 filesize: fetchedFile.size || 0,
//                 filepath: 'file/' + efileid,
//                 filename: 'testfile',
//                 filetype: efileid.type || 'application/pdf',
//                 filecontent: fetchedFile,
//             };
//             const updatedFile = { ...existingfile, ...updateddata, updatedAt: new Date() };
//             await updateFileInStore(db, updatedFile);
//         } else {
//             // const fetchedFile = await getFileFromStorage(fileId);
//             await addFileToStore(db, file, efileid);
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// Main function to check and retrieve the file
async function checkAndRetrieveFileFromStore(fileId) {
    try {
        const efileid = btoa(fileId);
        console.log(fileId);
        const db = await openDatabase();
        const file = await getFileFromStore(db, efileid);
        if (file) {
            console.log('File found in store:', file);
            return file.filecontent;
        } else {
            console.log('File not found, fetching from server...');
            // const fetchedFile = await getFileFromStorage(fileId);
            await addFileToStore(db, file, efileid);
            console.log('File fetched and added to store.');
            const file = await getFileFromStore(db, efileid);
            return file.filecontent;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}






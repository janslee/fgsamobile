/*
	Page specific JavaScript:
*/
$().ready(function () {
    document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {
    fgaDB.open();
    initTaskTable();
    initContactTable();
    initContactLocTable();
    initContactTaskTable();
    initContactPicTable();
    console.debug("device ready");
    $.mobile.changePage("login.html", "pop", false, false);
    document.addEventListener("backbutton", eventBackButton, false);
}

function initTaskTable() {
    fgaDB.dropTable('Task');
    fgaDB.db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Task (Id INTEGER PRIMARY KEY AUTOINCREMENT, RemoteId INTEGER, Title TEXT, AssignorName TEXT, Created DATETIME, Modified DATETIME)');
    });
}

function initContactTable() {
    fgaDB.dropTable('Contact');
    fgaDB.db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Contact (Id INTEGER PRIMARY KEY AUTOINCREMENT, RemoteId INTEGER, IsDraft INTEGER, DivisionId INTEGER, DivisionName TEXT, CompanyId INTEGER, CompanyName TEXT, DistrictId INTEGER, DistrictName TEXT, CategoryId INTEGER, CategoryName TEXT, DescriptionShort TEXT, Description TEXT, SubmitterName TEXT, LocationId INTEGER, LocationName TEXT, ConversationDate DATETIME, Created DATETIME, Modified DATETIME)');
    });
}

function initContactLocTable() {
    fgaDB.dropTable('ContactLoc');
    fgaDB.db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS contactLoc(contactID, loc1 TEXT, loc2 TEXT, loc3 TEXT, loc4 TEXT, loc5 TEXT,loc6 TEXT)", []);
    });
}

function initContactTaskTable() {
    fgaDB.dropTable('ContactTask');
    fgaDB.db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS ContactTask(Id INTEGER PRIMARY KEY AUTOINCREMENT, ContactId INTEGER, Title TEXT, AssignedToId INTEGER, AssigneeName TEXT)");
    });
}

function initContactPicTable() {
    fgaDB.dropTable("contactPic");
    fgaDB.contactPic.createTable();
}

function eventBackButton() {
    if ($.mobile.activePage.is('#home') || $.mobile.activePage.is('#login')) {
        exitApp();
    } else 
        navigator.app.backHistory();
}

function exitApp() {
    navigator.app.exitApp();
}
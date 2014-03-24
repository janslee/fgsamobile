/*
	Page specific JavaScript:
*/

//added by anson for create new contact
$(document).on("tap", ".createNewBtn", function () {
    if (!$(".createNewBtn").data("disabled")) {
        $(".createNewBtn").data("disabled", true);
        localId = 0;
        myContact = new Contact();
        isNext = 0;
        editMode = EDIT_MODE_NEWCONTACT;
        $.mobile.changePage("createNew.html");
        $(".createNewBtn").data("disabled", false);
    }
});

$(document).on('pagecreate', '#home', function(event) {
	getMyDraftsCount();
	getOtherCountFromLocal();
});

$(document).on('tap', '#home_refreshBtn', function(event) {
	getMyDraftsCount();
	getOtherCountFromLocal();
});

function getMyDraftsCount() {
	if (fgaDB.db === null) {
		fgaDB.open();
	}
	fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM Contact WHERE IsDraft=1', [], function(tx, results) {
			$("#myDraftsCount").html('(' + results.rows.length + ')');
		});
	});
}

function getOtherCountFromLocal() {
	if (fgaDB.db === null) {
		fgaDB.open();
	}
	fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM Task', [], function(tx, results) {
			$("#myTasksCount").html('(' + results.rows.length + ')');
		});
		tx.executeSql('SELECT * FROM Contact WHERE IsDraft=0', [], function(tx, results) {
			$("#myContactsCount").html('(' + results.rows.length + ')');
		});
	}, getOtherCount, getOtherCount);
}

function getOtherCount() {
	console.log(getConnectionType());
	if (!checkConnection()) {
		return;
	}
	$.ajax({
		type: "GET",
		url: URL_GET_MYTASKSCOUNT,
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			$("#myTasksCount").html('(' + data + ')');
		},
		error: function(data) {
			console.log(JSON.stringify(data));
		}
	});
	$.ajax({
		type: "GET",
		url: URL_GET_MYCONTACTSCOUNT,
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			$("#myContactsCount").html('(' + data + ')');
		},
		error: function(data) {
			console.log(JSON.stringify(data));
		}
	});
}
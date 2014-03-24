/*
	Page specific JavaScript:
*/
$(document).on('pagecreate', '#myDrafts', function(event) {
	getDraftData();
});

$(document).on('tap', '#draftItem', function(event) {
	localId = $(this).find("[type='hidden']").val();
	myContact = new Contact();
	isNext = 0;
	editMode = EDIT_MODE_EDITDRAFT;
	$.mobile.changePage("createNew.html");
});

function getDraftData() {
	if (fgaDB.db === null) {
		fgaDB.open();
	}
	fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM Contact WHERE IsDraft=1', [], addDraftDiv, null);
	});
}

function addDraftDiv(tx, results) {
	var len = results.rows.length;
	var list = new Array();
	for (var i = 0; i < len; i++) {
		var item = cloneObject(results.rows.item(i));
		item.Created = formatDate(item.Created, "MM/dd/yyyy hh:mm");
		list.push(item);
	}
	var data = {
		list: list
	};
	var content = template.render('myDraftList', data);
	$("div.draftWrapper").html(content);
	$("#draftCount").html('(' + len + ')');
}
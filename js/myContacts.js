/*
	Page specific JavaScript:
*/

$(document).on('pageshow', '#myContacts', function(event) {
	$('body').append("<div class='ui-loader-background'> </div>");
	$.mobile.loading('show');
	getContactDataFromLocal();
});

$(document).on('tap', '#editMyContact', function(event) {
	var RemoteId = $(this).find('#RemoteId').val();
	fgaDB.db.transaction(function(tx) { //select localId
		tx.executeSql('SELECT * FROM Contact WHERE RemoteId=? AND IsDraft=0', [RemoteId], function(tx, results) {
			localId = results.rows.item(0).Id;
		}, fgaDB.onError);
	}, null, function() {
		console.log("Id:", localId);
		myContact = new Contact();
		isNext = 0;
		editMode = EDIT_MODE_EDITCONTACT;
		$.mobile.changePage("createNew.html");
	});
});

function getContactDataFromLocal() {
	if (fgaDB.db === null) {
		fgaDB.open();
	}
	fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM Contact WHERE IsDraft=0', [], function(tx, results) {
			var len = results.rows.length;
			var list = new Array();
			for (var i = 0; i < len; i++) {
				var item = cloneObject(results.rows.item(i));
				item.ConversationDate = formatDate(item.ConversationDate, "MM/dd/yyyy hh:mm");
				list.push(item);
			}
			var data = {
				list: list
			};
			console.log(JSON.stringify(data));
			var content = template.render('myContactList', data);
			$("ul.contactList").html(content);
			$("#contactCount").html('(' + len + ')');
		});
	}, getContactData, getContactData);
}

function getContactData() {
	console.log("Connection:", getConnectionType());
	if (!checkConnection()) {
		return;
	}
	console.log("token:", accessToken);
	$.ajax({
		type: "GET",
		url: URL_GET_MYCONTACTS,
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			resolveContactData(data);
		},
		error: function(data) {
			console.log(JSON.stringify(data));
		}
	});
}

function resolveContactData(data) {
	addContactDiv(data);
	updateContactDataToLocal(data);
}

function addContactDiv(data) {
	var list = new Array();
	$.each(data, function(index, item) {
		var cloneItem = cloneObject(item);
		cloneItem.ConversationDate = formatDate(cloneItem.ConversationDate, "MM/dd/yyyy hh:mm");
		cloneItem.RemoteId = cloneItem.Id;
		cloneItem.CategoryName = cloneItem.CategoryName;
		list.push(cloneItem);
	});
	var dataObj = {
		list: list
	};
	var content = template.render('myContactList', dataObj);
	$("ul.contactList").html(content);
	$("#contactCount").html('(' + data.length + ')');
}

function updateContactDataToLocal(data) {
	deleteNonExistingContactData(data);
	insertOrUpdateContactData(data);
}

function deleteNonExistingContactData(data) {
	var remoteIdArr = new Array();
	$.each(data, function(index, item) {
		remoteIdArr.push(item.Id);
	});
	var remoteIds = "(" + remoteIdArr.toString() + ")";
	fgaDB.db = window.openDatabase("FGSA", "1.0", "FirstGroup Safety App Database", 1024 * 1024);
	fgaDB.db.transaction(function(tx) { // delete non-exist Contact Data
		tx.executeSql('DELETE FROM Contact WHERE IsDraft=0 AND RemoteId NOT IN ' + remoteIds);
	});
	fgaDB.db.transaction(function(tx) { // delete non-exist ContactTask Data
		tx.executeSql('SELECT * FROM Contact', [], function(tx, results) {
			var localIdArr = new Array();
			for (var i = 0; i < results.rows.length; i++) {
				localIdArr.push(results.rows.item(i).Id);
			}
			var localIds = "(" + localIdArr.toString() + ")";
			tx.executeSql('DELETE FROM ContactTask WHERE ContactId NOT IN ' + localIds, [], null, fgaDB.onError);
		}, fgaDB.onError);
	});
}

function insertOrUpdateContactData(data) {
	var existingArr = new Array();
	var insertArr = new Array();
	var updateArr = new Array();
	fgaDB.db.transaction(function(tx) { //get existing data from local db
		tx.executeSql('SELECT * FROM Contact WHERE IsDraft=0', [], function(tx, results) {
			for (var i = 0; i < results.rows.length; i++) {
				var item = results.rows.item(i);
				existingArr.push(new Contact(item.RemoteId, item.IsDraft, item.CategoryId, item.CategoryName, item.DescriptionShort, item.Description, item.SubmitterName, item.Created, item.Modified, item.DistrictId, item.DistrictName, item.CompanyId, item.CompanyName, item.DivisionId, item.DivisionName, item.LocationId, item.LocationName, item.ConversationDate));
			}
		});
	}, null, function() {
		$.each(data, function(index, item) { //Compare
			var remoteItem = new Contact(item.Id, 0, item.CategoryId, item.CategoryName, item.DescriptionShort, item.Description, item.SubmitterName, item.Created, item.Modified, item.DistrictId, item.DistrictName, item.CompanyId, item.CompanyName, item.DivisionId, item.DivisionName, item.LocationId, item.LocationName, item.ConversationDate);
			//add images
			$.each(item.Images, function(index, image) {
				remoteItem.ImageArr.push(new Image(image.Id, image.ContactId, image.URL));
			});
			//add tasks
			$.each(item.Tasks, function(index, task) {
				remoteItem.TaskArr.push(new ContactTask(task.ContactId, task.Title, task.AssignedToId, task.AssignedTo.DisplayName));
			});
			console.log(JSON.stringify(remoteItem));
			var isNew = true;
			for (i = 0; i < existingArr.length; i++) {
				if (remoteItem.RemoteId == existingArr[i].RemoteId) {
					isNew = false; // If remoteItem.Id already exists
					if (existingArr[i].Modified != item.Modified) { //If modified, add to update array
						remoteItem.Id = existingArr[i].Id; //localId
						updateArr.push(remoteItem);
					}
					break;
				}
			}
			if (isNew) {
				insertArr.push(remoteItem);
			}
		});
		fgaDB.db.transaction(function(tx) { //Update and insert
			var insertArrCnt = 0;
			var updateArrCnt = 0;
			$.each(insertArr, function(index, item) {
				insertArrCnt = insertArrCnt + item.ImageArr.length;
			});

			$.each(updateArr, function(index, item) {
				updateArrCnt = updateArrCnt + item.ImageArr.length;
			});

			$.each(updateArr, function(index, item) {
				tx.executeSql('UPDATE Contact SET IsDraft=?, CategoryId=?, CategoryName=?, DescriptionShort=?, Description=?, SubmitterName=?, Created=?, Modified=?,DistrictId=?, DistrictName=?, CompanyId=?, CompanyName=?, DivisionId=?, DivisionName=?, LocationId=?, LocationName=?, ConversationDate=? WHERE RemoteId=? AND IsDraft=0', [item.IsDraft, item.CategoryId, item.CategoryName, item.DescriptionShort, item.Description, item.SubmitterName, item.Created, item.Modified, item.DistrictId, item.DistrictName, item.CompanyId, item.CompanyName, item.DivisionId, item.DivisionName, item.LocationId, item.LocationName, item.ConversationDate, item.RemoteId]);
				//update tasks
				tx.executeSql("DELETE FROM ContactTask WHERE ContactId=?", [item.Id], null, fgaDB.onError);
				$.each(item.TaskArr, function(index, taskItem) {
					tx.executeSql("INSERT INTO ContactTask(ContactId, Title, AssignedToId, AssigneeName) VALUES (?, ?, ?, ?)", [item.Id, taskItem.Title, taskItem.AssignedToId, taskItem.AssigneeName], null, fgaDB.onError);
				});
				//update images
				fgaDB.contact.getContactByRemoteId(item.RemoteId, function(data) {
					$.each(item.ImageArr, function(index, imageItem) {
						var tmpfileName = createUUID() + ".jpg";
						console.log("URL=========" + imageItem.URL);
						FileTF.fileDownload(imageItem.URL, tmpfileName, function(img) {
							fgaDB.contactPic.updatePicById("image" + imageItem.Idx, img, data[id]);
							updateArrCnt = updateArrCnt - 1;
							if (insertArrCnt === 0 && updateArrCnt === 0)
								$.mobile.loading('hide');
						});
					});
				});
			});

			$.each(insertArr, function(index, item) {
				tx.executeSql('INSERT INTO Contact(RemoteId, IsDraft, CategoryId, CategoryName, DescriptionShort, Description, SubmitterName, Created, Modified, DistrictId, DistrictName, CompanyId, CompanyName, DivisionId, DivisionName, LocationId, LocationName, ConversationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.RemoteId, item.IsDraft, item.CategoryId, item.CategoryName, item.DescriptionShort, item.Description, item.SubmitterName, item.Created, item.Modified, item.DistrictId, item.DistrictName, item.CompanyId, item.CompanyName, item.DivisionId, item.DivisionName, item.LocationId, item.LocationName, item.ConversationDate],
					function(tx, results) {
						var id = results.insertId;
						console.log("localId:", localId);
						//insert tasks
						tx.executeSql("DELETE FROM ContactTask WHERE ContactId=?", [id], null, fgaDB.onError);
						$.each(item.TaskArr, function(index, taskItem) {
							console.log(JSON.stringify(taskItem));
							tx.executeSql("INSERT INTO ContactTask(ContactId, Title, AssignedToId, AssigneeName) VALUES (?, ?, ?, ?)", [id, taskItem.Title, taskItem.AssignedToId, taskItem.AssigneeName], null, fgaDB.onError);
						});
						//insert images
						fgaDB.contactPic.insertPic({
							"contactId": id
						});
						$.each(item.ImageArr, function(index, imageItem) {
							var tmpfileName = createUUID() + ".jpg";
							console.log("URL==========" + imageItem.URL);
							FileTF.fileDownload(imageItem.URL, tmpfileName, function(img) {
								fgaDB.contactPic.updatePicById("image" + imageItem.Idx, img, id);
								insertArrCnt = insertArrCnt - 1;
								if (updateArrCnt === 0 && insertArrCnt === 0)
									$.mobile.loading('hide');
							});
						});
					}, fgaDB.onError);
			});
			$.mobile.loading('hide'); //aaa
			//no update
			if (updateArr.length === 0 && insertArr.length === 0) {
				$.mobile.loading('hide');
			}
		});
	});
}
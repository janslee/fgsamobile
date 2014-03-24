/*
	Page specific JavaScript:
*/

$(document).on('pagecreate', '#myTasks', function(event) {
	getTaskDataFromLocal();
});

$(document).on('tap', '#taskItem', function(event) {
	var taskId = $(this).find("[type='hidden']").val();
	$.mobile.changePage("completeTask.html?taskId=?" + taskId);
});

function getTaskDataFromLocal() {
	if (fgaDB.db === null) {
		fgaDB.open();
	}
	fgaDB.db.transaction(function(tx) {
		tx.executeSql('SELECT * FROM Task', [], function(tx, results) {
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
			var content = template.render('myTaskList', data);
			$("ul.taskList").html(content);
			$("#taskCount").html('(' + len + ')');
		});
	}, getTaskData, getTaskData);
}

function getTaskData() {
	console.log("Connection:", getConnectionType());
	if (!checkConnection()) {
		return;
	}
	$.ajax({
		type: "GET",
		url: URL_GET_MYTASKS,
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			resolveTaskData(data);
		},
		error: function(data) {
			console.log(JSON.stringify(data));
		}
	});
}

function resolveTaskData(data) {
	addTaskDiv(data);
	updateTaskDataToLocal(data);
}

function addTaskDiv(data) {
	var list = new Array();
	$.each(data, function(index, item) {
		var cloneItem = cloneObject(item);
		cloneItem.AssignorName = cloneItem.Assignor.FirstName + " " + cloneItem.Assignor.LastName;
		cloneItem.Created = formatDate(cloneItem.Created, "MM/dd/yyyy hh:mm");
		cloneItem.RemoteId = cloneItem.Id;
		list.push(cloneItem);
	});
	var dataObj = {
		list: list
	};
	var content = template.render('myTaskList', dataObj);
	$("ul.taskList").html(content);
	$("#taskCount").html('(' + data.length + ')');
}

function updateTaskDataToLocal(data) {
	deleteNonExistingTaskData(data);
	insertOrUpdateTaskData(data);
}

function insertOrUpdateTaskData(data) {
	var existingArr = new Array();
	fgaDB.db.transaction(function(tx) { //get existing tasks from local db
		tx.executeSql('SELECT * FROM Task', [], function(tx, results) {
			for (var i = 0; i < results.rows.length; i++) {
				var item = results.rows.item(i);
				existingArr.push(new Task(item.RemoteId, item.Title, item.AssignorName, item.Created, item.Modified));
			}
		});
	}, null, function() {
		var insertArr = new Array();
		var updateArr = new Array();
		$.each(data, function(index, item) { //Compare
			var AssignorName = item.Assignor.FirstName + " " + item.Assignor.LastName;
			var remoteItem = new Task(item.Id, item.Title, AssignorName, item.Created, item.Modified);
			var isNew = true;
			for (i = 0; i < existingArr.length; i++) {
				if (remoteItem.RemoteId == existingArr[i].RemoteId) {
					isNew = false; // If remoteItem.Id already exists
					if (existingArr[i].Modified != item.Modified) { //If modified, add to update array
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
			$.each(updateArr, function(index, item) {
				tx.executeSql('UPDATE Task SET Title=?, AssignorName=?, Created=?, Modified=? WHERE RemoteId=?', [item.Title, item.AssignorName, item.Created, item.Modified, item.RemoteId]);
			});
			$.each(insertArr, function(index, item) {
				tx.executeSql('INSERT INTO Task(RemoteId, Title, AssignorName, Created, Modified) VALUES (?, ?, ?, ?, ?)', [item.RemoteId, item.Title, item.AssignorName, item.Created, item.Modified]);
			});
		});
	});
}

function deleteNonExistingTaskData(data) {
	var remoteIdArr = new Array();
	$.each(data, function(index, item) {
		remoteIdArr.push(item.Id);
	});
	var remoteIds = "(" + remoteIdArr.toString() + ")";
	fgaDB.db = window.openDatabase("FGSA", "1.0", "FirstGroup Safety App Database", 1024 * 1024);
	fgaDB.db.transaction(function(tx) { // delete non-exist data
		tx.executeSql('DELETE FROM Task WHERE RemoteId not in ' + remoteIds);
	});
}
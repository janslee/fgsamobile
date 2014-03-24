/*
	Page specific JavaScript:
*/
var currentIndex_Step4;

$(document).on('pagecreate', '#createNew_step4', function(event) {
	isOnline = checkConnection();
	console.log(isOnline);
	if (isOnline) {
		$('#submitBtn').html("Send");
	} else {
		$('#submitBtn').html("Save");
	}
	// if (true) {
	// 	$('#taskControlDiv').hide();
	// }
	$('.chooseLocSearch div.ui-input-text').append('<img/>');
	getContactTaskFromLocal();
});

function getContactTaskFromLocal() {
	$('#observation').val(myContact.Description);
	if (myContact.TaskArr === null || myContact.TaskArr.length <= 0) {
		fgaDB.db.transaction(function(tx) {
			tx.executeSql('SELECT * FROM ContactTask WHERE ContactId=?', [localId], function(tx, results) {
				var len = results.rows.length;
				for (var i = 0; i < len; i++) {
					var item = results.rows.item(i);
					var Title = item.Title;
					var AssignedToId = item.AssignedToId;
					var AssigneeName = item.AssigneeName;
					myContact.TaskArr.push(new ContactTask(0, Title, AssignedToId, AssigneeName));
					$('#searchName' + (i + 1)).val(AssigneeName);
					$('#searchUserId' + (i + 1)).val(AssignedToId);
					$('#taskName' + (i + 1)).val(Title);
					$('#showTaskName' + (i + 1)).html(Title);
					$('#saveTask' + (i + 1)).closest(".editTask").siblings("div.add").addClass('inactive');
					$('#saveTask' + (i + 1)).closest(".editTask").siblings(".reviewTask").removeClass('inactive');
				}
			}, fgaDB.onError);
		});
	} else {
		for (var i = 0; i < myContact.TaskArr.length; i++) {
			if (myContact.TaskArr[i] === undefined) {
				continue;
			}
			$('#searchName' + (i + 1)).val(myContact.TaskArr[i].AssigneeName);
			$('#searchUserId' + (i + 1)).val(myContact.TaskArr[i].AssignedToId);
			$('#taskName' + (i + 1)).val(myContact.TaskArr[i].Title);
			$('#showTaskName' + (i + 1)).html(myContact.TaskArr[i].Title);
			$('#saveTask' + (i + 1)).closest(".editTask").siblings("div.add").addClass('inactive');
			$('#saveTask' + (i + 1)).closest(".editTask").siblings(".reviewTask").removeClass('inactive');
		}
	}
}

$(document).on('tap', '.addTasks .chooseLocSearch img', function(event) {
	var name = $(this).prev().val();
	var Id = $(this).prev().attr('id'); //get input box id
	currentIndex_Step4 = Id.charAt(Id.length - 1); //get current task index
	var dpList = $('#dpList' + currentIndex_Step4);
	getUserData(URL_SEARCH_USER_BY_NAME, name, dpList);
});

$(document).on('tap', '#dpListItem', function(event) {
	var name = $(this).html();
	name = name.replace("&amp;", "&");
	console.log(name);
	var userId = $(this).next().val();
	var Id = $(this).parent().parent().attr('id'); //get current tap dplist id
	currentIndex_Step4 = Id.charAt(Id.length - 1);
	var dp_list = $('#dpList' + currentIndex_Step4);
	$('#searchName' + currentIndex_Step4).val(name);
	$('#searchUserId' + currentIndex_Step4).val(userId);
	dp_list.hide();
});

function getUserData(url, name, dpList) {
	console.log("Token:", accessToken);
	$.ajax({
		type: "GET",
		url: url + name,
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log(JSON.stringify(data));
			resolveUserData(data, dpList);
		},
		error: function(data) {
			console.log(JSON.stringify(data));
		}
	});
}

function resolveUserData(data, dpList) {
	var list = new Array();
	$.each(data, function(index, item) {
		var user = new Object();
		user.UserId = item.UserId;
		user.Name = item.Name;
		list.push(user);
	});
	console.log(JSON.stringify(list));
	var dataObj = {
		list: list
	};
	var content = template.render('searchList' + currentIndex_Step4, dataObj);
	dpList.find("ul").html(content);
	dpList.show();
}

$(document).on('tap', '.editTask > .controls > .add', function(event) {
	var Id = $(this).attr('id');
	var index = Id.charAt(Id.length - 1);
	var taskName = $('#taskName' + index).val();
	var AssignedToId = $('#searchUserId' + index).val();
	var AssigneeName = $('#searchName' + index).val();
	if (taskName === "" || $('#searchUserId' + index).val() === "") {
		$("#errorTaskDialog").popup('open');
		return;
	}
	$('#showTaskName' + index).html(taskName);
	if (myContact.TaskArr[index - 1] === undefined) {
		myContact.TaskArr[index - 1] = new ContactTask(localId, taskName, AssignedToId, AssigneeName);
	} else {
		myContact.TaskArr[index - 1].ContactId = localId;
		myContact.TaskArr[index - 1].Title = taskName;
		myContact.TaskArr[index - 1].AssignedToId = AssignedToId;
		myContact.TaskArr[index - 1].AssigneeName = AssigneeName;
	}
	$(this).closest(".editTask").addClass('inactive');
	$(this).closest(".editTask").siblings(".reviewTask").removeClass('inactive');
});

$(document).on('tap', '.editTask > .controls > .cancel', function(event) {
	var Id = $(this).attr('id');
	var index = Id.charAt(Id.length - 1);
	$('#taskName' + index).val("");
	$('#searchUserId' + index).val("");
	$('#searchName' + index).val("");
	$(this).closest(".editTask").addClass('inactive');
	$(this).closest(".editTask").siblings("div.add").removeClass('inactive');
});

$(document).on('tap', '.reviewTask', function(event) {
	var tapLoc = event.clientX;
	var tapableTarget = $(this).outerWidth() * 0.9;
	if (tapLoc > tapableTarget) {
		var Id = $(this).attr('id');
		var index = Id.charAt(Id.length - 1);
		$('#taskName' + index).val("");
		$('#searchUserId' + index).val("");
		$('#searchName' + index).val("");
		$('#showTaskName' + index).val("");
		myContact.TaskArr[index - 1] = undefined;
		$(this).addClass('inactive');
		$(this).siblings('div.add').removeClass('inactive');
	}
});

$(document).on('blur', '#observation', function(event) {
	console.log("ONBLUR");
	myContact.Description = $('#observation').val();
});

$(document).on('tap', '#submitBtn', function(event) {
	if (isOnline) {
		//Submit Task
		if (editMode === EDIT_MODE_NEWCONTACT) {
			saveAsDraft("myContacts.html", createContact);
		} else if (editMode === EDIT_MODE_EDITCONTACT) {

		} else {

		}
	} else { //Save
		if ($('#observation').val() === "") {
			$("#errorObservationDialog").popup('open');
			return;
		}
		saveContact();
	}
});

//added by anson for confirmation when leaving current page
$(document).on("tap", "#createNew_step4 .leaveThisPage", function() {
	toPage = $(this).attr("data");
	$("#saveDraftDialog4").popup('open');
});

$(document).on("tap", "#saveDraftYesBtn4", function() {
	saveContact(toPage);
});

$(document).on("tap", "#saveDraftNoBtn4", function() {
	localId = 0;
	myContact = null;
	$.mobile.changePage(toPage);
});

function createContact(insertId) {
	var requestData = getContactJsonString(myContact);
	localId = insertId;
	//var url = "http://157.56.180.233/ip/contacts/add/0"	;
	console.log("Token:", accessToken);
	$.ajax({
		type: "POST",
		async: false,
		url: URL_CREATE_CONTACT,
		data: requestData,
		contentType: "application/json",
		dataType: "json",
		headers: {
			"Authorization": accessToken
		},
		success: function(data) {
			console.log("create contact request:" + JSON.stringify(data));
			//alert(data);
			fgaDB.contact.UpdateContactById({
				"IsDraft": 0,
				"Modified": data.Modified,
				"RemoteId": data.Id,
				"Id": localId
			});
			alert("Contact submit completed!");
		},
		error: function(data) {
			console.log("create contact fail:" + JSON.stringify(data));
			alert("Create contact fail!");
		}
	});
}
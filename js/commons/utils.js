/*
	Page specific JavaScript:
*/
function id(element) {
    return document.getElementById(element);
}

function checkConnection() {
    if (getConnectionType() == "No network connection") {
        return false;
    }
    return true;
}

function getConnectionType() {
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.NONE] = 'No network connection';
    return states[networkState];
}

function formatDate(dateString, format) {
    if (dateString === null || dateString === "") {
        return "No Date";
    }
    return (new Date(dateString)).FormatUTC(format);
}

Date.prototype.FormatUTC = function(fmt) {
    var o = {
        "M+": this.getUTCMonth() + 1, //Month
        "d+": this.getUTCDate(), //Day
        "h+": this.getUTCHours(), //Hour
        "m+": this.getUTCMinutes(), //Minute
        "s+": this.getUTCSeconds(), //Second
        "q+": Math.floor((this.getUTCMonth() + 3) / 3), //Quarter
        "S": this.getUTCMilliseconds() //Millisecond
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

Date.prototype.Format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1, //Month
        "d+": this.getDate(), //Day
        "h+": this.getHours(), //Hour
        "m+": this.getMinutes(), //Minute
        "s+": this.getSeconds(), //Second
        "q+": Math.floor((this.getMonth() + 3) / 3), //Quarter
        "S": this.getMilliseconds() //Millisecond
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

function cloneObject(o) {
    if (!o || 'object' != typeof o) {
        return o;
    }
    var c = Object.prototype.toString.call(o) == '[object Array]' ? [] : {};
    var p, v;
    for (p in o) {
        if (o.hasOwnProperty(p)) {
            v = o[p];
            if (v && 'object' == typeof v) {
                c[p] = cloneObject(v);
            } else {
                c[p] = v;
            }
        }
    }
    return c;
}

function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function saveContact(toPage) {
    if (editMode === EDIT_MODE_NEWCONTACT || editMode === EDIT_MODE_EDITCONTACT) {
        saveAsDraft(toPage, function() {});
    } else {
        UpdateDraft(toPage);
    }
}

function saveAsDraft(toPage, callback) {
    if (toPage === undefined || toPage === "") {
        toPage = "home.html";
    }
    checkNull();
    fgaDB.db.transaction(function(tx) {
        console.log(JSON.stringify(myContact));
        if (myContact.Created === "") {
            myContact.Created = new Date().Format('yyyy-MM-ddThh:mm:ss.S');
        }
        myContact.Modified = new Date().Format('yyyy-MM-ddThh:mm:ss.S');
        tx.executeSql('INSERT INTO Contact(RemoteId, IsDraft, CategoryId, CategoryName, DescriptionShort, Description, SubmitterName, Created, Modified, DistrictId, DistrictName, CompanyId, CompanyName, DivisionId, DivisionName, LocationId, LocationName, ConversationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [myContact.RemoteId, 1, myContact.CategoryId, myContact.CategoryName, myContact.DescriptionShort, myContact.Description, myContact.SubmitterName, myContact.Created, myContact.Modified, myContact.DistrictId, myContact.DistrictName, myContact.CompanyId, myContact.CompanyName, myContact.DivisionId, myContact.DivisionName, myContact.LocationId, myContact.LocationName, myContact.ConversationDate], function(tx, results) {
            var insertId = results.insertId;
            console.log("insertId:", insertId);
            //insert tasks
            $.each(myContact.TaskArr, function(index, taskItem) {
                if (taskItem !== undefined) {
                    tx.executeSql("INSERT INTO ContactTask(ContactId, Title, AssignedToId, AssigneeName) VALUES (?, ?, ?, ?)", [insertId, taskItem.Title, taskItem.AssignedToId, taskItem.AssigneeName], null, fgaDB.onError);
                }
            });
            updatePics(insertId);
            callback(insertId);
        }, null, fgaDB.onError);
    }, null, function(tx, results) {
        console.log("FINISH", myContact);
        localId = 0;
        myContact = null;
        console.log(toPage);
        $.mobile.changePage(toPage);
    });
}

function UpdateDraft(toPage) {
    if (toPage === undefined || toPage === "") {
        toPage = "home.html";
    }
    checkNull();
    fgaDB.db.transaction(function(tx) {
        console.log(JSON.stringify(myContact));
        if (myContact.Created === "") {
            myContact.Created = new Date().Format('yyyy-MM-ddThh:mm:ss.S');
        }
        myContact.Modified = new Date().Format('yyyy-MM-ddThh:mm:ss.S');
        tx.executeSql('UPDATE Contact SET IsDraft=?, CategoryId=?, CategoryName=?, Description=?, Created=?, Modified=?, DistrictId=?, DistrictName=?, CompanyId=?, CompanyName=?, DivisionId=?, DivisionName=?, LocationId=?, LocationName=?, ConversationDate=? WHERE Id=?', [1, myContact.CategoryId, myContact.CategoryName, myContact.Description, myContact.Created, myContact.Modified, myContact.DistrictId, myContact.DistrictName, myContact.CompanyId, myContact.CompanyName, myContact.DivisionId, myContact.DivisionName, myContact.LocationId, myContact.LocationName, myContact.ConversationDate, localId], function(tx, results) {
            //update tasks
            tx.executeSql("DELETE FROM ContactTask WHERE ContactId=?", [localId], function(tx, results) {
                $.each(myContact.TaskArr, function(index, taskItem) {
                    if (taskItem !== undefined) {
                        tx.executeSql("INSERT INTO ContactTask(ContactId, Title, AssignedToId, AssigneeName) VALUES (?, ?, ?, ?)", [localId, taskItem.Title, taskItem.AssignedToId, taskItem.AssigneeName], null, fgaDB.onError);
                    }
                });
            }, fgaDB.onError);
            //update pictures
            updatePics(localId);
        }, null, fgaDB.onError);
    }, null, function(tx, results) {
        console.log(myContact);
        localId = 0;
        myContact = null;
        $.mobile.changePage(toPage);
    });
}

function checkNull() {
    myContact.RemoteId = myContact.RemoteId || "";
    myContact.IsDraft = myContact.IsDraft || "";
    myContact.CategoryId = myContact.CategoryId || "";
    myContact.CategoryName = myContact.CategoryName || "";
    myContact.DescriptionShort = myContact.DescriptionShort || "";
    myContact.Description = myContact.Description || "";
    myContact.SubmitterName = myContact.SubmitterName || "";
    myContact.Created = myContact.Created || "";
    myContact.Modified = myContact.Modified || "";
    myContact.DistrictId = myContact.DistrictId || "";
    myContact.DistrictName = myContact.DistrictName || "";
    myContact.CompanyId = myContact.CompanyId || "";
    myContact.CompanyName = myContact.CompanyName || "";
    myContact.DivisionId = myContact.DivisionId || "";
    myContact.DivisionName = myContact.DivisionName || "";
    myContact.LocationId = myContact.LocationId || "";
    myContact.LocationName = myContact.LocationName || "";
    myContact.ConversationDate = myContact.ConversationDate || "";
}

function updatePics(insertId) {

    if ($.mobile.activePage.is('#createNew_step2a')) {
        if (id('preImage1') !== undefined) {
            fgaDB.contactPic.insertPic({
                "contactId": insertId,
                "image1": id('preImage1').src,
                "image2": id('preImage2').src,
                "image3": id('preImage3').src,
                "image4": id('preImage4').src,
                "image5": id('preImage5').src
            });
            fgaDB.contactPic.deletePicById(-1, function() {});
        }
    } else {
        fgaDB.contactPic.deletePicById(insertId, function() {
            fgaDB.contactPic.updatePicById("contactID", insertId, -1);
        });
    }
}

function getContactJsonString(contactObj) {
    var contact = new Contact();
    contact.CategoryId = contactObj.CategoryId;
    contact.LocationId = contactObj.LocationId;
    contact.DistrictId = contactObj.DistrictId;
    contact.CompanyId = contactObj.CompanyId;
    contact.DivisionId = contactObj.DivisionId;
    contact.ConversationDate = contactObj.ConversationDate;
    contact.Description = contactObj.Description;
    contact.SubmitterType = "1";
    for (var i = 0; i < contactObj.TaskArr.length; i++) {
        var item = contactObj.TaskArr[i];
        if (item === undefined) {
            continue;
        }
        var taskObj = new Object();
        taskObj.Title = item.Title;
        taskObj.AssignedToId = item.AssignedToId;
        contact.TaskArr.push(taskObj);
    }
    // for (var i = 0; i < contactObj.ImageArr.length; i++) {
    //     var item = contactObj.ImageArr[i];
    //     if (item === undefined) {
    //         continue;
    //     }
    //     var taskObj = new Object();
    //     taskObj.Title = item.Title;
    //     taskObj.AssignedToId = item.AssignedToId;
    //     contact.TaskArr.push(taskObj);
    // }

    // var requestData = '{"CategoryId": #CategoryId, "LocationId": #LocationId, "DistrictId": #DistrictId, "CompanyId": #CompanyId, "DivisionId": #DivisionId, "ConversationDate": #ConversationDate, "Images": [], "Tasks": [#tasks],  "Description": "#Description", "SubmitterType": "1","Submitter" :{"Id": 105058}}';
    // var taskStr = "";

    // requestData = requestData.replace("#CategoryId", contactObj.CategoryId);
    // requestData = requestData.replace("#LocationId", contactObj.LocationId);
    // requestData = requestData.replace("#DistrictId", contactObj.DistrictId);
    // requestData = requestData.replace("#CompanyId", contactObj.CompanyId);
    // requestData = requestData.replace("#DivisionId", contactObj.DivisionId);
    // requestData = requestData.replace("#ConversationDate", getQuotesStr(contactObj.ConversationDate));

    // taskStr = '{"Title": #Title, "AssignedToId": #AssignedToId }';
    // var taskData = '';
    // var tempStr = '';


    // for (var i = 0; i < contactObj.TaskArr.length; i++) {
    //     var item = contactObj.TaskArr[i];
    //     if (item === undefined) {
    //         continue;
    //     }
    //     tempStr = taskStr.replace("#Title", getQuotesStr(item.Title));
    //     tempStr = tempStr.replace("#AssignedToId", getQuotesStr(item.AssignedToId));
    //     if (i == 0)
    //         taskData = tempStr;
    //     else
    //     if (taskData.length > 0)
    //         taskData.concat(',', tempStr);

    // }

    // requestData = requestData.replace("#Description", getQuotesStr(contactObj.Description));
    // requestData = requestData.replace("#tasks", taskData);
    // requestData = requestData.replace('""', '"');
    var requestData = JSON.stringify(contact);
    requestData = requestData.replace("TaskArr", "Tasks");
    requestData = requestData.replace("ImageArr", "Images");
    console.log(requestData);

    return requestData;
}

function getQuotesStr(str) {
    if (str.trim().indexOf(' ') > 0)
        return '"' + str + '"';
    else
        return str;
}
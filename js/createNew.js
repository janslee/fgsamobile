var toPage = "";
var isNext = 0;

//functions
function mapOptions(response) {
    return function(data) {
        var list = $.map(data, function(item, index) {
            return {
                label: item.Name,
                value: item.Id
            };
        });
        response(list);
    };
}

function prependSelect(a) {
    return [{
        label: '- select -',
        value: ''
    }].concat(a);
}


//inital cascading dropdowns
function initLocationDropdowns(containerEle, divisionEle, companyEle, districtEle, categoryEle, urldiv, urlcom, urldis, urltype) {
    console.log("division's url", urldiv);

    $(containerEle).cascadingDropdown({
        selectBoxes: [{
                selector: divisionEle,
                paramName: 'value',
                source: function(request, response) {
                    //$.getJSON(urldiv, request, mapOptions(response));
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: urldiv,
                        dataType: "json",
                        headers: {
                            "Authorization": accessToken
                        },
                        success: mapOptions(response)
                    });
                    $(divisionEle).selectmenu();
                    $(divisionEle).selectmenu('enable');
                },
                onChange: function(event, dropdownData) {
                    $([companyEle, districtEle].join(',')).val("");
                    $(districtEle).selectmenu('disable');
                    $(districtEle).selectmenu('refresh');
                    if (dropdownData == "") {
                        $(companyEle).attr("disabled", true);
                        $(districtEle).attr("disabled", true);
                    } else {
                        $(districtEle).attr("disabled", true);
                    }
                    $(companyEle).selectmenu('refresh');
                    $(companyEle).selectmenu('enable');
                }
            }, {
                selector: companyEle,
                requires: [divisionEle],
                paramName: 'value',
                source: function(request, response) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: urlcom,
                        dataType: "json",
                        data: $.extend({
                            field: "divisionId"
                        }, request),
                        headers: {
                            "Authorization": accessToken
                        },
                        success: mapOptions(response)
                    });
                },
                onChange: function(event, dropdownData) {
                    $([districtEle].join(',')).val("");
                    if (dropdownData == "") {
                        $(districtEle).attr("disabled", true);
                    }
                    $(districtEle).selectmenu('refresh');
                    $(districtEle).selectmenu('enable');
                }
            },

            {
                selector: districtEle,
                requires: [companyEle],
                paramName: 'value',
                source: function(request, response) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: urldis,
                        dataType: "json",
                        data: $.extend({
                            field: "companyId"
                        }, request),
                        headers: {
                            "Authorization": accessToken
                        },
                        success: mapOptions(response)
                    });
                }
            }, {
                selector: categoryEle,
                paramName: 'value',
                source: function(request, response) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: urltype,
                        dataType: "json",
                        headers: {
                            "Authorization": accessToken
                        },
                        success: mapOptions(response)
                    });
                    $(categoryEle).selectmenu();
                    $(categoryEle).selectmenu('enable');
                }
            }
        ]
    });
}

//validation
function validate_first_step(myObj) {
    if (myObj.DivisionId == null || myObj.DivisionId == "")
        return false;
    if (myObj.DivisionName == null || myObj.DivisionName == "")
        return false;
    if (myObj.CompanyId == null || myObj.CompanyId == "")
        return false;
    if (myObj.CompanyName == null || myObj.CompanyName == "")
        return false;
    if (myObj.DistrictId == null || myObj.DistrictId == "")
        return false;
    if (myObj.DistrictName == null || myObj.DistrictName == "")
        return false;
    if (myObj.CategoryId == null || myObj.CategoryId == "")
        return false;
    if (myObj.CategoryName == null || myObj.CategoryName == "")
        return false;
    if (myObj.ConversationDate == null || myObj.ConversationDate == "")
        return false;
    return true;
};

//format date
function dateFormat(myDate) {
    var fmtdate = myDate.substr(6) + "-" + myDate.substr(0, 2) + "-" + myDate.substr(3, 2);
    return fmtdate;
}

function timeFormat(myTime) {
    var fmttime;
    if (myTime.substr(6, 2) == "PM") {
        var hh = parseInt(myTime.substr(0, 2)) + 12;
        fmttime = hh + myTime.substr(2, 3) + ":00.000";
    } else {
        fmttime = myTime.substr(0, 5) + ":00.000";
    }
    return fmttime;
}

//formate the Date(database) to the format that display in the APP
function fmtDate(mydatetime) {
    var myfmtDate = formatDate(mydatetime, "MM/dd/yyyy hh:mm");
    return myfmtDate.substr(0, 10)
}

//formate the Time(database) to the format that display in the APP
function fmtTime(mydatetime) {
    var myfmtDate = formatDate(mydatetime, "MM/dd/yyyy hh:mm");
    var hh = parseInt(myfmtDate.substr(11, 2));
    if (hh > 12) {
        hh -= 12;
        if (hh < 10)
            hh = "0" + hh.toString();
        return hh + myfmtDate.substr(13, 3) + " PM";
    } else {
        return myfmtDate.substr(11, 5) + " AM";
    }
}

//get current date
function getCurDate() {
    var myCurDate = new Date();
    myCurDate = myCurDate.Format("MM/dd/yyyy hh:mm");
    return myCurDate.substr(0, 10);
}

//get current time
function getCurtime() {
    var myCurDate = new Date();
    myCurDate = myCurDate.Format("MM/dd/yyyy hh:mm");
    var hh = parseInt(myCurDate.substr(11, 2));
    if (hh > 12) {
        hh -= 12;
        if (hh < 10)
            hh = "0" + hh.toString();
        return hh + myCurDate.substr(13, 3) + " PM";
    } else {
        return myCurDate.substr(11, 5) + " AM";
    }
}


//render items for dropdown
function renderItems(data, elem) {
    var items = $.map(data, function(item, index) {
        return {
            label: item.Name,
            value: item.Id
        };
    });

    $.each(items, function(index, item) {
        elem.append('<option value="' + item.value + '"' + '>' + item.label + '</option>');
    });
    elem.selectmenu('refresh');
}

//set options for dropdown
function setOptions(divId, comId) {
    $.ajax({
        type: "GET",
        async: false,
        url: "http://injuryprevention.cloudapp.net/ip/Divisions",
        dataType: "json",
        headers: {
            "Authorization": accessToken
        },
        success: function(data) {
            renderItems(data, $("#Division"));
        }
    });

    $.ajax({
        type: "GET",
        async: false,
        url: "http://injuryprevention.cloudapp.net/ip/Companies",
        dataType: "json",
        data: {
            field: "divisionId",
            value: divId
        },
        headers: {
            "Authorization": accessToken
        },
        success: function(data) {
            renderItems(data, $("#Company"));
        }
    });
    $.ajax({
        type: "GET",
        async: false,
        url: "http://injuryprevention.cloudapp.net/ip/Districts",
        dataType: "json",
        data: {
            field: "companyId",
            value: comId
        },
        headers: {
            "Authorization": accessToken
        },
        success: function(data) {
            renderItems(data, $("#District"));
        }
    });

    $.ajax({
        type: "GET",
        async: false,
        url: "http://injuryprevention.cloudapp.net/ip/categories",
        dataType: "json",
        headers: {
            "Authorization": accessToken
        },
        success: function(data) {
            renderItems(data, $("#ContactType"));
        }
    });
}

function createNew_initalize() {
    $("#myDate").mobiscroll().date({
        theme: 'default',
        display: 'bottom',
        mode: 'scroller'
    });
    $("#myTime").mobiscroll().time({
        theme: 'default',
        display: 'bottom',
        mode: 'scroller'
    });
}

function createNew_initFromLocal() {
    var sql = "SELECT * FROM Contact WHERE Id=" + localId;
    fgaDB.open();
    fgaDB.db.transaction(function(tx) {
        tx.executeSql(sql, null, function(tx, results) {
            console.log("get info from database!");
            var len = results.rows.length;
            if (isNext == 1 || len == 0) {
                $("#myDate").val(fmtDate(myContact.ConversationDate));
                $("#myTime").val(fmtTime(myContact.ConversationDate));

                setOptions(myContact.DivisionId, myContact.CompanyId);
                $("#Company").val(myContact.CompanyId);
                $("#Company").selectmenu('refresh');

                $("#District").val(myContact.DistrictId);
                $("#District").selectmenu('refresh');

                $("#Division").val(myContact.DivisionId);
                $("#Division").selectmenu('refresh');

                $("#ContactType").val(myContact.CategoryId);
                $("#ContactType").selectmenu('refresh');

                initLocationDropdowns("#selectItems", "#Division", "#Company", "#District", "#ContactType", URL_GET_DIVISIONS, URL_GET_COMPANIES, URL_GET_DISTRICTS, URL_GET_CATEGORIES);
                isNext = 0;
                if (myContact.IsDraft == 1) {
                    $("#deleteDraftBtn").show();
                }
            } else {
                var item = results.rows.item(0);
                myContact.RemoteId = item.RemoteId;
                myContact.IsDraft = item.IsDraft;
                myContact.DivisionId = item.DivisionId;
                myContact.DivisionName = item.DivisionName;
                myContact.CompanyId = item.CompanyId;
                myContact.CompanyName = item.CompanyName;
                myContact.DistrictId = item.DistrictId;
                myContact.DistrictName = item.DivisionName;
                myContact.CategoryId = item.CategoryId;
                myContact.CategoryName = item.CategoryName;
                myContact.DescriptionShort = item.DescriptionShort;
                myContact.Description = item.Description;
                myContact.SubmitterName = item.SubmitterName;
                myContact.LocationId = item.LocationId;
                myContact.LocationName = item.LocationName;
                myContact.ConversationDate = item.ConversationDate;
                myContact.Created = item.Created;
                myContact.Modified = item.Modified;

                $("#myDate").val(fmtDate(item.ConversationDate));
                $("#myTime").val(fmtTime(item.ConversationDate));

                //offline mode
                if (!isOnline) {
                    $("#Company").append('<option selected value="' + item.CompanyId + '"' + '>' + item.CompanyName + '</option>');
                    $("#Company").selectmenu('refresh');
                    $("#District").append('<option selected value="' + item.DistrictId + '"' + '>' + item.DistrictName + '</option>');
                    $("#District").selectmenu('refresh');
                    $("#Division").append('<option selected value="' + item.DivisionId + '"' + '>' + item.DivisionName + '</option>');
                    $("#Division").selectmenu('refresh');
                    $("#ContactType").append('<option selected value="' + item.CategoryId + '"' + '>' + item.CategoryName + '</option>');
                    $("#ContactType").selectmenu('refresh');
                    return;
                }
                setOptions(item.DivisionId, item.CompanyId);
                $("#Company").val(item.CompanyId);
                $("#Company").selectmenu('refresh');

                $("#District").val(item.DistrictId);
                $("#District").selectmenu('refresh');

                $("#Division").val(item.DivisionId);
                $("#Division").selectmenu('refresh');

                $("#ContactType").val(item.CategoryId);
                $("#ContactType").selectmenu('refresh');

                initLocationDropdowns("#selectItems", "#Division", "#Company", "#District", "#ContactType", URL_GET_DIVISIONS, URL_GET_COMPANIES, URL_GET_DISTRICTS, URL_GET_CATEGORIES);
                if (myContact.IsDraft == 1) {
                    $("#deleteDraftBtn").show();
                }
            }
        }, function(tx, error) {
            alert("Search infromation from Database failed:" + error.message);
        });
    });
}

$(document).on("pagebeforeshow", "#createNewPage", function() {
    //console.log("pagebeforeshow, myContact:" + myContact.CategoryName);
    //hide the delete draft button
    $("#deleteDraftBtn").hide();
    createNew_initalize();
    //isOnline = 0; //for test
    if (localId == 0 && myContact.ConversationDate == null) {
        $("#myDate").val(getCurDate());
        $("#myTime").val(getCurtime());

        //offline mode
        if (!isOnline) return;
        initLocationDropdowns("#selectItems", "#Division", "#Company", "#District", "#ContactType", URL_GET_DIVISIONS, URL_GET_COMPANIES, URL_GET_DISTRICTS, URL_GET_CATEGORIES);
    } else {
        createNew_initFromLocal();
    }
});



$(document).on("tap", "#selectItems", function(event) {
    event.preventDefault();
});

$(document).on("tap", "#stepNxtBtn", function() {
    isNext = 1;
    myContact.DivisionId = $("#Division").val();
    myContact.DivisionName = $("#Division").find("option:selected").text();
    myContact.CompanyId = $("#Company").val();
    myContact.CompanyName = $("#Company").find("option:selected").text();
    myContact.DistrictId = $("#District").val();
    myContact.DistrictName = $("#District").find("option:selected").text();
    myContact.CategoryId = $("#ContactType").val();
    myContact.CategoryName = $("#ContactType").find("option:selected").text();
    myContact.ConversationDate = dateFormat($("#myDate").val()) + "T" + timeFormat($("#myTime").val());
    console.log("next, myContact:" + myContact.CategoryName);

    if (validate_first_step(myContact)) {
        console.log("next, myContact:" + myContact.CategoryName);
        $.mobile.changePage("createNew_step2a.html");
    } else {
        alert("infomation not completed!");
    }
});

$(document).on("tap", "#deleteDraftBtn", function() {
    $("#delDraftDialog").popup('open');
});

$(document).on("tap", "#delDraftOkBtn", function() {
    var sql = "DELETE FROM Contact WHERE Id=" + localId;
    fgaDB.open();
    fgaDB.db.transaction(function(tx) {
        tx.executeSql(sql, null, function(tx, result) {
            alert("Delete draft success!");
            $("#delDraftDialog").popup("close");
            $.mobile.changePage("myDrafts.html");
        }, function(tx, error) {
            alert("Delete draft failed! Error:" + error.message);
        });
    });
    fgaDB.contactPic.deletePicById(localId);
    fgaDB.db.transaction(function(tx) {
        tx.executeSql("DELETE FROM ContactTask WHERE ContactId=?", [localId], null, fgaDB.onError);
    });
});

//confirmation when leaving current page
$(document).on("tap", "#createNewPage .leaveThisPage", function() {
    myContact.DivisionId = $("#Division").val();
    myContact.DivisionName = $("#Division").find("option:selected").text();
    myContact.CompanyId = $("#Company").val();
    myContact.CompanyName = $("#Company").find("option:selected").text();
    myContact.DistrictId = $("#District").val();
    myContact.DistrictName = $("#District").find("option:selected").text();
    myContact.CategoryId = $("#ContactType").val();
    myContact.CategoryName = $("#ContactType").find("option:selected").text();
    myContact.ConversationDate = dateFormat($("#myDate").val()) + "T" + timeFormat($("#myTime").val());
    console.log("next, myContact:" + myContact.CategoryName);
    toPage = $(this).attr("data");
    $("#saveDraftDialog1").popup('open');
});

$(document).on("tap", "#saveDraftYesBtn1", function() {
    if (!validate_first_step(myContact)) {
        alert("infomation not completed! Please complete information");
        return;
    }
    saveContact(toPage);
});

$(document).on("tap", "#saveDraftNoBtn1", function() {
    localId = 0;
    myContact = null;
    $.mobile.changePage(toPage);
});

$(document).on("tap", "#setting_logout", function() {
    accessToken = "";
    $.mobile.changePage("login.html");
});
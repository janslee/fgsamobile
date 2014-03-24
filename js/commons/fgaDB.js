var fgaDB = {};
fgaDB.contactPic = {};
fgaDB.contactLoc = {};
fgaDB.contact = {};
fgaDB.contactTask = {};

fgaDB.db = null;

fgaDB.open = function() {
    var dbSize = 50 * 1024 * 1024; // 50MB
    fgaDB.db = openDatabase("FGSA", "1.0", "fgaDB", dbSize);
};

fgaDB.dropTable = function(name) {
    if (fgaDB.db === null) {
        fgaDB.open();
    }
    fgaDB.db.transaction(function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS ' + name);
    });
};

/*----- store pic data ----*/
fgaDB.contactPic.createTable = function() {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS contactPic(Id INTEGER PRIMARY KEY AUTOINCREMENT, contactID, image1 TEXT, image2 TEXT, image3 TEXT, image4 TEXT, image5 TEXT)", []);
    });
};

fgaDB.contactPic.getPicById = function(id, callback) {
    var db = fgaDB.db;
    var pics = null;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM contactPic WHERE contactID=?", [id], function(tx, results) {
            if (results.rows.length > 0) {
                var item = results.rows.item(0);
                //pics[item.image1,item.image2, item.image3];
                pics = {
                    "image1": item.image1,
                    "image2": item.image2,
                    "image3": item.image3,
                    "image4": item.image4,
                    "image5": item.image5
                };
                //alert(pics["image1"]);

            }
            callback(pics);
        }, fgaDB.onError);
    });
};

fgaDB.contactPic.clonePicById = function(id) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("insert into contactPic (contactID, image1, image2, image3, image4, image5) select -1, image1, image2, image3, image4, image5 from contactPic where contactID = ?", [id], function(tx, results) {}, fgaDB.onError);
    });
}

fgaDB.contactPic.updatePic = function(params) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("UPDATE contactPic SET image1=?, image2=?, image3=?, image4=?, image5=? WHERE contactID=?", [nvl(params.image1), nvl(params.image2), nvl(params.image3), nvl(params.image4), nvl(params.image5), params.contactId], function(tx, results) {}, fgaDB.onError);
    });
};

fgaDB.contactPic.updatePicById = function(col, value, id) {
    var db = fgaDB.db;
    //console.log("update pic"+ col + " "+ value+ " "+ id);
    db.transaction(function(tx) {
        tx.executeSql("UPDATE contactPic SET " + col + "= ? WHERE contactID=?", [value, id], function(tx, results) {}, fgaDB.onError);
    });
};

fgaDB.contactPic.insertPic = function(params) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("insert into contactPic (contactID, image1, image2, image3, image4, image5) values (?,?,?,?,?,?)", [params.contactId, nvl(params.image1), nvl(params.image2), nvl(params.image3), nvl(params.image4), nvl(params.image5)], function(tx, results) {}, fgaDB.onError);
    });
};

fgaDB.contactPic.deletePicById = function(id, callback) {
    var db = fgaDB.db;
    //console.log("update pic"+ col + " "+ value+ " "+ id);
    db.transaction(function(tx) {
        tx.executeSql("delete from contactPic where contactID =?", [id], function(tx, results) {
            callback();
        }, fgaDB.onError);
    });
};

/*----- store location data ----*/
fgaDB.contactLoc.createTable = function() {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS contactLoc(contactID, loc1 TEXT, loc2 TEXT, loc3 TEXT, loc4 TEXT, loc5 TEXT,loc6 TEXT)", []);
    });
};

fgaDB.contactLoc.getLocById = function(id, callback) {
    var db = fgaDB.db;
    var locs = null;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM contactLoc WHERE contactID=?", [id], function(tx, results) {
            if (results.rows.length > 0) {
                var item = results.rows.item(0);
                locs = {
                    "loc1": item.loc1,
                    "loc2": item.loc2,
                    "loc3": item.loc3,
                    "loc4": item.loc4,
                    "loc5": item.loc5,
                    "loc6": item.loc6
                };
            }
            callback(locs);
        }, fgaDB.onError);
    });
};

fgaDB.contactLoc.updateLoc = function(params) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("UPDATE contactLoc SET loc1=?, loc2=?, loc3=?, loc4=?, loc5=?, loc6=? WHERE contactID=?", [params.loc1, params.loc2, params.loc3, params.loc4, params.loc5, params.loc6, params.contactId], function(tx, results) {}, fgaDB.onError);
    });
};

fgaDB.contactLoc.insertLoc = function(params) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql("insert into contactLoc (contactID, loc1, loc2, loc3, loc4, loc5, loc6) values (?,?,?,?,?,?,?)", [params.contactId, params.loc1, params.loc2, params.loc3, params.loc4, params.loc5, params.loc6], function(tx, results) {}, fgaDB.onError);
    });
};

/*----- get task data ----*/
fgaDB.contactTask.getTaskById = function(id, callback) {
    var db = fgaDB.db;
    db.transaction(function(tx) {
        tx.executeSql('SELECT * FROM ContactTask WHERE ContactId=?', [id],
            function(tx, results) {
                if (results.rows.length > 0) {
                    var item = results.rows.item(0);
                    data = {
                        "TaskName": item.TaskName,
                        "AssignedToId": item.AssignedToId,
                        "AssigneeName": item.AssigneeName
                    };
                }
                callback(data);
            }, fgaDB.onError);
    });
}

/**************** Contact API ***********************/

fgaDB.contact.getContactById = function(id, callback) {
    var db = fgaDB.db;
    var locs = null;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM Contact WHERE Id =?", [id], function(tx, results) {
            if (results.rows.length > 0) {
                var item = results.rows.item(0);
                data = {
                    "RemoteId": item.RemoteId,
                    "IsDraft": item.IsDraft,
                    "Location": item.Location,
                    "LocationId": item.locationId,
                    "CompanyId": item.CompanyId,
                    "DistrictId": item.DistrictId,
                    "DivisionId": item.DivisionId,
                    "ContactTypeId": item.ContactTypeId
                };
            }
            callback(data);
        }, fgaDB.onError);
    });
};


fgaDB.contact.getContactByRemoteId = function(RemoteId, callback) {
    var db = fgaDB.db;
    var locs = null;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM Contact WHERE RemoteId =?", [RemoteId], function(tx, results) {
            if (results.rows.length > 0) {
                var item = results.rows.item(0);
                data = {
                    "id": item.Id,
                };
            }
            callback(data);
        }, fgaDB.onError);
    });
};

fgaDB.contact.UpdateContactById = function(params) {
    var db = fgaDB.db;
    var locs = null;
    db.transaction(function(tx) {
        tx.executeSql("UPDATE Contact set IsDraft = ?, Created = ?, RemoteId = ?  WHERE Id =?", [params.IsDraft, params.Created, params.RemoteId, params.Id], function(tx, results) {}, fgaDB.onError);
    });
};

fgaDB.contact.DeleteContactById = function(params) {
    var db = fgaDB.db;
    var locs = null;
    db.transaction(function(tx) {
        tx.executeSql("DELETE FROM Contact WHERE IsDraft=? AND Id=?", [params.Created, params.RemoteId, params.Id], function(tx, results) {}, fgaDB.onError);
    });
};



fgaDB.onError = function(tx, e) {
    var errorMsg = "There has been an error: " + e.code + "" + e.message;
    alert(errorMsg);
    console.error(errorMsg);
};

var nvl = function(str) {
    var ret = str;
    //console.log(str);
    if (typeof str === 'undefined' || str.substring(0, 5) != 'data:')
        ret = "";
    return ret;
};
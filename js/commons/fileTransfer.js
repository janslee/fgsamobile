/*
$(document).on('pageshow', '#myContacts', function (event) {
    var URL = ["http://imgcache.qq.com/vipstyle/nr/box/home/pic/banner3.jpg","http://imgcache.qq.com/vipstyle/nr/box/home/pic/banner1.jpg","http://imgcache.qq.com/vipstyle/nr/box/home/pic/banner4.jpg"];
    var localfile = "test it";
    FileTF.fileDownloadCommon(URL[2], createUUID() +".jpg", function(img){console.log("@@@@File:"+localFile + "=" + img);});
});
*/
var FileTF = {};
FileTF.folderName = "TESTFGA";
FileTF.fileDownload = function(URL, fileName, callback) {
        if(device.platform === "blackberry10"){
            FileTF.BB10FileDownload(URL, fileName, callback);
        }else{
            FileTF.fileDownloadCommon(URL, fileName, callback);
        }
    };
    
FileTF.BB10FileDownload = function(URL, fileName, callback) {
        try {
            blackberry.io.sandbox = false;
            //var localFile = "/accounts/1000/shared/camera/FGA/";
            var localFolderPath = blackberry.io.home + "\/"+ FileTF.folderName +"\/";
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            //window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, success, fail);
            window.requestFileSystem(window.PERSISTENT, 0,
                function (fileSystem) {
                    console.log("gotFS");
                    //alert("a");
                    //alert(fileSystem.root.fullPath);
                    fileSystem.root.getDirectory(localFolderPath, {create: true, exclusive: false}, function (folder) {

                        //alert(folder.fullPath);
                        var filePath = localFolderPath + "\/" + fileName;
                        blackberry.io.filetransfer.download(URL, filePath, function(result){
                            alert("Download was successful");
                            console.log("isFile: " + result.isFile);
                            console.log("isDirectory: " + result.isDirectory);
                            console.log("name: " + result.name);
                            console.log("fullPath: " + result.fullPath);
                            FileTF.BB10EncodeBase64(result.fullPath, callback);
                        }, FileTF.downloadError);
                    }, function (e) {
                        console.error("failed to get folder:"+ e.message);
                    });

                }, function () {
                    console.error("failed to get filesystem");
                });

        } catch (e) {
            alert("Exception in fileDownload: " + e);
        }
    };

    //for android and ios
FileTF.fileDownloadCommon = function(url, fileName, callback){
        var filePath = "";
        try{
            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            //window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, success, fail);
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function (fileSystem) {
                    console.log("gotFS");
                    if (device.platform === "Android") {
                        //alert("a");
                        //alert(fileSystem.root.fullPath);
                        fileSystem.root.getDirectory(FileTF.folderName, {create: true, exclusive: false}, function(folder){

                            //alert(folder.fullPath);
                            filePath = folder.toURL() + "\/" + fileName;
                            //filePath = folder.fullPath + "\/" + fileName;
                            var transfer = new FileTransfer();
                            transfer.download(
                                url,
                                filePath,
                                function (entry) {
                                    alert("download success");
                                    console.log("File saved to: " + entry.fullPath);
                                    FileTF.encodeBase64(filePath, callback);
                                },
                                FileTF.downloadError);
                        }, function (e) {
                            console.error("failed to get folder:" + "[" + e.errorCode + "]" + e.message);
                        });
                    }
                    else {
                        //alert("b");
                        filePath = fileSystem.root.fullPath + "\/" + fileName;
                        var transfer = new FileTransfer();
                            transfer.download(
                                url,
                                filePath,
                                function (entry) {
                                    alert("download success");
                                    console.log("File saved to: " + entry.fullPath);
                                    FileTF.encodeBase64(filePath, callback);
                                },
                                FileTF.downloadError);
                    }


                },function (e) {
                    console.error("failed to get filesystem:" + "[" + e.errorCode + "]" + e.message);
                });
        } catch (e) {
            alert("Exception in fileDownload: " + e);
        }
    };

    //for bb10
 FileTF.BB10EncodeBase64 = function(path, callback) {
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024,
            function (fs) {
                // in order to access the shared folder,
                // config.xml must declare the "access_shared" permission
                // reference file by absolute path since file system is un-sandboxed
                fs.root.getFile(path, {create: true},
                    function (fileEntry) {
                        fileEntry.file(function (file) {
                            alert("Base64 done");
                            var reader = new FileReader();

                            reader.onloadend = function (e) {
                                var img = e.target.result;
                                //console.log(img);
                                callback(img);
                            };

                            reader.readAsDataURL(file);
                        }, function (error) {
                            alert(error.code + error.message);
                        });
                    }, function (error) {
                        alert(error.code + error.message);
                    });
            });
    };

    //for android and ios
FileTF.encodeBase64 = function (filePath, callback) {
        //alert("start");
        console.log("start==============================");
        alert(filePath);
        window.resolveLocalFileSystemURL(filePath, function(fileEntry){
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.onloadend = function (evt) {
                    alert("Base64 Done");
                    console.log("Read as data URL");
                    console.log(evt.target.result);
                    var img = evt.target.result;
                    callback(img);

                    img = null;
                };
                reader.readAsDataURL(file);
            }, function(){console.error("failed to get file entry");});
        }, function(){console.error("failed to get file");});
        console.log("end==============================");
    };

 FileTF.downloadError = function(result) {
        alert("Download failed");
        console.log("Error code: " + result.code);
        console.log("Source: " + result.source);
        console.log("Target: " + result.target);
        console.log("HTTP status: " + result.http_status);
  };




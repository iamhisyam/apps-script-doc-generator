function generateAllData() {
  const lastRow = SHEET_DATA.getLastRow();
  const dataLog = SHEET_LOG.getDataRange().getValues().filter((item, id) => id > 0)
  for (let i = 2; i <= lastRow; i++) {
    writeLog(i, dataLog)
  }
}

function generateLastRow() {
  const lastRow = SHEET_DATA.getLastRow();
  const succes = generateDocFromRow(lastRow);
  if (succes) {
    console.log("Success")
  } else {
    console.log("Failed")

  }
}

function onNewDataAdded(e) {
  Logger.log("onChange")
  Logger.log(e.changeType)
  const activeSheet = SS.getActiveSheet()

  const sheetName = activeSheet.getSheetName()


  if (sheetName === SHEET_NAME && e.changeType === "EDIT") {
    let lock = LockService.getUserLock();

    // lock in 2 minutes
    lock.tryLock(1000 * 60 * 2)
    if (lock.hasLock()) {
      generateAllData()
    }
    lock.releaseLock();

  }




}

function writeLog(row, dataLog) {
  const header = SHEET_DATA.getRange(1, 1, 1, SHEET_DATA.getLastColumn()).getDisplayValues()[0];
  const values = SHEET_DATA.getRange(row, 1, 1, SHEET_DATA.getLastColumn()).getDisplayValues()[0];

  var indexToken = header.indexOf("Token");
  const token = values[indexToken];

  const nextRow = SHEET_LOG.getLastRow() + 1

  //check if token exist on log
  if (dataLog.filter(log => log[0] === token).length == 0) {

    SHEET_LOG.getRange(nextRow, 1).setValue(token);

    const success = generateDocFromRow(row)
    SHEET_LOG.getRange(nextRow, 2).setValue("generated");
    SHEET_LOG.getRange(nextRow, 3).setValue(success ? "success" : "fail");
    if (success) {
      TFService.deleteResponse(token)
    }


  } else {
    Logger.log("Token Exist")
  }
  Logger.log(token)
}


function generateDocFromRow(row) {
  const dataTemplates = SHEET_TEMPLATE.getDataRange().getValues().filter((item, id) => id > 0);
  const valuesToMap = mappingValues(row);

  let folder, folderUrl, linkDocuments = [];

  try {


    for (var id = 0; id < dataTemplates.length; id++) {
      const rowTemplate = dataTemplates[id];

      const docId = rowTemplate[0];
      const folderId = rowTemplate[1];
      const docName = rowTemplate[2];


      var template = DriveApp.getFileById(docId);

      var newFilename = docName;

      //map the file name, subject and body
      valuesToMap.forEach(function (item) {
        const value = item.value.toUpperCase() || ""
        newFilename = newFilename.replace(item.placeholder, value)
      });
      var copydoc = template.makeCopy(newFilename, DriveApp.getFolderById(folderId));

      var doc = DocumentApp.openById(copydoc.getId());
      var body = doc.getBody();


      //Replace text based on mapping 
      valuesToMap.forEach(function (item) {

        var placeholder = item.placeholder
        var value = item.value
        var question = item.question
        Logger.log(placeholder)
        switch (item.type) {
          case "Text":
            findTextAndReplace(body, placeholder, value)
            break;
          case "TextWithQuestion":
            findTextAndReplaceWithQuestion(body, placeholder, value, question)
            break;
          case "Image":
            findTextAndReplaceWithImage(body, placeholder, value)
            break;
          case "ImageWithQuestion":
            findTextAndReplaceWithImageAndQuestion(body, placeholder, value, question)
            break;
          default:
            break;
        }
      })
      
      doc.saveAndClose();
      removeEmptyLines(copydoc.getId())
      removeEmptyRows(copydoc.getId())


      linkDocuments[id] = doc.getUrl();
      Logger.log(linkDocuments)

      // save permission as Anyone and can view
      const file = DriveApp.getFileById(doc.getId())
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

    } // end for

    // if there is no error
    return true;

  } catch (e) {
    console.log(e)
    console.error("error when generate")
    return false;
  }
}


function mappingValues(row) {
  const header = SHEET_DATA.getRange(1, 1, 1, SHEET_DATA.getLastColumn()).getDisplayValues()[0];
  const values = SHEET_DATA.getRange(row, 1, 1, SHEET_DATA.getLastColumn()).getDisplayValues()[0];

  const mapDataRange = SHEET_MAPPING.getDataRange();
  const mapDataValues = mapDataRange.getDisplayValues();

  const mapDataSelected = mapDataValues.filter(function (item) {
    const indexPlaceholder = 1;
    return item[indexPlaceholder] && item[indexPlaceholder].indexOf("##") > -1;
  });

  return mapDataSelected.map(function (item) {
    var indexData = header.indexOf(item[0]);
    var value = indexData > -1 ? values[indexData] : "";

    return {
      question: item[0],
      placeholder: item[1],
      type: item[2],
      value: value,
    }

  })
}


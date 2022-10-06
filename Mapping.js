function findTextAndReplace(body, placeholder, value) {

  body.replaceText(placeholder, value || "")
}

function findTextAndReplaceWithQuestion(body, placeholder, value, question) {
  var element = body.findText(placeholder)
  if (!element) return;

  try {
    if (value) {

      element = element.getElement().getParent().asParagraph();
      element.clear()
      element = element.appendText(question).getParent().asParagraph();
      element = element.appendText("\r" + value).setBold(true);

    } else {
      body.replaceText(placeholder, "")

    }
  } catch (e) {
    console.error("Error when findTextAndReplaceWithQuestion")
  }

}


function findTextAndReplaceWithImage(body, placeholder, url) {

  var element = body.findText(placeholder)
  if (!element) return;

  if (!url) {
    body.replaceText(placeholder, "")
    return;

  }

  try {

    var blob = UrlFetchApp.fetch(url).getBlob();
    var pImage = body.findText(placeholder).getElement().getParent().asParagraph();
    pImage.clear();
    pImage = pImage.appendInlineImage(blob);
    const pWidth = pImage.getWidth();
    const pHeight = pImage.getHeight();
    const ratio = pWidth / pHeight;
    let newW = pWidth;
    let newH = pHeight;
    Logger.log(ratio)
    if (pWidth > 500) {
      newW = 500;
      newH = parseInt(newW / ratio);

      if (newH > 650) {
        newH = 650
        newW = parseInt(newH * ratio)
      }
    }
    pImage.setWidth(newW).setHeight(newH)
  } catch (e) {

    throw "error when findTextAndReplaceWithImage"
  }



}

function findTextAndReplaceWithImageAndQuestion(body, placeholder, url, question) {

  var element = body.findText(placeholder)
  if (!element) return;

  if (!url) {
    body.replaceText(placeholder, "")
    return;

  }


  try {
    var blob = UrlFetchApp.fetch(url).getBlob();
    Logger.log(url)
    if (blob.getContentType() === MimeType.JPEG || blob.getContentType() === MimeType.PNG) {
      var element = body.findText(placeholder).getElement().getParent().asParagraph();
      element.clear();
      //element = element.appendPageBreak().getParent().asParagraph();
      element = element.appendText(question + "\r").getParent().asParagraph();
      element = element.appendInlineImage(blob);
      const pWidth = element.getWidth();
      const pHeight = element.getHeight();
      const ratio = pWidth / pHeight;
      let newW = pWidth;
      let newH = pHeight;
      Logger.log(ratio)
      if (pWidth > 500) {
        newW = 500;
        newH = parseInt(newW / ratio);

        if (newH > 500) {
          newH = 500
          newW = parseInt(newH * ratio)
        }
      }
      element.setWidth(newW).setHeight(newH)
    }
  } catch (e) {
    //body.replaceText(placeholder, url)

    throw "error when findTextAndReplaceWithImageAndQuestion"
  }


}


function removeEmptyLinesOld(id) {
  var doc = DocumentApp.openById(id);
  var body = doc.getBody()
  var paragraphs = body.getParagraphs();
  var paragraph;
  for (var i = 0; i < paragraphs.length - 1; i++) {
    paragraph = paragraphs[i];
    if (paragraph.getText() === '') {
      Logger.log(i)
      paragraph.removeFromParent()
    } else {
      Logger.log(paragraph.getText())
    }
  }
  doc.saveAndClose();
}



function removeEmptyLines(id) {
  var doc = DocumentApp.openById(id);
  var body = doc.getBody()
  var pars = body.getParagraphs();
  // for each paragraph in the active document...
  pars.forEach(function (e, i) {
    console.log(i)
    // does the paragraph contain an image or a horizontal rule?
    // (you may want to add other element types to this check)
    no_img = e.findElement(DocumentApp.ElementType.INLINE_IMAGE) === null;
    no_rul = e.findElement(DocumentApp.ElementType.HORIZONTAL_RULE) === null;
    // proceed if it only has text
    if (no_img && no_rul) {
      // clean up paragraphs that only contain whitespace
      e.replaceText("^\\s+$", "")
      // remove blank paragraphs
      if (e.getText() === "") {
        if (i < pars.length - 1)
          e.removeFromParent();
      }
    }
  })
  doc.saveAndClose();

}


/**
 * Remove all the empty rows from all the tables in a document
 *
 * @param {String} documentId
 */

function removeEmptyRows(id) {

  var doc = DocumentApp.openById(id);
  var body = doc.getBody()
  var tables = body.getTables()

  tables.forEach(function (table) {

    var numberOfRows = table.getNumRows()

    for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {

      var nextRow = table.getRow(rowIndex)
      var numberOfColumns = nextRow.getNumCells()

      // A row is assumed empty until proved otherwise
      var foundEmptyRow = true

      for (var columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {

        if (nextRow.getCell(columnIndex).getText() !== '') {
          foundEmptyRow = false
          break
        }

      } // for each column

      if (foundEmptyRow) {
        table.removeRow(rowIndex)
        numberOfRows--
        rowIndex--
      }

    } // For each row

    if (numberOfRows == 1) {
      table.removeFromParent();
    }
  })

  doc.saveAndClose();

} // removeEmptyRows() 

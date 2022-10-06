var TYPEFORM_ACCESS_TOKEN = "SECRET"
var TYPEFORM_URL = "https://api.typeform.com"
var FORM_ID = "SECRET"

var TFService = new Typeform(TYPEFORM_ACCESS_TOKEN);

function Typeform(key) {
  this.key = key;
  this.request = request;
  this.getResponse = getResponse;
  this.deleteResponse = deleteResponse;

  function getResponse(response_ids) {
    const endpoint = "forms/" + FORM_ID + "/responses?included_response_ids=" + response_ids
    const response = request(endpoint, "get")
    return response;
  }

  function deleteResponse(response_ids) {
    const endpoint = "forms/" + FORM_ID + "/responses?included_response_ids=" + response_ids
    const response = request(endpoint, "delete")
    return response;

  }

  function request(endpoint, method) {
    const url = TYPEFORM_URL + "/" + endpoint;
    Logger.log(url)
    const response = UrlFetchApp.fetch(
      url,
      {
        method: method,
        headers: {
          "Authorization": "Bearer " + key,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        muteHttpExceptions: true
      }
    )

    // console.log(response.getContentText())
    // console.log(response.getResponseCode())

   
    const responseCode = response.getResponseCode();
    const success = (responseCode >= 200 || responseCode <= 204)

    if (!success) {
      const { description, code, } = JSON.parse(response.getContentText())
      return { success, message: description }
    }
     

    if (method === "delete") {
      return {
        success: success
      }
    }

    const content = JSON.parse(response.getContentText())

    return {
      success: success,
      data: content

    };
  }
}


function test() {
  const tfService = new Typeform(TYPEFORM_ACCESS_TOKEN);
  // const images = tfService.request("images","get")
  // Logger.log(images)
  //const images = tfService.request("images","get")
  const response = tfService.deleteResponse("94gv17yb9p1k85nl2k0s494gv17yunrq")
  console.log(response)
}


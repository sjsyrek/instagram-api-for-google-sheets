"use strict";

/**
 * Instagram API for Google Sheets
 *
 * @name main.gs
 * @author Steven J. Syrek
 * @file An Add-on for Google Sheets for using the Instagram API.
 * @license ISC
 */

/**
 * Create convenience variables for accessing the Google Sheets interface and setup the
 * Add-on menu.
 */
var ss = SpreadsheetApp;
var sheet = ss.getActiveSheet();
var ui = ss.getUi();
var onInstall = function onInstall(e) {
  return onOpen(e);
};
var onOpen = function onOpen() {
  ui.createAddonMenu().addItem("Authorize", "auth").addItem("Deauthorize", "deauth").addSeparator().addSubMenu(ui.createMenu("Users").addItem("Get data about me", "usersSelf").addItem("Get data about a user", "usersUserId").addItem("Get my recent posts", "usersSelfMediaRecent").addItem("Get a user's recent posts", "usersUserIdMediaRecent").addItem("Get the posts I recently liked", "usersSelfMediaLiked").addItem("Search for a user by name", "usersSearch")).addSubMenu(ui.createMenu("Relationships").addItem("Get the list of users I follow", "usersSelfFollows").addItem("Get the list of users who follow me", "usersSelfFollowedBy").addItem("List the users who have requested to follow me", "usersSelfRequestedBy").addItem("Get information about my relationship with a user", "usersUserIdRelationship")).addSubMenu(ui.createMenu("Media").addItem("Get information about a post", "mediaMediaId").addItem("Search for recent media in a given area", "mediaSearch")).addSubMenu(ui.createMenu("Comments").addItem("Get a list of recent comments made on a post", "mediaMediaIdComments")).addSubMenu(ui.createMenu("Likes").addItem("Get a list users who have liked a post", "mediaMediaIdLikes")).addSubMenu(ui.createMenu("Tags").addItem("Get information about a hashtag", "tagsTagName").addItem("Get a the posts recently tagged with a hashtag", "tagsTagNameMediaRecent").addItem("Search for a hashtag by name", "tagsSearch")).addSubMenu(ui.createMenu("Locations").addItem("Get information about a location", "locationsLocationId").addItem("Get a list of recent posts from a given location", "locationsLocationIdMediaRecent").addItem("Search for a location by geographic coordinates", "locationsSearch")).addToUi();
};

/**
 * Insert data into the spreadsheet.
 * @param {*} data - The data to insert.
 */
var insert = function insert(data) {
  return data.forEach(function (page) {
    return setValue(page);
  });
};

/**
 * Set the values for a range of cells.
 * @param {Object[]} page - A page of data, consisting of objects and arrays.
 */
var setValue = function setValue(page) {
  var values = [];
  if (Array.isArray(page)) {
    page.forEach(function (item) {
      return values = values.concat(getValues(item));
    });
  } else {
    values = getValues(page);
  }
  var rowsToAdd = values.length;
  if (rowsToAdd === 0) {
    return;
  }
  var cell = sheet.getActiveCell();
  var row = cell.getRow();
  var column = cell.getColumn();
  var maxRow = sheet.getMaxRows();
  if (maxRow - row < rowsToAdd) {
    sheet.insertRowsAfter(maxRow, rowsToAdd - (maxRow - row));
  }
  var range = sheet.getRange(row, column, rowsToAdd, 2);
  range.setValues(values);
};

/**
 * Get the values from an item of data (including nested objects) and package into an array.
 * @param {Object} item - The item to package.
 * @return {Object[]} values - The array of values to insert into the spreadsheet.
 */
var getValues = function getValues(item) {
  var values = [];
  for (prop in item) {
    if (typeof item[prop] === "object") {
      values.push([prop + ":", ""]);
      values = values.concat(getValues(item[prop]));
    } else {
      values.push([prop, item[prop]]);
    }
  }
  return values;
};

/**
 * Generate sanitized HTML content.
 * @param {string} input - The text to sanitize.
 */
var makeHtml = function makeHtml(input) {
  return HtmlService.createHtmlOutput(input);
};

/**
 * Display a dialog box that requests information from the user.
 * @param {string} prompt - The prompt to display in the dialog box.
 * @return {string} info - An URL encoded string to include as a parameter in an API request.
 */
var getInfo = function getInfo(prompt) {
  var info = "";
  var response = ui.prompt(prompt, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() === ui.Button.OK) {
    info = encodeURIComponent(response.getResponseText());
  } else {
    info = -1;
  }
  return info;
};

/**
 * Display a dialog box that requests an Instagram user ID from the user.
 * @return {string} userId - The user ID.
 */
var getUserId = function getUserId() {
  return getInfo("Enter a user ID number:");
};

/**
 * Display a dialog box that requests an Instagram media ID from the user.
 * @return {string} mediaId - The media ID.
 */
var getMediaId = function getMediaId() {
  return getInfo("Enter the media ID number of a post:");
};

/**
 * Display a dialog box that requests an Instagram tag name from the user.
 * @return {string} tag - The tag name.
 */
var getTagName = function getTagName() {
  return getInfo("Enter a hashtag:");
};

/**
 * Display a dialog box that requests an Instagram location ID from the user.
 * @return {string} locationId - The location ID.
 */
var getLocationId = function getLocationId() {
  return getInfo("Enter a location ID number:");
};

/**
 * Display a dialog box that asks the user to specify how many items to return.
 * @return {string} count - The number of items to return.
 */
var getCount = function getCount() {
  return getInfo("Enter the number of resources to return (leave blank to return default):");
};

/**
 * Check whether a given input is an empty string.
 * @param {*} input - The input to validate.
 * @return {boolean} - True if the input is not an empty string, false otherwise.
 */
var validate = function validate(input) {
  return includes([undefined, null, NaN, "", -1], input) ? false : true;
};

/**
 * Array.includes polyfill to determine whether an array contains a specified element.
 * @param {Object[]} array - An array to check.
 * @param {*} searchElement - The element to search for.
 * @param {number=} fromIndex - An optional index to search from.
 * @return {boolean} - True if the array contains the element, false otherwise.
 */
var includes = function includes(array, searchElement) {
  var fromIndex = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var O = Object(array);
  var len = parseInt(O.length, 10) || 0;
  if (len === 0) {
    return false;
  }
  var n = parseInt(fromIndex);
  var k = void 0;
  if (n >= 0) {
    k = n;
  } else {
    k = len + n;
    if (k < 0) {
      k = 0;
    }
  }
  var currentElement = void 0;
  while (k < len) {
    currentElement = O[k];
    if (searchElement === currentElement) {
      return true;
    } // NaN !== NaN
    k++;
  }
  return false;
};

/**
 * Authorization functions
 * Adapted from https://github.com/googlesamples/apps-script-oauth2
 *
 * Generate an OAuth2 flow for Instagram.
 * @return {OAuth2} - The authorization service object.
 */
var getInstagramService = function getInstagramService() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var clientId = scriptProperties.getProperty("CLIENT_ID");
  var clientSecret = scriptProperties.getProperty("CLIENT_SECRET");
  var scopes = ["basic", "public_content", "follower_list", "comments", "relationships", "likes"];
  return OAuth2.createService("INSTAGRAM_SERVICE").setAuthorizationBaseUrl("https://api.instagram.com/oauth/authorize/").setTokenUrl("https://api.instagram.com/oauth/access_token").setClientId(clientId).setClientSecret(clientSecret).setScope(scopes).setCallbackFunction("authCallback").setPropertyStore(PropertiesService.getUserProperties());
};

/**
 * Execute authorization flow and attempt to authorize this app with Instagram.
 */
var auth = function auth() {
  var igService = getInstagramService();
  if (!igService.hasAccess()) {
    var authorizationUrl = igService.getAuthorizationUrl();
    var html = "<a href=\"" + authorizationUrl + "\" target=\"_blank\">Click here to Authorize</a>.\n      This will open a new tab. You may close this sidebar when authorization is complete.";
    ui.showSidebar(makeHtml(html));
  } else {
    ui.alert("This app is already authorized.");
  }
};

/**
 * Inform the user whether authorization with Instagram was successful.
 * @param {string} request - The URL returned by Instagram.
 */
var authCallback = function authCallback(request) {
  var igService = getInstagramService();
  var isAuthorized = igService.handleCallback(request);
  if (isAuthorized) {
    return makeHtml("Success! You may close this tab.");
  } else {
    return makeHtml("Denied. You may close this tab");
  }
};

/**
 * Deauthorize this application from Instagram.
 */
var deauth = function deauth() {
  var igService = OAuth2.createService("INSTAGRAM_SERVICE").setPropertyStore(PropertiesService.getUserProperties()).reset();
  var msg = "Access deauthorized.";
  ui.alert(msg);
};

/**
 * Put together an URL fetch request.
 * @param {string} endpoint - The name of the Instagram endpoint to fetch data from.
 * @param {Object} [params={}] - Optional parameters to pass to Instagram with the fetch request.
 * @return {Array} data - Paginated data, one page per array entry.
 */
var request = function request(endpoint) {
  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var igService = getInstagramService();
  var accessToken = igService.getAccessToken();
  var baseUrl = "https://api.instagram.com/v1/";
  var paramString = parseParams(params);
  var requestUrl = baseUrl + endpoint + paramString + ("access_token=" + accessToken);
  var data = getJson(requestUrl);
  return data;
};

/**
 * Convert a parameter object into an URL fragment containing the encoded parameters.
 * The object specifying the value 50 for the parameter 'count' would be: { count: 50 }
 * @param {Object} params - An object containing parameters for an Instagram API request.
 * @return {string} - An URL fragment containing the encoded parameters.
 */
var parseParams = function parseParams(params) {
  var paramString = "?";
  var keys = Object.keys(params);
  if (keys.length === 0) {
    return paramString;
  }
  var f = function f(p, c) {
    return p + c + "=" + params[c] + "&";
  };
  return keys.reduce(f, paramString);
};

/**
 * Retrieve JSON data from the Instagram API and paginate it, if necessary.
 * @param {string} url - The URL to use in the fetch request.
 * @return {Array} - Paginated data, one page per array entry.
 */
var getJson = function getJson(url) {
  var json = fetch(url);
  var data = [json.data];
  return json.hasOwnProperty("pagination") ? data.concat(paginate(json.pagination)) : data;
};

/**
 * Execute a request against the Instagram API, parse the result into JSON, display an error if
 * there is one, and otherwise the data.
 * @param {string} url - The URL to use in the fetch request.
 * @return {Object} - The JSON object containing the data sent back from Instagram.
 */
var fetch = function fetch(url) {
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var json = JSON.parse(response);
  if (json.meta.code !== 200) {
    error(json.meta);
  }
  return json;
};

/**
 * Iteratively request data from Instagram until there are no more pages and return the result.
 * @param {Object} - The 'pagination' field from a response envelope returned by Instagram.
 * @return {Array} - Paginated data, one page per array entry.
 */
var paginate = function paginate(pag) {
  return pag.hasOwnProperty("next_url") ? getJson(pag.next_url) : [];
};

/**
 * Display a dialog box if the Instagram API returns an error after a request.
 * @param {Object} meta - The 'meta' field from a response envelope returned by Instagram.
 */
var error = function error(meta) {
  var title = "Instagram error " + meta.code;
  var msg = meta.error_type + ": " + meta.error_message;
  ui.alert(title, msg, ui.ButtonSet.OK);
};

/**
 * Endpoint functions. Each endpoint in the Instagram API has a corresponding function here.
 * A request looks like this:
 * https://api.instagram.com/v1/{ENDPOINT}?[{PARAMETERS}&]access_token={ACCESS_TOKEN}
 * Example without parameters:
 * https://api.instagram.com/v1/users/self?access_token=123456789.abcdefg.xxxxxx
 * Example with parameters:
 * https://api.instagram.com/v1/users/search?q=Steven%20Syrek&access_token=123456789.abcdefg.xxxxxx
 * See https://www.instagram.com/developer/endpoints/ for Instagram's complete API documentation.
 * Each function below makes an API request to a specific endpoint, which is passed to the 'request'
 * function along with any parameters, if required. If data is returned, it is then passed to the
 * 'insert' function for handling.
 */

var usersSelf = function usersSelf() {
  return insert(request("users/self"));
};

var usersUserId = function usersUserId() {
  var userId = getUserId();
  if (validate(userId)) {
    insert(request("users/" + userId));
  }
};

var usersSelfMediaRecent = function usersSelfMediaRecent() {
  var count = getCount();
  if (count === -1) {
    return;
  }
  if (!validate(count) || count <= 0) {
    insert(request("users/self/media/recent"));
  } else {
    insert(request("users/self/media/recent", { count: count }));
  }
};

var usersUserIdMediaRecent = function usersUserIdMediaRecent() {
  var userId = getUserId();
  if (validate(userId)) {
    var count = getCount();
    if (count === -1) {
      return;
    }
    if (!validate(count) || count <= 0) {
      insert(request("users/" + userId + "/media/recent"));
    } else {
      insert(request("users/" + userId + "/media/recent", { count: count }));
    }
  }
};

var usersSelfMediaLiked = function usersSelfMediaLiked() {
  var count = getCount();
  if (count === -1) {
    return;
  }
  if (!validate(count) || count <= 0) {
    insert(request("users/self/media/liked"));
  } else {
    insert(request("users/self/media/liked", { count: count }));
  }
};

var usersSearch = function usersSearch() {
  var name = getInfo("Enter a name to search for:");
  if (validate(name)) {
    var count = getCount();
    if (count === -1) {
      return;
    }
    if (!validate(count) || count <= 0) {
      insert(request("users/search", { q: name }));
    } else {
      insert(request("users/search", { q: name, count: count }));
    }
  }
};

var usersSelfFollows = function usersSelfFollows() {
  return insert(request("users/self/follows"));
};

var usersSelfFollowedBy = function usersSelfFollowedBy() {
  return insert(request("users/self/followed-by"));
};

var usersSelfRequestedBy = function usersSelfRequestedBy() {
  return insert(request("users/self/requested-by"));
};

var usersUserIdRelationship = function usersUserIdRelationship() {
  var userId = getUserId();
  if (validate(userId)) {
    insert(request("users/" + userId + "/relationship"));
  }
};

var mediaMediaId = function mediaMediaId() {
  var mediaId = getMediaId();
  if (validate(mediaId)) {
    insert(request("media/" + mediaId));
  }
};

var mediaSearch = function mediaSearch() {
  var lat = getInfo("Enter a latitude on which to center the search:");
  if (!validate(lat)) {
    return;
  }
  var lng = getInfo("Enter a longitude on which to center the search:");
  if (!validate(lng)) {
    return;
  }
  var dist = getInfo("Enter the radial distance to search (default is 1 km, maximum is 5 km):");
  if (dist === -1) {
    return;
  }
  var params = {};
  if (dist <= 0) {
    dist = 1;
  }
  if (dist > 5000) {
    dist = 5000;
  }
  if (dist !== "" && dist !== 1000) {
    params.distance = dist;
  }
  params.lat = lat;
  params.lng = lng;
  insert(request("media/search", { params: params }));
};

var mediaMediaIdComments = function mediaMediaIdComments() {
  var mediaId = getMediaId();
  if (validate(mediaId)) {
    insert(request("media/" + mediaId + "/comments"));
  }
};

var mediaMediaIdLikes = function mediaMediaIdLikes() {
  var mediaId = getMediaId();
  if (validate(mediaId)) {
    insert(request("media/" + mediaId + "/likes"));
  }
};

var tagsTagName = function tagsTagName() {
  var tagName = getTagName();
  if (validate(tagName)) {
    insert(request("tags/" + tagName));
  }
};

var tagsTagNameMediaRecent = function tagsTagNameMediaRecent() {
  var tagName = getTagName();
  if (validate(tagName)) {
    var count = getCount();
    if (count === -1) {
      return;
    }
    if (!validate(count) || count <= 0) {
      insert(request("tags/" + tagName + "/media/recent"));
    } else {
      insert(request("tags/" + tagName + "/media/recent", { count: count }));
    }
  }
};

var tagsSearch = function tagsSearch() {
  var tag = getInfo("Enter a hashtag to search for:");
  if (validate(tag)) {
    insert(request("tags/search", { q: tag }));
  }
};

var locationsLocationId = function locationsLocationId() {
  var locationId = getLocationId();
  if (validate(locationId)) {
    insert(request("locations/" + locationId));
  }
};

var locationsLocationIdMediaRecent = function locationsLocationIdMediaRecent() {
  var locationId = getLocationId();
  if (validate(locationId)) {
    insert(request("locations/" + locationId + "/media/recent"));
  }
};

var locationsSearch = function locationsSearch() {
  var lat = getInfo("Enter a latitude on which to center the search:");
  if (!validate(lat)) {
    return;
  }
  var lng = getInfo("Enter a longitude on which to center the search:");
  if (!validate(lng)) {
    return;
  }
  var dist = getInfo("Enter the radial distance to search (default is 500 m, maximum is 750 m):");
  if (dist === -1) {
    return;
  }
  var params = {};
  if (dist <= 0) {
    dist = 1;
  }
  if (dist > 750) {
    dist = 750;
  }
  if (dist !== "" && dist !== 500) {
    params.distance = dist;
  }
  params.lat = lat;
  params.lng = lng;
  insert(request("locations/search", params));
};

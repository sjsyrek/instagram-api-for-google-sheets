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
const ss = SpreadsheetApp;
const sheet = ss.getActiveSheet();
const ui = ss.getUi();
const onInstall = (e) => onOpen(e);
const onOpen = () => {
  ui.createAddonMenu().addItem(`Authorize`, `auth`)
    .addItem(`Deauthorize`, `deauth`)
    .addSeparator()
    .addSubMenu(ui.createMenu(`Users`)
      .addItem(`Get data about me`, `usersSelf`)
      .addItem(`Get data about a user`, `usersUserId`)
      .addItem(`Get my recent posts`, `usersSelfMediaRecent`)
      .addItem(`Get a user's recent posts`, `usersUserIdMediaRecent`)
      .addItem(`Get the posts I recently liked`, `usersSelfMediaLiked`)
      .addItem(`Search for a user by name`, `usersSearch`))
    .addToUi();
}

/**
 * Insert data into the spreadsheet.
 * @param {*} data - The data to insert.
 */
const insert = data => data.forEach(page => setValue(page));

/**
 * Set the values for a range of cells.
 * @param {Object[]} page - A page of data, consisting of objects and arrays.
 */
const setValue = page => {
  let values = [];
  if (Array.isArray(page)) { page.forEach(item => values = values.concat(getValues(item))); }
  else { values = getValues(page); }
  let rowsToAdd = values.length;
  if (rowsToAdd === 0) { return; }
  let cell = sheet.getActiveCell();
  let row = cell.getRow();
  let column = cell.getColumn();
  let maxRow = sheet.getMaxRows();
  if (maxRow - row < rowsToAdd) { sheet.insertRowsAfter(maxRow, rowsToAdd - (maxRow - row)); }
  let range = sheet.getRange(row, column, rowsToAdd, 2);
  range.setValues(values);
}

/**
 * Get the values from an item of data (including nested objects) and package into an array.
 * @param {Object} item - The item to package.
 * @return {Object[]} values - The array of values to insert into the spreadsheet.
 */
const getValues = item => {
  let values = [];
  for (prop in item) {
    if (typeof item[prop] === `object`) {
      values.push([`${prop}:`, ``]);
      values = values.concat(getValues(item[prop]));
    }
    else { values.push([prop, item[prop]]); }
  }
  return values;
}

/**
 * Generate sanitized HTML content.
 * @param {string} input - The text to sanitize.
 */
const makeHtml = input => HtmlService.createHtmlOutput(input);

/**
 * Display a dialog box that requests information from the user.
 * @param {string} prompt - The prompt to display in the dialog box.
 * @return {string} info - An URL encoded string to include as a parameter in an API request.
 */
const getInfo = prompt => {
  let info = ``;
  const response = ui.prompt(prompt, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() === ui.Button.OK) {
    info = encodeURIComponent(response.getResponseText());
  }
  return info;
}

/**
 * Display a dialog box that requests an Instagram user ID from the user.
 * @return {string} userId - The user ID.
 */
const getUserId = () => {
  const userId = getInfo(`Enter a User ID number:`);
  if (userId !== ``) {
    return userId;
  }
}

/**
 * Check whether a given input is a non-empty string.
 * @param {*} input - The input to validate.
 * @return {boolean} - True if the input is a non-empty string, false otherwise.
 */
const validate = input => typeof input === `string` && input !== `` ? true : false;

/**
 * Authorization functions
 * Adapted from https://github.com/googlesamples/apps-script-oauth2
 *
 * Generate an OAuth2 flow for Instagram.
 * @return {OAuth2} - The authorization service object.
 */
const getInstagramService = () => {
  const scriptProperties = PropertiesService.getScriptProperties();
  const clientId = scriptProperties.getProperty(`CLIENT_ID`);
  const clientSecret = scriptProperties.getProperty(`CLIENT_SECRET`);
  const scopes = [`basic`, `public_content`, `follower_list`, `comments`, `relationships`, `likes`];
  return OAuth2.createService(`INSTAGRAM_SERVICE`)
      .setAuthorizationBaseUrl(`https://api.instagram.com/oauth/authorize/`)
      .setTokenUrl(`https://api.instagram.com/oauth/access_token`)
      .setClientId(clientId)
      .setClientSecret(clientSecret)
      .setScope(scopes)
      .setCallbackFunction(`authCallback`)
      .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Execute authorization flow and attempt to authorize this app with Instagram.
 */
const auth = () => {
  const igService = getInstagramService();
  if (!igService.hasAccess()) {
    const authorizationUrl = igService.getAuthorizationUrl();
    const html = `<a href="${authorizationUrl}" target="_blank">Click here to Authorize</a>.
      This will open a new tab. You may close this sidebar when authorization is complete.`;
    ui.showSidebar(makeHtml(html));
  } else {
    ui.alert(`This app is already authorized.`);
  }
}

/**
 * Inform the user whether authorization with Instagram was successful.
 * @param {string} request - The URL returned by Instagram.
 */
const authCallback = request => {
  const igService = getInstagramService();
  const isAuthorized = igService.handleCallback(request);
  if (isAuthorized) {
    return makeHtml(`Success! You may close this tab.`);
  } else {
    return makeHtml(`Denied. You may close this tab`);
  }
}

/**
 * Deauthorize this application from Instagram.
 */
const deauth = () => {
  const igService = OAuth2.createService(`INSTAGRAM_SERVICE`)
    .setPropertyStore(PropertiesService.getUserProperties())
    .reset();
  const msg = `Access deauthorized.`;
  ui.alert(msg);
}

/**
 * Put together an URL fetch request.
 * @param {string} endpoint - The name of the Instagram endpoint to fetch data from.
 * @param {Object} [params={}] - Optional parameters to pass to Instagram with the fetch request.
 * @return {Array} data - Paginated data, one page per array entry.
 */
const request = (endpoint, params = {}) => {
  const igService = getInstagramService();
  const accessToken = igService.getAccessToken();
  const baseUrl = `https://api.instagram.com/v1/`;
  const paramString = parseParams(params);
  const requestUrl = baseUrl + endpoint + paramString + `access_token=${accessToken}`;
  const data = getJson(requestUrl);
  return data;
}

/**
 * Convert a parameter object into an URL fragment containing the encoded parameters.
 * The object specifying the value 50 for the parameter 'count' would be: { count: 50 }
 * @param {Object} params - An object containing parameters for an Instagram API request.
 * @return {string} - An URL fragment containing the encoded parameters.
 */
const parseParams = params => {
  const paramString = `?`;
  const keys = Object.keys(params);
  if (keys.length === 0) { return paramString; }
  const f = (p, c) => `${p + c}=${params[c]}&`;
  return keys.reduce(f, paramString);
}

/**
 * Retrieve JSON data from the Instagram API and paginate it, if necessary.
 * @param {string} url - The URL to use in the fetch request.
 * @return {Array} - Paginated data, one page per array entry.
 */
const getJson = url => {
  const json = fetch(url);
  const data = [json.data];
  return json.hasOwnProperty(`pagination`) ? data.concat(paginate(json.pagination)) : data;
}

/**
 * Execute a request against the Instagram API, parse the result into JSON, display an error if
 * there is one, and otherwise the data.
 * @param {string} url - The URL to use in the fetch request.
 * @return {Object} - The JSON object containing the data sent back from Instagram.
 */
const fetch = url => {
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  const json = JSON.parse(response);
  if (json.meta.code !== 200) { error(json.meta); }
  return json;
}

/**
 * Iteratively request data from Instagram until there are no more pages and return the result.
 * @param {Object} - The 'pagination' field from a response envelope returned by Instagram.
 * @return {Array} - Paginated data, one page per array entry.
 */
const paginate = pag => pag.hasOwnProperty(`next_url`) ? getJson(pag.next_url) : [];

/**
 * Display a dialog box if the Instagram API returns an error after a request.
 * @param {Object} meta - The 'meta' field from a response envelope returned by Instagram.
 */
const error = meta => {
  const title = `Instagram error ${meta.code}`;
  const msg = `${meta.error_type}: ${meta.error_message}`;
  ui.alert(title, msg, ui.ButtonSet.OK);
}

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

const usersSelf = () => insert(request(`users/self`));

const usersUserId = () => {
  const userId = getUserId();
  if (validate(userId)) { insert(request(`users/${userId}`)); }
}

const usersSelfMediaRecent = () => insert(request(`users/self/media/recent`));

const usersUserIdMediaRecent = () => {
  const userId = getUserId();
  if (validate(userId)) { insert(request(`users/${userId}/media/recent`)); }
}

const usersSelfMediaLiked = () => insert(request(`users/self/media/liked`));

const usersSearch = () => {
  const name = getInfo(`Enter a name to search for:`);
  if (validate(name)) { insert(request(`users/search`, {q: name})); }
}

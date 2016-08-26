[![ISC licensed](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE.txt)
# Instagram API for Google Sheets

A Google Sheets Add-on for working with Instagram data. This app provides functions for accessing all public Instagram API endpoints (GET operations only). See the [Instagram developer documentation](https://www.instagram.com/developer/) for details.

The source code is in ECMAScript 2015, which must be transpiled with [Babel](https://babeljs.io) to work as a [Google Apps Script](https://developers.google.com/apps-script/). Original source and transpiled code are both provided in this repository. Developed using the [node-google-apps-script] (https://www.npmjs.com/package/node-google-apps-script) npm package. Source code is documented following [JSDoc](http://usejsdoc.org) conventions.

In order to run this code yourself, you will need to do the following:

- Create a new standalone [Google Apps Script](https://www.google.com/script/start/) project.
- Create a new project in the [Google Developers Console](https://console.developers.google.com).
- Associate the project with your script (Resources: Developers Console Project).
- Activate the Drive API in the Developers Console.
- Activate the Drive API in your script (Resources: Advanced Google Services).
- Include the [OAuth2 for Apps Script](https://github.com/googlesamples/apps-script-oauth2) library in your script project (Resources: Libraries).
- [Register as a developer](https://www.instagram.com/developer/) with Instagram if you haven't already.
- Register a new client with Instagram for using the API with your script.
- Set the Redirect URI in your client to "https://script.google.com/macros/d/{ID}/usercallback" where ID is _not_ the project key in either your project properties or your script's URL (even though it's supposed to be), but is whatever value is included in the respective URL returned by the `getRedirectUri()` method of the `OAuth2` object created by the `getInstagramService()` function. You will have to use console logging to figure this out. This is an [open issue](https://code.google.com/p/google-apps-script-issues/issues/detail?id=6098) with Apps Script, so there's unfortunately no way around it.
  - Update 2016-08-26: [the issue](https://code.google.com/p/google-apps-script-issues/issues/detail?id=6098) has now been fixed and you could obtain the ID by executing `ScriptApp.getScriptId()`. See [this comment](https://code.google.com/p/google-apps-script-issues/issues/detail?id=6098#c2) for further details.
- Create two script properties, CLIENT_ID and CLIENT_SECRET, in your project (File: Project properties) and set them to the appropriate values generated for your Instagram client. Note that Instagram does not require the client secret as part of the authentication process, but the Google OAuth2 library will not work without it. C'est la vie.
- Paste the _transpiled ES5 code_ into your script file or upload it using node-google-apps-script (see above).
- Test the application as an Add-on (Publish: Test as add-on).

Note that on June 1, Instagram changed its API and now requires apps to undergo review before they can access most data. Until an app is approved, it operates in Sandbox mode and can only access the data of a limited set of invited users. Unfortunately, that severely limits the usefulness of this code as is, but you may be able to incorporate it into a more ambitious project that is capable of meeting Instagram's requirements for going live. Good luck with that.

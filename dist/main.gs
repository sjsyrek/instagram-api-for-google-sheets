'use strict';

var ui = SpreadsheetApp.getUi();

var onInstall = function onInstall(e) {
  return onOpen(e);
};

var onOpen = function onOpen() {
  ui.getMenu().addSubMenu(ui.createMenu('Setup').addItem('Authenticate'));
};

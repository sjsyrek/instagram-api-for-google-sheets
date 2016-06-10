const ui = SpreadsheetApp.getUi();

const onInstall = e => onOpen(e);

const onOpen = () => {
  ui.getMenu().addSubMenu(ui.createMenu('Setup')
              .addItem('Authenticate'));
}

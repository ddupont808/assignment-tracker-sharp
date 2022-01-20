/* global chrome */
var text;

function fetchNotes(cb) {
  chrome.storage.local.get(['epoch', 'notes'], (localData) => {
    chrome.storage.sync.get(['epoch', 'notes'], (syncData) => {
      return cb((localData.epoch || 0) > (syncData.epoch || 0) ? localData : syncData);
    });
  });
}

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'assignmentTrackerPage',
    contexts: ['page'],
    title: "Link current page to Assignment Tracker#"
  })

  chrome.contextMenus.create({
    id: 'assignmentTrackerLink',
    contexts: ['link'],
    title: "Add link to Assignment Tracker#"
  })

  chrome.contextMenus.create({
    id: 'assignmentTrackerSelectionText',
    contexts: ['selection'],
    title: "Add '%s' as text"
  })

  chrome.contextMenus.create({
    id: 'assignmentTrackerSelectionLink',
    contexts: ['selection'],
    title: "Add '%s' as link"
  })
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  fetchNotes((data) => {
    const notes = JSON.parse(data.notes);

    switch (info.menuItemId) {
      case 'assignmentTrackerPage':
        {
          notes.ops.push({ insert: `\n\n${tab.title}`, attributes: { link: info.pageUrl } });
        }
        break;
      case 'assignmentTrackerLink':
        {
          notes.ops.push({ insert: `\n\n${info.linkUrl}`, attributes: { link: info.linkUrl } });
        }
        break;
      case 'assignmentTrackerSelectionText':
        {
          const text = info.selectionText;
          notes.ops.push({ insert: `\n\n${text}` });
        }
        break;
      case 'assignmentTrackerSelectionLink':
        {
          const text = info.selectionText;
          notes.ops.push({ insert: `\n\n${text}`, attributes: { link: info.pageUrl } });
        }
        break;
    }

    chrome.storage.sync.set({
      'epoch': data.epoch + 1,
      'notes': JSON.stringify(notes)
    });
  });
});
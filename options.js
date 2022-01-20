// Saves options to chrome.storage
function save_options() {
  var backgroundColor = document.getElementById('backgroundColor').value;
  var foregroundColor = document.getElementById('foregroundColor').value;
  chrome.storage.sync.set({
    "backgroundColor" : backgroundColor,
    "foregroundColor" : foregroundColor,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function default_val(val, def) {
  if(val == "[object Object]")  return def;
  else                          return val;
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    "backgroundColor" : backgroundColor,
    "foregroundColor" : foregroundColor,
  }, function(items) {
    document.getElementById('backgroundColor').value  = default_val(items.backgroundColor, "#35363A");
    document.getElementById('foregroundColor').value  = default_val(items.foregroundColor, "#DADCE0");
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

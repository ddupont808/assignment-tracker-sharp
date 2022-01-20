var currentEpoch = 0;

hljs.configure({
    languages: ['javascript', 'typescript', 'python', 'xml']
});

const Link = Quill.import('formats/link');

class ClickableLink extends Link {
    static create(value) {
        const node = super.create(value);
        node.setAttribute('href', Link.sanitize(value));
        node.setAttribute('target', '_blank');
        node.setAttribute('contenteditable', 'false');

        return node;
    }
}


Quill.register('formats/link', ClickableLink, true);
Quill.register("modules/htmlEditButton", htmlEditButton);

var quill = new Quill('#editor', {
    theme: 'bubble',
    scrollingContainer: '.editor-container',
    modules: {
        syntax: true,
        toolbar: [
            [{ 'font': [] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],

            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme

            // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
            // [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
            // [{ 'direction': 'rtl' }],                         // text direction

            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'align': [] }],

            ['blockquote', 'code-block', 'link', 'image'],

            ['clean']                                         // remove formatting button
        ],
        magicUrl: true,
        htmlEditButton: {
            syntax: true
        }
    }
});
new QuillMarkdown(quill);

function getUpdatedNotes({ epoch, notes, foregroundColor, backgroundColor }) {
    currentEpoch = epoch || 0;
    quill.setContents(JSON.parse(notes));

    $('body, .editor-container, #editor').css('backgroundColor', backgroundColor);
    $('body, .editor-container, #editor').css('color', foregroundColor);
}

chrome.storage.local.get(['epoch', 'notes', 'foregroundColor', 'backgroundColor'], getUpdatedNotes);
chrome.storage.sync.get(['epoch', 'notes', 'foregroundColor', 'backgroundColor'], getUpdatedNotes);

setInterval(() => {
    chrome.storage.sync.get(['epoch', 'notes', 'foregroundColor', 'backgroundColor'], (syncData) => {
        chrome.storage.local.get(['epoch', 'notes', 'foregroundColor', 'backgroundColor'], (localData) => {
            if (syncData.epoch > localData.epoch) {
                chrome.storage.local.set(syncData);
            } else if (syncData.epoch < localData.epoch) {
                chrome.storage.sync.set(localData);
            }
        });
    });
}, 3000);

chrome.storage.onChanged.addListener(({ epoch, notes }) => {
    if (notes === undefined
        || notes.newValue === notes.oldValue
        || (epoch !== undefined && epoch.newValue <= currentEpoch))
        return;
    quill.setContents(JSON.parse(notes.newValue));
});

quill.on('text-change', (delta, source) => {
    currentEpoch++;
    chrome.storage.local.set({
        'epoch': currentEpoch,
        'notes': JSON.stringify(quill.getContents())
    });
});
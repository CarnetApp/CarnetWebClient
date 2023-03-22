const { FileUtils } = require("../utils/file_utils");
const { TextEditor } = require("./text-editor");

class HTMLTextEditor extends TextEditor {

    constructor(writer) {
        super()
        this.writer = writer
    }

    init() {
        this.oEditor = document.getElementById("editor");
        this.oCenter = document.getElementById("center");
        document.getElementById("markdown-switch").parentElement.style.display="none"


    }

    putDefaultHTML() {
        this.oEditor.innerHTML = '<div id="text" style="height:100%;">\
        <!-- be aware that THIS will be modified in java -->\
        <!-- soft won\'t save note if contains donotsave345oL -->\
        <div class="edit-zone" contenteditable></div>\
    </div>\
    <div id="floating">\
    \
    </div>';
    }

    setNoteAndContent(note, noteContent) {
        this.note = note
        var editor = this;
        if (noteContent != undefined && noteContent != "")
            this.oEditor.innerHTML = noteContent;
        else this.putDefaultHTML();
        var name = FileUtils.stripExtensionFromName(FileUtils.getFilename(this.note.path))
        document.getElementById("name-input").value = name.startsWith("untitled") ? "" : name
        this.oCenter.addEventListener("scroll", function () {
            editor.writer.lastscroll = $(editor.oCenter).scrollTop()
        })
        this.oDoc = document.getElementById("text");
        this.oDoc.contentEditable = false
        $(this.oDoc).on('DOMNodeInserted', function (e) {
            console.log("new element " + e.target.tagName)
            if (e.target.tagName == "DIV") {
                e.target.dir = "auto"
            }
        });
        if (this.oDoc.getElementsByClassName("edit-zone").length == 0) { //old note...
            var toCopy = this.oDoc.innerHTML;
            this.oDoc.innerHTML = "";
            this.createEditableZone().innerHTML = toCopy
        }

        for (var editable of this.oDoc.getElementsByClassName("edit-zone")) {
            editable.onclick = function (event) {
                editor.writer.onEditableClick(event);
            }
            for (var insideDiv of editable.getElementsByTagName("div")) {
                insideDiv.dir = "auto"
            }
        }
        this.oDoc.onclick = function (event) {
            if (event.target.id == "text") {
                //focus on last editable element
                var elements = event.target.getElementsByClassName("edit-zone");
                editor.placeCaretAtEnd(elements[elements.length - 1]);
            }
        }
        this.oDoc.addEventListener("input", function () {
            editor.hasTextChanged = true;
        }, false);
        //focus on last editable element  


    }

    getContent() {
        var tmpElem = this.oEditor.cloneNode(true);
        var todolists = tmpElem.getElementsByClassName("todo-list");
        console.log("todolists length " + todolists.length)

        for (var i = 0; i < todolists.length; i++) {
            todolists[i].innerHTML = ""
        }
        return tmpElem.innerHTML

    }

    getCleanText() {
        return this.oEditor.innerText
    }

    onLoaded() {
        let editor = this
        setTimeout(function () {
            if (!editor.writer.isBigNote()) {
                var elements = editor.oDoc.getElementsByClassName("edit-zone");
                editor.placeCaretAtEnd(elements[elements.length - 1]);
                editor.writer.oFloating = document.getElementById("floating");
                editor.writer.scrollBottom.style.display = "none"
            } else {
                $(editor.writer.oCenter).scrollTop(0)
                editor.writer.scrollBottom.style.display = "block"
            }
        }, 200)
    }

    focusAtTheEnd() {
        if (this.oDoc.innerText.trim() == "") {
            //put focus
            var elements = this.oDoc.getElementsByClassName("edit-zone");
            this.placeCaretAtEnd(elements[elements.length - 1]);
        }

    }

    placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            if (sel == null)
                return
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }
}

exports.HTMLTextEditor = HTMLTextEditor
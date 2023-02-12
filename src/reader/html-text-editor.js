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
            lastscroll = $(writer.oCenter).scrollTop()
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
                editor.writer.placeCaretAtEnd(elements[elements.length - 1]);
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
}

exports.HTMLTextEditor = HTMLTextEditor
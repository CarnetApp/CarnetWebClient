const { FileUtils } = require("../utils/file_utils");
const { TextEditor } = require("./text-editor");
const { EditorView } = require("prosemirror-view")
const { EditorState } = require("prosemirror-state")
const { schema, defaultMarkdownParser,
  defaultMarkdownSerializer } = require("prosemirror-markdown")
const { exampleSetup } = require("prosemirror-example-setup")
const { toggleMark, setBlockType, wrapIn } = require("prosemirror-commands")

class TextEditorView {
  constructor(textEditor) {
    this.textEditor = textEditor
  }
  setNoteAndContent(noteContent) {
  }
}

class RawTextEditorView extends TextEditorView {

  constructor(textEditor) {
    super(textEditor)
  }
  setContent(noteContent) {
    this.textEditor.resetEditor()
    this.textEditor.oEditor.innerHTML = "<div id='text'><div class='edit-zone' contenteditable='true'>" + this.nl2br(noteContent) + "</div></div>"
  }

  getContent() {
    return document.getElementById("text").innerText
  }

  nl2br(str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
      return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
  }

}

class WYSIWYGTextEditorView extends TextEditorView {

  constructor(textEditor) {
    super(textEditor)
  }
  setContent(noteContent) {

    this.textEditor.resetEditor()
    let editor = this
    console.log("noteContent " + noteContent)

    this.view = new EditorView(this.textEditor.oEditor, {
      state: EditorState.create({
        doc: defaultMarkdownParser.parse(noteContent),
        plugins: exampleSetup({ schema, menuBar: false })
      })
      ,
      dispatchTransaction(tr) {
        editor.view.updateState(editor.view.state.apply(tr));
        editor.textEditor.hasTextChanged = true
      }
    },
    )
  }



  getContent() {
    return defaultMarkdownSerializer.serialize(this.view.state.doc)
  }

}

class MDTextEditor extends TextEditor {

  constructor(writer) {
    super()
    this.writer = writer
    this.hasTextChanged = true
  }

  init() {
    this.oEditor = document.getElementById("editor");
    this.oCenter = document.getElementById("center");
    this.markdownSwitch = document.getElementById("markdown-switch")
    let editor = this
    this.markdownSwitch.parentElement.style.display="inline-block"
    this.markdownSwitch.onchange = function () {
      console.log("onchange")
      if (editor.markdownSwitch.checked)
        editor.switchToRawEditor(editor.view.getContent())
      else
        editor.switchToWYSIWYG(editor.view.getContent())
    }


  }

  resetEditor() {
    this.oEditor.innerHTML = "";
  }

  setNoteAndContent(note, noteContent) {
    if (noteContent == undefined)
      noteContent = ""
    console.log("noteContent " + noteContent)
    this.switchToWYSIWYG(noteContent)
  }

  switchToWYSIWYG(noteContent) {

    this.view = new WYSIWYGTextEditorView(this)
    console.log("noteContent " + noteContent)

    this.view.setContent(noteContent)
  }


  switchToRawEditor(noteContent) {
    this.view = new RawTextEditorView(this)
    this.view.setContent(noteContent)
  }


  getContent() {
    return this.view.getContent()
  }

  toggleBold() {
    toggleMark(schema.marks.strong)
  }
}

exports.MDTextEditor = MDTextEditor
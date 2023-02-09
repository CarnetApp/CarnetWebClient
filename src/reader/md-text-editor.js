const { FileUtils } = require("../utils/file_utils");
const { TextEditor } = require("./text-editor");
const {EditorView} = require("prosemirror-view")
const {EditorState} = require("prosemirror-state")
const {schema, defaultMarkdownParser,
        defaultMarkdownSerializer} = require("prosemirror-markdown")
 const {exampleSetup} = require("prosemirror-example-setup")
 const {toggleMark, setBlockType, wrapIn} = require("prosemirror-commands")
class MDTextEditor extends TextEditor{

    constructor(writer){
        super()
        this.writer = writer
        this.hasTextChanged = true
    }

    init() {
        this.oEditor = document.getElementById("editor");
        this.oCenter = document.getElementById("center");
        


    }

    putDefaultHTML() {
    }

    setNoteAndContent(note, noteContent){
        this.putDefaultHTML();
        editor = this
        this.view = new EditorView(this.oEditor, {
            state: EditorState.create({
              doc: defaultMarkdownParser.parse(noteContent),
              plugins: exampleSetup({schema, menuBar: false})
            })
          })        
    }
    getContent() {
        return defaultMarkdownSerializer.serialize(this.view.state.doc)
      }
    
      toggleBold(){
        toggleMark(schema.marks.strong)
      }
}

exports.MDTextEditor = MDTextEditor
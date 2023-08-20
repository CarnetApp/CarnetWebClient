const { Note } = require("../browsers/note")


const Mark = {
    Bold: 'bold',
    Italic: 'italic',
    Underline: 'underline',
    Strike: 'strike',
    AlignLeft: 'justifyleft',
    AlignRight: 'justifyright',
    AlignCenter: 'justifycenter'
  };

class TextEditor {

    init() {
    }

    setNoteAndContent(note, noteContent) {

    }
    getContent() { }
    getCleanText() {
        return ""
    }

    toggleMark(mark ) {

    }
    onLoaded() { }

    focusAtTheEnd() { }

    getTodoListData() {}

    createTodoList() {}
}

exports.TextEditor = TextEditor
exports.Mark = Mark
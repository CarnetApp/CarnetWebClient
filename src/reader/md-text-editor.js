const { FileUtils } = require("../utils/file_utils");
const { TextEditor } = require("./text-editor");
const { Editor } = require("@tiptap/core");
const { StarterKit } = require("@tiptap/starter-kit");
const { Underline } = require("@tiptap/extension-underline");
const { createMarkdownEditor } = require("tiptap-markdown");
const TodoListManager = require("./todolist").TodoListManager;
const Mark = require("./text-editor").Mark;

function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

class TextEditorView {
  constructor(textEditor) {
    this.textEditor = textEditor;
  }
  setNoteAndContent(noteContent) {}

  setContent(noteContent) {
    let editor = this;
    this.init();
    console.log("noteContent " + noteContent);

    this.parseMarkdown(
      noteContent,
      function (todolistMD) {
        editor.createTodoListView(todolistMD);
      },
      function (text) {
        editor.createMarkdownView(text);
      }
    );
    this.onInitEnd();
  }

  toggleMark() {}

  onInitEnd() {}

  parseMarkdown(markdown, onTodoList, onText) {
    const lines = markdown.split("\n");
    var inTodoList = false;
    var currentBlock = "";
    for (let line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("[]") ||
        trimmed.startsWith("[ ]") ||
        trimmed.startsWith("[x]")
      ) {
        if (!inTodoList) {
          onText(currentBlock);
          currentBlock = line;
          inTodoList = true;
        } else {
          currentBlock += line;
        }
      } else {
        if (inTodoList) {
          onTodoList(currentBlock);
          currentBlock = line;
          inTodoList = false;
        } else {
          currentBlock += line;
        }
      }
      currentBlock += "\n";
      console.log(line); // Output the current line to the console
    }
    if (inTodoList) {
      onTodoList(currentBlock);
    } else {
      onText(currentBlock);
    }
  }

  markdownToTodoList(markdown) {
    console.log("todolist found: " + markdown);
    var todolist = {};
    todolist.id = "todolist" + generateUID();
    todolist.todo = [];
    todolist.done = [];
    const lines = markdown.split("\n");
    var inTodo = false;
    var inDone = false;
    var currentBlock = "";
    for (let line of lines) {
      console.log("markdownToTodoList " + line);
      var trimmed = line.trim();
      if (trimmed == "" && (inTodo || inDone)) currentBlock += line;
      else if (trimmed.startsWith("[]") || trimmed.startsWith("[ ]")) {
        if (inTodo) {
          todolist.todo.push(currentBlock);
          currentBlock = "";
        } else if (inDone) {
          todolist.done.push(currentBlock);
          currentBlock = "";
        }
        if (trimmed.startsWith("[]")) trimmed = trimmed.substring(2);
        else if (trimmed.startsWith("[ ]")) trimmed = trimmed.substring(3);
        inTodo = true;
        inDone = false;
        currentBlock += trimmed;
      } else if (trimmed.startsWith("[x]")) {
        if (inTodo) {
          todolist.todo.push(currentBlock);
          currentBlock = "";
        } else if (inDone) {
          todolist.done.push(currentBlock);
          currentBlock = "";
        }
        trimmed = trimmed.substring(3);
        inTodo = false;
        inDone = true;
        currentBlock += trimmed;
      }
    }
    if (inTodo) {
      todolist.todo.push(currentBlock);
    } else if (inDone) {
      todolist.done.push(currentBlock);
    }
    return todolist;
  }

  todoListToMarkdown(todolist) {
    var md = "\n\n";
    for (var todo of todolist.todo) {
      md += "[ ]" + todo.trim() + "\n";
    }

    for (var done of todolist.done) {
      md += "[x]" + done.trim() + "\n";
    }
    console.log("todoListToMarkdown " + md);
    return md;
  }
}

class RawTextEditorView extends TextEditorView {
  constructor(textEditor) {
    super(textEditor);
  }

  init() {
    this.textEditor.resetEditor();
    this.textEditor.oEditor.innerHTML =
      "<div id='text'><div class='edit-zone' id='md-container' contenteditable='true'></div></div>";
    this.rawTextContainer = document.getElementById("md-container");
  }

  getContent() {
    console.log("getcontent " + document.getElementById("text").innerText);
    return document.getElementById("text").innerText;
  }

  nl2br(str, is_xhtml) {
    if (typeof str === "undefined" || str === null) {
      return "";
    }
    var breakTag =
      is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
    return (str + "").replace(
      /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
      "$1" + breakTag + "$2"
    );
  }

  getTodoListData() {
    return this.textEditor.writer.note.metadata.todolists;
  }
  createTodoList() {}

  onInitEnd() {
    let textEditor = this.textEditor;
    this.rawTextContainer.addEventListener(
      "input",
      function () {
        textEditor.hasTextChanged = true;
      },
      false
    );
  }

  createMarkdownView(content) {
    this.rawTextContainer.innerHTML += this.nl2br(content);
  }

  createTodoListView(todolist) {
    this.rawTextContainer.innerHTML += this.nl2br(todolist);
  }
}

class TodolistViewWrapper {
  constructor(todoList) {
    this.todoList = todoList;
  }

  todoListToMarkdown(todolist) {
    var md = "\n\n";
    console.log("todolist" + todolist);
    for (var todo of todolist.todo) {
      md += "[ ]" + todo + "\n";
    }
    for (var done of todolist.done) {
      md += "[x]" + done + "\n";
    }
    return md;
  }

  getMarkdown() {
    return this.todoListToMarkdown(this.todoList.toData());
  }
}

class WYSIWYGTextEditorView extends TextEditorView {
  constructor(textEditor) {
    super(textEditor);
    this.todoListManager = new TodoListManager(textEditor.oEditor);
    this.views = [];
    this.currentFocused = undefined;
    var editorView = this;
    textEditor.oEditor.addEventListener("remove-todolist", function (event) {
      for (let i = 0; i < editorView.views.length; i++) {
        if (
          editorView.views[i].todoList != undefined &&
          editorView.views[i].todoList.element.id == event.id
        ) {
          editorView.views.splice(i, 1);
          break;
        }
      }
      if (textEditor.isInit) textEditor.hasTextChanged = true;
    });

    textEditor.oEditor.addEventListener("todolist-changed", function (event) {
      if (textEditor.isInit) textEditor.hasTextChanged = true;
    });
  }

  init() {
    this.textEditor.resetEditor();
    this.isInit = false;
  }

  onInitEnd() {
    this.isInit = true;
  }

  toggleMark(mark) {
    switch (mark) {
      case Mark.Bold:
        this.currentFocused.commands.toggleBold();
        break;
      case Mark.Italic:
        this.currentFocused.commands.toggleItalic();
        break;
      case Mark.Underline:
        this.currentFocused.commands.toggleUnderline();
        break;
      case Mark.Bold:
        this.currentFocused.commands.toggleBold();
        break;
    }
  }

  getTodoListData() {
    return this.todoListManager.toData();
  }
  createTodoList() {
    var td = this.todoListManager.createTodolist();
    td.createItem("");
    this.views.push(new TodolistViewWrapper(td));
    this.createMarkdownView("");
  }

  createMarkdownView(content) {
    let editor = this;
    const mdElement = document.createElement("div");
    mdElement.classList.add("md-element");
    this.textEditor.oEditor.appendChild(mdElement);

    const MarkdownEditor = createMarkdownEditor(Editor);
    const md = new MarkdownEditor({
      element: mdElement,
      content: content,
      markdown: {
        breaks: true,
      },
      extensions: [StarterKit, Underline],
      onFocus({ view }) {
        editor.currentFocused = this;
      },
      onUpdate({ view }) {
        if (editor.isInit) editor.textEditor.hasTextChanged = true;
      },
    });

    this.views.push(md);
  }

  createTodoListView(todolist) {
    this.views.push(
      new TodolistViewWrapper(
        this.todoListManager.createTodolist(this.markdownToTodoList(todolist))
      )
    );
  }

  getContent() {
    var content = "";
    for (let i = 0; i < this.views.length; i++) {
      console.log(typeof this.views[i]);
      if (i != 0) content += "\n";
      content += this.views[i].getMarkdown();
    }
    return content;
  }
}

class MDTextEditor extends TextEditor {
  constructor(writer, toolbar) {
    super();
    this.toolbar = toolbar
    this.toolbar.setAbilities(this.getAbilities())
    this.writer = writer;
    this.hasTextChanged = true;
  }

  init() {
    this.oEditor = document.getElementById("editor");
    this.oCenter = document.getElementById("center");
    this.markdownSwitch = document.getElementById("markdown-switch");
    let editor = this;
    this.markdownSwitch.parentElement.style.display = "inline-block";
    this.markdownSwitch.onchange = function () {
      console.log("onchange");
      if (editor.markdownSwitch.checked)
        editor.switchToRawEditor(editor.view.getContent());
      else editor.switchToWYSIWYG(editor.view.getContent());
    };
  }

  resetEditor() {
    this.oEditor.innerHTML = "";
  }

  setNoteAndContent(note, noteContent) {
    if (noteContent == undefined) noteContent = "";
    console.log("noteContent " + noteContent);
    this.switchToWYSIWYG(noteContent);
  }

  switchToWYSIWYG(noteContent) {
    this.view = new WYSIWYGTextEditorView(this);
    console.log("noteContent " + noteContent);

    this.view.setContent(noteContent);
  }

  switchToRawEditor(noteContent) {
    this.view = new RawTextEditorView(this);
    this.view.setContent(noteContent);
  }

  getContent() {
    return this.view.getContent();
  }

  toggleMark(mark) {
    this.view.toggleMark(mark);
  }

  getTodoListData() {
    return this.view.getTodoListData();
  }

  createTodoList() {
    this.view.createTodoList();
  }

  getAbilities(){
    return "B,I,H3,H2,H1,TD"
  }
}

exports.MDTextEditor = MDTextEditor;

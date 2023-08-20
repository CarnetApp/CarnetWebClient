const Mark = require("./text-editor").Mark

class Toolbar {
  constructor(writer) {
    this.writer = writer;
  }

      /**
     * 
     * B (bold),
     * I (italic),
     * U (underline),
     * AL (align left), 
     * AC (align center), 
     * AR (align right),
     * J (justify),
     * FC (ForegroundColor)
     * BC (BackgroundColor)
     * H3,H2,H1,
     * TD (todolist)"
     */

  setAbilities(abilities) {
    let abilitiesArray = abilities.split(",")
    document.getElementById("bold").style.display = (abilitiesArray.includes("B")?"inline":"none") 
    document.getElementById("italic").style.display = (abilitiesArray.includes("I")?"inline":"none") 
    document.getElementById("underline").style.display = (abilitiesArray.includes("U")?"inline":"none") 
    document.getElementById("justifyleft").style.display = (abilitiesArray.includes("AL")?"inline":"none") 
    document.getElementById("justifycenter").style.display = (abilitiesArray.includes("AC")?"inline":"none") 
    document.getElementById("justifyright").style.display = (abilitiesArray.includes("AR")?"inline":"none") 
    document.getElementById("text-color").style.display = (abilitiesArray.includes("FC")?"inline":"none") 
    document.getElementById("fill-color").style.display = (abilitiesArray.includes("BC")?"inline":"none")
    document.getElementById("size-minus").style.display = (abilitiesArray.includes("M")?"inline":"none") 
    document.getElementById("size-plus").style.display = (abilitiesArray.includes("P")?"inline":"none") 
  }

  init() {
    let inToolbarButtons = document.getElementsByClassName("in-toolbar-button");
    let writer = this.writer
    for (var i = 0; i < inToolbarButtons.length; i++) {
      var button = inToolbarButtons[i];

      button.onclick = function (ev) {
        console.log("on click " + this.id);
        switch (this.id) {
          case "bold":
            writer.textEditor.toggleMark(Mark.Bold);
            break;
          case "italic":
            writer.textEditor.toggleMark(Mark.Italic);
            break;
          case "underline":
            writer.textEditor.toggleMark(Mark.Underline);
            break;
          case "justifyleft":
            writer.textEditor.toggleMark(Mark.AlignLeft);
            break;
          case "justifycenter":
            writer.textEditor.toggleMark(Mark.AlignCenter);
            break;
          case "justifyright":
            writer.textEditor.toggleMark(Mark.AlignRight);
            break;
          case "text-color":
            writer.displayTextColorPicker();
            break;
          case "fill-color":
            writer.displayFillColorPicker();
            break;
          case "size-minus":
            writer.decreaseFontSize();
            break;
          case "size-plus":
            writer.increaseFontSize();
            break;
          case "todolist-button":
            writer.textEditor.createTodoList();
            break;
          case "options-button":
            document.getElementById("options-dialog").showModal();
            break;
          case "open-second-toolbar":
            document.getElementById("toolbar").classList.add("more");
            $("#toolbar").scrollLeft(0);
            break;
          case "close-second-toolbar":
            document.getElementById("toolbar").classList.remove("more");
            $("#toolbar").scrollLeft(0);
            break;
          case "copy-button":
            writer.copy();
            break;
          case "paste-button":
            writer.paste();
            break;
          case "select-all-button":
            document.execCommand("selectAll");
            break;
          case "fullscreen-media-button":
            writer.mediaToolbar.classList.add("fullscreen-media-toolbar");
            var layout = document.getElementsByClassName("mdl-layout")[0];
            layout.classList.remove("mdl-layout--fixed-drawer");
            document.getElementsByTagName("header")[0].style.zIndex = "unset";
            break;
          case "back-to-text-button":
            writer.closeFullscreenMediaToolbar();

            break;
        }
      };
    }
  }
}

exports.Toolbar = Toolbar;

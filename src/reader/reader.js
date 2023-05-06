
const Utils = require("../utils/utils").Utils
const FileUtils = require("../utils/file_utils").FileUtils
const RequestBuilder = require("../requests/request_builder").RequestBuilder
const CompatibilityEditor = require("../compatibility/compatibility-editor").CompatibilityEditor
const compatibility = new CompatibilityEditor()
compatibility.addNextcloudToken()
const KeywordsDBManager = require("../keywords/keywords_db_manager").KeywordsDBManager
const FileBrowser = require("../browsers/file-browser").FileBrowser
const { Note, NoteMetadata } = require("../browsers/note")
const TodoListManager = require("./todolist").TodoListManager
const CarnetRecorder = require("./carnet-recorder").CarnetRecorder
const RemindersDialog = require("./reminders").RemindersDialog
const HTMLTextEditor = require("./html-text-editor").HTMLTextEditor
const MDTextEditor = require("./md-text-editor").MDTextEditor

var rootpath = undefined;
var api_url = undefined;

var Writer = function (elem) {
    this.elem = elem;
    this.seriesTaskExecutor = new SeriesTaskExecutor();
    this.saveNoteTask = new SaveNoteTask(this)

    resetScreenHeight();
    console.log("create Writer")

}

Writer.prototype.setNote = function (note) {
    this.note = note;

}

Writer.prototype.displayMediaFullscreen = function (index) {
    var writer = this
    var imgContainer = document.createElement("div")
    imgContainer.setAttribute("id", "fullimg_container")
    var img = document.createElement("img")
    img.src = compatibility.addRequestToken(this.fullscreenableMedia[index]);

    $(img).on('load', function () {
        img.style.marginTop = "-" + $(this).height() / 2 + "px"
        img.style.marginLeft = "-" + $(this).width() / 2 + "px"
        console.log(img.height)
        $(img).imgViewer();

    });

    img.style.top = "50%"
    img.style.left = "50%"
    img.setAttribute("id", "fullimage")
    // img.style.position = "absolute"
    this.fullscreenViewer.innerHTML = "";
    imgContainer.appendChild(img)
    this.fullscreenViewer.appendChild(imgContainer)
    var toolbar = document.createElement("div")


    //insert
    var insertButton = document.createElement("button")
    insertButton.onclick = function (e) {
        e.stopPropagation();
        $(writer.fullscreenViewer).hide("slow")
        return fa;
    }
    insertButton.classList.add('mdl-button');
    insertButton.classList.add('mdl-js-button')
    insertButton.innerHTML = "insert"
    insertButton.onclick = function () {
        writer.warnNotYetImplemented
    };
    toolbar.setAttribute("id", "toolbar")
    toolbar.appendChild(insertButton)

    //download
    var a = document.createElement("a")
    a.href = "#";
    a.download = "true"; // force download, not view
    a.target = "_blank";
    a.onclick = function () {
        window.open(writer.fullscreenableMedia[index], '_blank');;
        return false;
    }
    var downloadButton = document.createElement("button")

    downloadButton.classList.add('mdl-button');
    downloadButton.classList.add('mdl-js-button')
    downloadButton.classList.add('mdl-button--icon')
    var imgD = document.createElement("i")
    imgD.classList.add("material-icons")
    imgD.innerHTML = "file_download"
    downloadButton.appendChild(imgD)
    a.appendChild(downloadButton)
    toolbar.appendChild(a)

    //delete
    var a = document.createElement("a")
    a.href = "#";
    a.target = "_blank";
    a.onclick = function (e) {
        e.stopPropagation();
        writer.deleteMedia(FileUtils.getFilename(writer.fullscreenableMedia[index]))
        $(writer.fullscreenViewer).hide("slow")
        return false;
    }
    var deleteButton = document.createElement("button")

    deleteButton.classList.add('mdl-button');
    deleteButton.classList.add('mdl-js-button')
    deleteButton.classList.add('mdl-button--icon')
    var imgDelete = document.createElement("i")
    imgDelete.classList.add("material-icons")
    imgDelete.innerHTML = "delete"
    deleteButton.appendChild(imgDelete)
    a.appendChild(deleteButton)
    toolbar.appendChild(a)

    //close
    var closeButton = document.createElement("button")
    closeButton.onclick = function (e) {
        e.stopPropagation();
        $(writer.fullscreenViewer).hide("slow")
        return false;
    }
    closeButton.classList.add('mdl-button');
    closeButton.classList.add('mdl-js-button')
    closeButton.classList.add('mdl-button--icon')
    var imgC = document.createElement("i")
    imgC.classList.add("material-icons")
    imgC.innerHTML = "close"
    closeButton.appendChild(imgC)
    toolbar.appendChild(closeButton)

    this.fullscreenViewer.appendChild(toolbar)
    this.fullscreenViewer.toolbar = toolbar;
    $(this.fullscreenViewer).fadeIn("slow");
    this.fullscreenViewer.style.display = "table-cell"
    this.currentFullscreen = index;
    this.fullscreenViewer.onclick = function () {
        if ($(toolbar).is(":visible"))
            $(toolbar).slideUp("fast");
        else
            $(toolbar).slideDown("fast");
        //  $(writer.fullscreenViewer).hide("slow")
    }
}

Writer.prototype.previousMedia = function () {
    if (this.currentFullscreen > 0)
        this.displayMediaFullscreen(this.currentFullscreen - 1);
}
Writer.prototype.nextMedia = function () {
    if (this.currentFullscreen < this.fullscreenableMedia.length - 1)
        this.displayMediaFullscreen(this.currentFullscreen + 1);
}

Writer.prototype.setMediaList = function (list) {
    writer.currentFullscreen = 0;
    writer.fullscreenableMedia = []
    writer.mediaList.innerHTML = "";
    writer.listOfMediaURL = list

    var mediaCount = 0;
    if (list == undefined)
        list = []

    if (list.length > 0) {
        document.getElementById("fullscreen-media-button").style.display = "block"
        writer.mediaList.style.display = "block"

        /*if (this.oDoc.innerText.trim() == "") {
            var mediaBar = document.getElementById("media-toolbar");
            if (!$(mediaBar).is(":visible"))
                this.toolbarManager.toggleToolbar(mediaBar)
        }
        */
    } else {
        writer.mediaList.style.display = "none"
        document.getElementById("fullscreen-media-button").style.display = "none"

    }

    for (var i = 0; i < list.length; i++) {
        const filePath = list[i]
        const name = FileUtils.getFilename(list[i])
        console.log("file " + filePath)
        var el = document.createElement("div")
        el.classList.add("media")
        if (FileUtils.isFileImage(filePath)) {
            if (!filePath.startsWith("preview_")) {
                var img = document.createElement("img")
                img.src = compatibility.addRequestToken(filePath)
                el.appendChild(img)
                el.classList.add("image-media")
                writer.fullscreenableMedia.push(filePath)

                img.mediaIndex = mediaCount;
                el.onclick = function (event) {
                    console.log(event.target)
                    writer.displayMediaFullscreen(event.target.mediaIndex)

                }
                mediaCount++;
            }
        }

        else {
            var img = document.createElement("i")
            img.classList.add("material-icons")
            el.classList.add("media-file")
            el.filePath = filePath
            if (FileUtils.isFileAudio(filePath)) {
                img.innerHTML = "audiotrack"
                el.onclick = function () {
                    writer.recorder.setAudioUrl(filePath, name)
                    writer.recorderDialog.showModal()
                }
            }
            else
                img.innerHTML = "insert_drive_file"
            el.appendChild(img)
            el.innerHTML += "<br /> " + name.substr(0, 15)



        }
        writer.mediaList.appendChild(el)
    }
    resetScreenHeight()

}
Writer.prototype.refreshMedia = function () {
    var writer = this;
    RequestBuilder.sRequestBuilder.get("/note/open/" + this.saveID + "/listMedia", function (error, data) {
        if (error) {

        }
        writer.setMediaList(data);

    })
}

Writer.prototype.deleteMedia = function (name) {
    console.log("name " + name)
    var writer = this;
    RequestBuilder.sRequestBuilder.delete("/note/open/" + this.saveID + "/media?path=" + encodeURIComponent(this.note.path) + "&media=" + encodeURIComponent(name), function (error, data) {
        if (!error)
            writer.setMediaList(data);
    })
}

Writer.prototype.sendFiles = function (files, callback) {
    $("#media-loading").fadeIn();
    var writer = this;
    RequestBuilder.sRequestBuilder.postFiles("/note/open/" + this.saveID + "/addMedia", {
        path: this.note.path,
        isMarkdown: this.note.isMarkdown
    }, files, function (error, data) {
        if (error) {

        }
        $("#media-loading").fadeOut();
        writer.setMediaList(data);
        if (callback)
            callback(data)

    })
}

Writer.prototype.addMedia = function () {
    console.log("add media")
    document.getElementById("input_file").click();
}

Writer.prototype.setDoNotEdit = function (b) {
    for (var edit of document.getElementsByClassName("edit-zone")) {
        edit.contentEditable = !b;
    }
    document.getElementById("name-input").disabled = b;
}

Writer.prototype.displayErrorLarge = function (error) {

}

Writer.prototype.extractNote = function (callback) {
    console.log("Writer.prototype.extractNote")
    const writer = this;
    $("#media-loading").show()
    RequestBuilder.sRequestBuilder.get("/note/open?path=" + encodeURIComponent(this.note.path), function (error, data) {
        if (error) {
            writer.setDoNotEdit(true);
            writer.displayErrorLarge("Error");
            return;
        }
        console.log(data)
        writer.saveID = data.id;
        var onExtracted = function () {
            $("#media-loading").fadeOut()
            writer.refreshKeywords()
            writer.refreshMedia();
        }

        RequestBuilder.sRequestBuilder.get("/note/extract?path=" + encodeURIComponent(writer.note.path) + "&id=" + data.id, function (error, data2) {
            if (error) {
                console.log("extraction failed...")
                RequestBuilder.sRequestBuilder.get("/note/extract?path=" + encodeURIComponent(writer.note.path) + "&id=" + data.id, function (error, data2) {
                    if (error) {
                        writer.displaySnack({
                            message: $.i18n("error_save"),
                            timeout: 60000 * 300,
                        })
                        writer.setDoNotEdit(true)
                    } else
                        onExtracted()
                })
            } else
                onExtracted()
        })
        if (data.metadata == null) {
            writer.note.is_not_created = true;
            writer.note.metadata = new NoteMetadata();
        }
        else
            writer.note.metadata = data.metadata;

        writer.note.isMarkdown = data.isMarkdown || data.isNew
        if (writer.note.isMarkdown)
            writer.textEditor = new MDTextEditor(writer)
        else
            writer.textEditor = new HTMLTextEditor(writer)
        writer.textEditor.init()
        writer.textEditor.setNoteAndContent(writer.note, data.html)
        //writer.oDoc = document.getElementById("text")

        writer.lastSavedTimeout = setTimeout(saveTextIfChanged, 4000);
        //writer.sDefTxt = writer.oDoc.innerHTML;
        /*simple initialization*/
        // writer.oDoc.focus();
        resetScreenHeight();
        writer.refreshKeywords();
        compatibility.onNoteLoaded();
        $("#toolbar").scrollLeft(500)
        $("#toolbar").animate({ scrollLeft: '0' }, 2000);

        /* writer.oDoc.addEventListener('remove-todolist', function (e) {
             e.previous.innerHTML += "<br />" + e.next.innerHTML
             $(e.next).remove()
             writer.hasTextChanged = true;
         }, false);
         writer.oDoc.addEventListener('todolist-changed', function (e) {
             writer.hasTextChanged = true;
         }, false);
         */
      



        var ratingStars = document.querySelectorAll("input.star")
        for (var i = 0; i < ratingStars.length; i++) {
            ratingStars[i].checked = writer.note.metadata.rating == (5 - i);
        };
        writer.updateRating(writer.note.metadata.rating)
        writer.updateNoteColor(writer.note.metadata.color != undefined ? writer.note.metadata.color : "none");
        writer.setDoNotEdit(false)
        callback();
        writer.textEditor.onLoaded()

    });
}

var saveTextIfChanged = function (onSaved) {
    console.log("has text changed ? " + writer.textEditor.hasTextChanged)
    if (writer.textEditor.hasTextChanged) {
        if (writer.isBigNote()) {
            if (writer.scrollBottom.style.display == "none") {
                writer.scrollBottom.style.display = "block"
            }
        } else {
            if (writer.scrollBottom.style.display == "block") {
                writer.scrollBottom.style.display = "none"
            }
        }
        writer.seriesTaskExecutor.addTask(writer.saveNoteTask, function () {
            console.log("exitOnSaved " + writer.exitOnSaved)
            writer.note.is_not_created = false
            if (writer.exitOnSaved) {
                writer.exitOnSaved = false
                writer.askToExit()
            }
            if (onSaved != undefined)
                onSaved()
        })
    }
    else if (writer.exitOnSaved) {
        /*    writer.exitOnSaved = false
            writer.askToExit()*/
    }
    else {
        writer.setNextSaveTask();
    }
    writer.textEditor.hasTextChanged = false;
}

Writer.prototype.setNextSaveTask = function () {
    this.lastSavedTimeout = setTimeout(saveTextIfChanged, 4000);
}

Writer.prototype.createEditableZone = function () {
    var div = document.createElement("div")
    div.classList.add("edit-zone");
    div.contentEditable = true
    this.oDoc.appendChild(div)
    return div;
}



Writer.prototype.openPrintDialog = function () {
    var writer = this;
    this.printDialog.showModal()
    this.printDialog.querySelector("#cancel").onclick = function () {
        writer.printDialog.close()
    }
    this.printDialog.querySelector("#print").onclick = function () {
        compatibility.print(writer.printDialog.querySelector("#title-checkbox").checked, writer.printDialog.querySelector("#mod-checkbox").checked, writer.printDialog.querySelector("#creation-checkbox").checked, writer.note);
    }
    //compatibility.print();

}



Writer.prototype.isBigNote = function () {
    return this.oCenter.scrollHeight > this.oCenter.clientHeight + 200
}

//var KeywordsDBManager = require(rootpath + "keywords/keywords_db_manager").KeywordsDBManager;
var keywordsDBManager = new KeywordsDBManager()
Writer.prototype.refreshKeywords = function () {
    var keywordsContainer = document.getElementById("keywords-list");
    keywordsContainer.innerHTML = "";
    var writer = this;
    for (var i = 0; i < this.note.metadata.keywords.length; i++) {
        var word = this.note.metadata.keywords[i]
        var keywordElem = document.createElement("span")
        keywordElem.classList.add("keyword-in-text");
        keywordElem.innerHTML = word;
        keywordsContainer.appendChild(keywordElem);
        keywordElem.word = word
        keywordElem.addEventListener('click', function () {
            writer.showKeywordsDialog()
        });

    }
    keywordsDBManager.getFlatenDB(function (error, data) {
        writer.availableKeyword = data;
    })
    resetScreenHeight();
}
Writer.prototype.simulateKeyPress = function (character) {
    $.event.trigger({
        type: 'keypress',
        which: character.charCodeAt(0)
    });
}

Writer.prototype.formatDoc = function (sCmd, sValue) {
    this.oEditor.focus();
    document.execCommand(sCmd, false, sValue);
    this.oEditor.focus();
}

Writer.prototype.displayTextColorPicker = function () {
    var writer = this;
    this.displayColorPicker(function (color) {
        writer.setColor(color)
    });
}

Writer.prototype.displayFillColorPicker = function () {
    var writer = this;
    this.displayColorPicker(function (color) {
        writer.fillColor(color)
    });
}
var currentColor = undefined;
Writer.prototype.setPickerColor = function (picker) {
    currentColor = "#" + picker.toString();
}

var getCssVar = function (v) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(v);
}
Writer.prototype.displayColorPicker = function (callback) {
    //   var call = 
    this.colorPickerDialog.querySelector('.ok').onclick = function () {
        writer.colorPickerDialog.close();
        callback(currentColor);


    }
    this.colorPickerDialog.showModal()
    var picker = new jscolor(document.getElementById('color-picker-div'), { width: 200, padding: 0, border: 0, backgroundColor: 'unset', valueElement: 'chosen-value', container: document.getElementById('color-picker-div'), onFineChange: function () { writer.setPickerColor(this) }, shadow: false });
    document.getElementById('color-picker-div').show();
    var colorItemsContainer = this.colorPickerDialog.querySelector('#color-items-container');
    colorItemsContainer.innerHTML = ""
    console.log("color " + getCssVar('--main-text-color'))
    var frontcolors = [getCssVar('--main-text-color'), getCssVar('--red-text-color'), getCssVar('--green-text-color'), getCssVar('--blue-text-color'), getCssVar('--yellow-text-color'), getCssVar('--violet-text-color')];
    for (var color of frontcolors) {
        var item = document.createElement("button");
        item.classList.add("color-item");
        item.onclick = function (e) {
            e.preventDefault()
            writer.colorPickerDialog.close();
            console.log("selecting" + this.color);
            callback(this.color);
            return false
        }
        item.color = color;
        item.style.background = color;
        colorItemsContainer.appendChild(item);
    }
    var backcolors = [getCssVar('--main-back-color'), getCssVar('--red-back-color'), getCssVar('--green-back-color'), getCssVar('--blue-back-color'), getCssVar('--yellow-back-color'), getCssVar('--violet-back-color')];
    for (var color of backcolors) {
        var item = document.createElement("button");
        item.classList.add("color-item");
        item.onclick = function (e) {
            e.preventDefault()
            writer.colorPickerDialog.close();
            console.log("selecting" + this.color);
            callback(this.color);
            return false
        }
        item.color = color;
        item.style.background = color;
        colorItemsContainer.appendChild(item);
    }

}

Writer.prototype.displayStyleDialog = function () {

    this.styleDialog.showModal()
}

Writer.prototype.warnNotYetImplemented = function () {
    var data = {
        message: $.i18n("not_yet_implemented"),
        timeout: 5000,
    };
    this.displaySnack(data);
    return false;
}

Writer.prototype.displaySnack = function (data) {

    var snackbarContainer = document.querySelector('#snackbar');
    if (!(typeof snackbarContainer.MaterialSnackbar == undefined))
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

Writer.prototype.openRemindersDialog = function () {
    var remindersDialog = new RemindersDialog(document.getElementById("reminders"), writer.note.metadata.reminders)
    remindersDialog.dialog.showModal()
}

Writer.prototype.showKeywordsDialog = function () {
    writer.newKeywordDialog.showModal();
    writer.updateKeywordsListSelector()
}

Writer.prototype.updateKeywordsListSelector = function (currentWord = "") {
    currentWord = currentWord.trim()
    writer.newKeywordDialog.currentWord = currentWord
    writer.keywordsList.innerHTML = ""
    var head = document.createElement("thead");
    writer.keywordsList.appendChild(head)
    var tbody = document.createElement("tbody");
    writer.keywordsList.appendChild(tbody)
    var tr = document.createElement("tr");
    head.appendChild(tr)
    var th = document.createElement("th");
    th.classList.add("mdl-data-table__cell--non-numeric")
    th.innerHTML = ""
    tr.appendChild(th)
    var i = 0
    if (currentWord != "") {
        var isIn = false
        for (var word in writer.availableKeyword) {
            if (word == currentWord && writer.availableKeyword[word] != 0) {
                isIn = true
                break
            }
        }
        if (!isIn) {
            var o = document.createElement("tr")
            var td = document.createElement("td")
            td.classList.add("mdl-data-table__cell--non-numeric")
            td.classList.add("in-dialog-keyword")

            td.innerHTML = currentWord;
            o.appendChild(td)
            o.word = word
            tbody.appendChild(o)

        }


    }


    for (var word in writer.availableKeyword) {

        if (writer.availableKeyword[word] == 0)
            continue;
        if (currentWord == "" || word.toLowerCase().indexOf(currentWord) >= 0) {
            var o = document.createElement("tr")
            var td = document.createElement("td")
            td.classList.add("mdl-data-table__cell--non-numeric")
            td.classList.add("in-dialog-keyword")

            td.innerHTML = word;
            if (writer.note.metadata.keywords.indexOf(word) >= 0)
                o.classList.add("is-selected")
            o.appendChild(td)
            o.word = word
            tbody.appendChild(o)
        }
    }

    try {
        new MaterialDataTable(writer.keywordsList)
    } catch (e) { console.log(e) }

    for (var checkbox of writer.keywordsList.getElementsByClassName('mdl-checkbox__input')) {
        checkbox.onchange = function (event) {
            var word = event.target.parentElement.parentElement.parentElement.getElementsByClassName("in-dialog-keyword")[0].innerHTML
            console.log("on change " + $(event.target).is(":checked"))
            if ($(event.target).is(":checked"))
                writer.addKeyword(word)
            else
                writer.removeKeyword(word)
            console.log(word)
        }
    }


}

Writer.prototype.init = function () {
    var writer = this;
    this.recorder = new CarnetRecorder(this);

    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        if (errorMsg.indexOf("parentElement") >= 0) //ignore that one
            return;
        if ([
            "TypeError: firstHeader is null"
        ].includes(errorMsg))
            return;
        var data = {
            message: "Error occured: " + errorMsg,
            timeout: 5000,

        };
        writer.displaySnack(data)
        return false;
    }

    document.execCommand('styleWithCSS', false, true);
    document.getElementById("input_file").onchange = function () {
        var input = this;
        if (writer.note.is_not_created) {
            writer.textEditor.hasTextChanged = true
            //first we need to create it
            saveTextIfChanged(function () {
                writer.sendFiles(input.files);
            })
        } else {
            writer.sendFiles(this.files);
        }
    }
    this.statsDialog = this.elem.querySelector('#statsdialog');
    this.showDialogButton = this.elem.querySelector('#show-dialog');
    var dias = document.getElementsByClassName("mdl-dialog")
    for (var i = 0; i < dias.length; i++) {
        if (!dias[i].showModal)
            dialogPolyfill.registerDialog(dias[i]);
    }
    this.statsDialog.querySelector('.ok').addEventListener('click', function () {
        writer.statsDialog.close();

    });
    this.genericDialog = this.elem.querySelector('#generic-dialog');

    this.colorPickerDialog = this.elem.querySelector('#color-picker-dialog');

    this.styleDialog = this.elem.querySelector('#style-dialog');

    this.recorderDialog = this.elem.querySelector('#recorder-container');

    this.newKeywordDialog = this.elem.querySelector('#new-keyword-dialog');

    this.printDialog = this.elem.querySelector('#print-dialog');


    this.oEditor = document.getElementById("editor");

    this.oCenter = document.getElementById("center");
    this.scrollBottom = document.getElementById("scroll-bottom")
    this.scrollBottom.onclick = function () {
        $(writer.oCenter).animate({ scrollTop: $(writer.oCenter).prop("scrollHeight") });
    }
    this.mediaList = document.getElementById("media-list");
    this.fullscreenViewer = document.getElementById("fullscreen-viewer");
    $(document).bind('keydown', function (event) {
        console.log(event.keyCode);
        if ($(writer.fullscreenViewer).is(":visible")) {
            switch (event.keyCode) {
                case 37:
                    writer.previousMedia()
                    break;
                case 39:
                    writer.nextMedia()
                    break;
                case 27:
                    $(writer.fullscreenViewer).hide("slow")
                    break;
            }
        }
    });

    ;
    /*this.toolbarManager = new ToolbarManager()
    var toolbarManager = this.toolbarManager
    var toolbars = document.getElementsByClassName("toolbar")
    for (var i = 0; i < toolbars.length; i++) {
        this.toolbarManager.addToolbar(toolbars[i]);
    };
    var toolbarButtons = document.getElementsByClassName("toolbar-button")
    for (var i = 0; i < toolbarButtons.length; i++) {
        var toolbar = toolbarButtons[i]
        console.log("tool " + toolbar.getAttribute("for"))

        toolbar.addEventListener("click", function (event) {
            console.log("display " + event.target.getAttribute("for"))
            toolbarManager.toggleToolbar(document.getElementById(event.target.getAttribute("for")))
        });
    };*/
    this.searchInput = document.getElementById("search-input");
    this.searchInput.onfocus = function () {
        var el = document.getElementById('container-button');
        console.log('test')
        $(el).animate({
            scrollLeft: el.scrollLeft + 300
        }, 200);
    }
    this.searchInput.onkeyup = function (event) {
        if (event.key === 'Enter') {
            window.find(this.value);
        }
    }

    var ratingStars = document.getElementsByClassName("star")
    for (var i = 0; i < ratingStars.length; i++) {
        ratingStars[i].checked = false;
        ratingStars[i].onclick = function () {
            writer.saveRating(this.value);
            writer.updateRating(this.value);
        }
    };

    var inputs = document.querySelectorAll("input[name='color']")
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onclick = function () {
            writer.saveNoteColor(this.id);
        }
    };

    document.getElementById("button-add-keyword").onclick = function () {
        writer.showKeywordsDialog();
        return false;
    }

    document.getElementById("button-add-keyword-ok").onclick = function () {
        writer.newKeywordDialog.close();
    }
    this.mediaToolbar = document.getElementById("media-toolbar");
    var optionButtons = document.getElementsByClassName("option-button");

    for (var i = 0; i < optionButtons.length; i++) {
        var button = optionButtons[i];

        button.onclick = function (ev) {
            console.log("on click " + this.id);
            document.getElementById("options-dialog").close()
            switch (this.id) {
                case "print-button":
                    writer.openPrintDialog();
                    break;
                case "statistics-button":
                    writer.displayCountDialog();
                    break;
                case "date-button":
                    var date = writer.note.metadata.custom_date;
                    if (date == undefined)
                        date = writer.note.metadata.last_modification_date;
                    if (date == undefined)
                        date = writer.note.metadata.creation_date;
                    if (date == undefined)
                        date = new Date().now()
                    const picker = new MaterialDatetimePicker({ default: moment(date) })
                        .on('submit', (val) => {
                            writer.note.metadata.custom_date = val.unix() * 1000;
                            writer.textEditor.hasTextChanged = true
                        });
                    picker.open();
                    break

            }
        }
    }

    var inToolbarButtons = document.getElementsByClassName("in-toolbar-button");

    for (var i = 0; i < inToolbarButtons.length; i++) {
        var button = inToolbarButtons[i];

        button.onclick = function (ev) {
            console.log("on click " + this.id);
            switch (this.id) {
                case "bold":
                    writer.textEditor.toggleBold()
                case "italic":
                case "underline":
                case "justifyleft":
                case "justifycenter":
                case "justifyright":
                    writer.formatDoc(this.id);
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
                    writer.textEditor.createTodoList()
                    break;
                case "options-button":
                    document.getElementById("options-dialog").showModal()
                    break;
                case "open-second-toolbar":
                    document.getElementById("toolbar").classList.add("more")
                    $("#toolbar").scrollLeft(0)
                    break;
                case "close-second-toolbar":
                    document.getElementById("toolbar").classList.remove("more")
                    $("#toolbar").scrollLeft(0)
                    break
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
                    writer.mediaToolbar.classList.add("fullscreen-media-toolbar")
                    var layout = document.getElementsByClassName("mdl-layout")[0]
                    layout.classList.remove("mdl-layout--fixed-drawer")
                    document.getElementsByTagName("header")[0].style.zIndex = "unset";
                    break;
                case "back-to-text-button":
                    writer.closeFullscreenMediaToolbar();

                    break;
            }
        };
    }

    this.keywordsList = document.getElementById("keywords")


    writer.keywordsList.innerHTML = "";
    document.getElementById('keyword-input').addEventListener("input", function () {
        var currentWord = this.value.toLowerCase()
        console.log("input i")
        writer.updateKeywordsListSelector(currentWord)
    })

    this.addMediaMenu = document.getElementById("add-media-menu")
    document.getElementById("exit").onclick = function () {
        writer.askToExit();
    }

    document.getElementById("reminders-button").onclick = function () {
        writer.openRemindersDialog()
        return false;
    }

    document.getElementById("share-button").onclick = function () {
        writer.openInFrame(rootpath + "exporter/exporter.html?path=" + writer.note.path + "&api_path=" + api_url)
    }
    document.getElementById("note-color-button").onclick = function () {
        document.getElementById("note-color-picker-dialog").showModal()
        document.getElementById("note-color-picker-dialog").getElementsByClassName("ok")[0].onclick = function () {
            document.getElementById("note-color-picker-dialog").close()
        }
        return false;
    }
    document.getElementById("add-file-button").onclick = function () {
        writer.addMedia();
    }
    document.getElementById("add-recording-button").onclick = function () {
        writer.recorder.new()
        writer.recorderDialog.showModal()
    }

    writer.nameTimout = undefined
    document.getElementById("name-input").addEventListener("input", function () {
        if (writer.nameTimout != undefined)
            clearTimeout(writer.nameTimout)
        writer.nameTimout = setTimeout(function () {
            writer.seriesTaskExecutor.addTask(writer.saveNoteTask) // first, save.
            writer.seriesTaskExecutor.addTask(new RenameNoteTask(writer))
            writer.nameTimout = undefined


        }, 10000)
    })

    document.getElementById("name-input").addEventListener("focusout", function () {
        if (writer.nameTimout != undefined) {
            clearTimeout(writer.nameTimout)
            writer.seriesTaskExecutor.addTask(writer.saveNoteTask) // first, save.
            writer.seriesTaskExecutor.addTask(new RenameNoteTask(writer))
        }
    })
    // $("#editor").webkitimageresize().webkittableresize().webkittdresize();
}


Writer.prototype.closeFullscreenMediaToolbar = function () {
    this.mediaToolbar.classList.remove("fullscreen-media-toolbar")
    this.textEditor.focusAtTheEnd()

}

Writer.prototype.askToExit = function () {
    this.setDoNotEdit(true)
    console.log("exec? " + this.seriesTaskExecutor.isExecuting)
    if (this.seriesTaskExecutor.isExecuting || this.textEditor.hasTextChanged) {
        this.exitOnSaved = true;
        if (this.textEditor.hasTextChanged) {
            saveTextIfChanged()
        }
        return false;
    }
    else {
        if (this.lastSavedTimeout != undefined) {
            clearTimeout(this.lastSavedTimeout)
            this.lastSavedTimeout = undefined
        }
        this.closeFullscreenMediaToolbar()
        compatibility.exit();
    }
    return false;
}

var currentFrame = undefined;
Writer.prototype.openInFrame = function (url) {
    var iframeContainer = document.getElementById('frame-container');
    var wholeFrameContainer = document.getElementById('whole-frame-container');
    document.getElementById('frame-loading-view').style.display = "block"

    var onFrameLoaded = function () {
        document.getElementById('frame-loading-view').style.display = "none"
    }
    if (currentFrame == undefined) {

        currentFrame = document.createElement('iframe');
        currentFrame.classList.add("frame")
        currentFrame.onload = onFrameLoaded

        iframeContainer.appendChild(currentFrame)
        document.getElementById("iframe-back-button").onclick = function () {
            wholeFrameContainer.style.display = "none"
        }

    }
    currentFrame.src = url
    wholeFrameContainer.style.display = "inline-flex"

}


Writer.prototype.copy = function () {
    document.execCommand('copy');
    this.copied = this.getSelectionHtml();
}

Writer.prototype.paste = function () {
    if (!document.execCommand('paste')) {
        if (typeof app === "object")
            app.paste(); //for android app
        else
            document.execCommand('insertHTML', false, this.copied)
    }

}

Writer.prototype.getSelectionHtml = function () {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

Writer.prototype.displayCountDialog = function () {
    var nouveauDiv;
    if (window.getSelection().toString().length == 0) {
        nouveauDiv = this.oDoc;

    } else {
        nouveauDiv = document.createElement("div");
        nouveauDiv.innerHTML = window.getSelection();
    }
    console.log(" is defined ? " + nouveauDiv)

    var writer = this
    Countable.once(nouveauDiv, function (counter) {
        writer.statsDialog.querySelector('.words_count').innerHTML = counter.words;
        writer.statsDialog.querySelector('.characters_count').innerHTML = counter.characters;
        writer.statsDialog.querySelector('.sentences_count').innerHTML = counter.sentences;
        writer.statsDialog.showModal();
    });

}




Writer.prototype.increaseFontSize = function () {
    console.log("increaseFontSize")

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        this.formatDoc("increaseFontSize", undefined);
    else {
        console.log("surrong")
        this.surroundSelection(document.createElement('big'));
    }
}
Writer.prototype.decreaseFontSize = function () {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        this.formatDoc("decreaseFontSize", undefined);
    else
        this.surroundSelection(document.createElement('small'));

}
Writer.prototype.surroundSelection = function (element) {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var selection = window.getSelection().getRangeAt(0);
            var selectedText = selection.extractContents();
            element.appendChild(selectedText);
            selection.insertNode(element);
        }
    }
}
//var KeywordsDBManager = require(rootpath + "keywords/keywords_db_manager").KeywordsDBManager;
//var keywordsDBManager = new KeywordsDBManager()
Writer.prototype.addKeyword = function (word) {
    const writer = this;
    if (this.note.metadata.keywords.indexOf(word) < 0 && word.length > 0) {
        this.note.metadata.keywords.push(word);
        keywordsDBManager.addToDB(word, this.note.path, function () {
            writer.refreshKeywords();
        })
        this.seriesTaskExecutor.addTask(this.saveNoteTask)

    }
}

Writer.prototype.removeKeyword = function (word) {
    const writer = this;
    if (this.note.metadata.keywords.indexOf(word) >= 0) {
        this.note.metadata.keywords.splice(this.note.metadata.keywords.indexOf(word), 1);
        keywordsDBManager.removeFromDB(word, this.note.path, function () {
            writer.refreshKeywords();
        })
        this.seriesTaskExecutor.addTask(this.saveNoteTask)
    }
}

Writer.prototype.reset = function () {
    this.exitOnSaved = false
    this.setMediaList([])
    document.getElementById("whole-frame-container").style.display = "none"
    document.getElementById("toolbar").classList.remove("more")
    var dias = document.getElementsByClassName("mdl-dialog")
    for (var i = 0; i < dias.length; i++) {
        if (dias[i].open)
            dias[i].close()
    }
    var snackbarContainer = document.querySelector('#snackbar');
    if (snackbarContainer != undefined && snackbarContainer.MaterialSnackbar != undefined) {
        snackbarContainer.queuedNotifications_ = [];
        snackbarContainer.MaterialSnackbar.cleanup_()
    }
    this.setDoNotEdit(false)
    //close all toolbars
    if (this.toolbarManager != undefined)
        this.toolbarManager.toggleToolbar(undefined)
    if (this.fullscreenViewer != undefined)
        $(this.fullscreenViewer).hide()

}



Writer.prototype.setColor = function (color) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('foreColor', false, color);
}

Writer.prototype.fillColor = function (color) {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('backColor', false, color);
}

Writer.prototype.saveRating = function (rating) {
    if (rating == undefined)
        return;
    if (this.note.metadata.rating != rating)
        this.note.metadata.rating = rating;
    else
        this.note.metadata.rating = -1;
    console.log("new rating " + this.note.metadata.rating)
    writer.textEditor.hasTextChanged = true;
}

Writer.prototype.updateRating = function (rating) {
    var ratingStars = document.querySelectorAll("label.star")
    for (var i = 0; i < ratingStars.length; i++) {
        if (5 - i <= this.note.metadata.rating) {
            ratingStars[i].classList.add("checked");

        } else
            ratingStars[i].classList.remove("checked");

    };
}

Writer.prototype.saveNoteColor = function (color) {
    this.note.metadata.color = color;
    document.getElementById("note-color-picker-dialog").style.background = "var(--note-" + color + ")"
    console.log("new color " + this.note.metadata.color)
    writer.textEditor.hasTextChanged = true;
}

Writer.prototype.updateNoteColor = function (color) {
    console.log("color " + color)
    document.getElementById("note-color-picker-dialog").style.background = "var(--note-" + color + ")"
    var inputs = document.querySelectorAll("input[name='color']")
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].id == color) {
            inputs[i].checked = true;

        }
    };

}

Writer.prototype.getCaretPosition = function () {
    var x = 0;
    var y = 0;
    var sel = window.getSelection();
    if (sel != null && sel.rangeCount) {
        var range = sel.getRangeAt(0).cloneRange();
        if (range.getClientRects()) {
            range.collapse(true);
            var rect = range.getClientRects()[0];
            if (rect) {
                y = rect.top;
                x = rect.left;
            }
        }
    }
    return {
        x: x,
        y: y
    };
}

Writer.prototype.getCaretCharacterOffsetWithin = function (element) {
    var caretOffset = 0;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

Writer.prototype.getWord = function (elem) {
    var sel, word = "";
    if (window.getSelection && (sel = window.getSelection()).modify) {
        var selectedRange = sel.getRangeAt(0);
        sel.collapseToStart();
        sel.modify("move", "backward", "word");
        console.log("pos " + this.getCaretCharacterOffsetWithin(elem))
        var i = 0;
        var lastPos = -1
        if (this.getCaretCharacterOffsetWithin(elem) !== 0)
            while (true) {
                sel.modify("move", "backward", "character") + "mod";
                sel.modify("extend", "forward", "character");
                console.log(this.getCaretCharacterOffsetWithin(elem))
                var tmpword = sel.toString();
                var newPos = this.getCaretCharacterOffsetWithin(elem)
                if (tmpword == " " || tmpword == "\n" || newPos == 1 || newPos == lastPos || i > 200) {
                    break;
                }
                lastPos = newPos
                sel.modify("move", "backward", "character");
                i++;
            }
        sel.modify("extend", "forward", "word");
        word = sel.toString();
        while (true) {
            sel.modify("extend", "forward", "character");
            var tmpword = sel.toString();
            if (tmpword.endsWith(" ") || tmpword.endsWith("\n") || tmpword == word) {
                console.log("break1" + tmpword);
                break;
            }
            word = tmpword;

        }
        // Restore selection
        sel.removeAllRanges();
        sel.addRange(selectedRange);
    } else if ((sel = document.selection) && sel.type != "Control") {
        var range = sel.createRange();
        range.collapse(true);
        range.expand("word");
        word = range.text;
    }
    return word;
}

Writer.prototype.handleAction = function (type, value) {
    if (type === "prefill") {
        document.execCommand('insertHTML', false, value);
        var elements = document.getElementsByClassName("edit-zone");
        var element = elements[elements.length - 1];
        element.innerHTML += value;
        this.textEditor.hasTextChanged = true

    }
    else if (type === "record-audio") {
        writer.recorder.new()
        writer.recorderDialog.showModal()
    }
    else if (type === "add-media") {

    }
}

Writer.prototype.handleActions = function (actions) {
    if (actions === undefined)
        return;
    for (var action of actions) {
        this.handleAction(action.type, action.value)
    }
}
Writer.prototype.onEditableClick = function (event) {
    var word = this.getWord(event.target)
    var match = word.match(Utils.httpReg)
    if (match) {
        var data = {
            actionText: $.i18n("open"),
            actionHandler: function () {
                const url = match[0];
                compatibility.openUrl(url)
            },
            message: match[0].substr(0, 20) + "...",
            timeout: 2000,
        };
        this.displaySnack(data);
    }

}

var ToolbarManager = function () {
    this.toolbars = [];
}
ToolbarManager.prototype.addToolbar = function (elem) {
    this.toolbars.push(elem)
    $(elem).hide()
}

ToolbarManager.prototype.toggleToolbar = function (elem) {
    for (var i = 0; i < this.toolbars.length; i++) {
        var toolbar = this.toolbars[i]
        if (toolbar != elem)
            $(toolbar).slideUp("fast", resetScreenHeight)
    }

    if (elem != undefined) {
        if ($(elem).is(":visible")) {
            $(elem).slideUp("fast", resetScreenHeight)
        }
        else
            $(elem).slideDown("fast", resetScreenHeight)
    }


    resetScreenHeight()
}

var RenameNoteTask = function (writer) {
    this.writer = writer;
}

RenameNoteTask.prototype.run = function (callback) {
    console.log("RenameNoteTask.run")
    $("#loading").fadeIn()
    this.writer.setDoNotEdit(true);
    var task = this
    var path = FileUtils.getParentFolderFromPath(this.writer.note.path);
    var hasOrigin = false;
    var nameInput = document.getElementById("name-input")
    if (nameInput.value.trim() == "") {
        task.writer.setDoNotEdit(false);
        $("#loading").fadeOut()
        var name = FileUtils.stripExtensionFromName(FileUtils.getFilename(task.writer.note.path))
        nameInput.value = name.startsWith("untitled") ? "" : name
        var data = {
            message: $.i18n("unable_rename_note"),
            timeout: 2000,
        };
        task.writer.displaySnack(data);
        callback();
        return
    }
    for (let part of nameInput.value.split("/")) {
        if (part == ".." && !hasOrigin) {
            path = FileUtils.getParentFolderFromPath(path)
        } else {
            hasOrigin = true;
            path += "/" + part;
        }
    }
    path += ".sqd"
    if (path.startsWith("./"))
        path = path.substr(2);

    RequestBuilder.sRequestBuilder.post("/notes/move", {
        from: this.writer.note.path,
        to: path,
    }, function (error, data) {
        if (!error) {
            task.writer.note.path = path;
            task.writer.setDoNotEdit(false);
            $("#loading").fadeOut()

            var data = {
                message: 'Note correctly renamed',
                timeout: 2000,
            };
            task.writer.displaySnack(data);
            callback();
        }
        else {
            task.writer.setDoNotEdit(false);
            $("#loading").fadeOut()
            var name = FileUtils.stripExtensionFromName(FileUtils.getFilename(task.writer.note.path))
            nameInput.value = name.startsWith("untitled") ? "" : name
            var data = {
                message: 'Note couldn\'t be renamed',
                timeout: 2000,
            };
            task.writer.displaySnack(data);
            callback();
        }
    })



}


var SeriesTaskExecutor = function () {
    this.task = []
    this.callbacks = {}
    this.isExecuting = false
}

SeriesTaskExecutor.prototype.addTask = function (task, onEnd) {
    this.task.push(task)
    this.callbacks[task] = onEnd;
    console.log("adding en end " + onEnd)

    if (!this.isExecuting) {
        this.execNext()
    }

}

SeriesTaskExecutor.prototype.execNext = function () {
    this.isExecuting = true
    console.log("exec next ")
    if (this.task == undefined)
        this.task = []

    var executor = this;
    var task = this.task.shift()
    task.run(function () {
        executor.isExecuting = executor.task.length > 0;
        if (executor.callbacks[task] != undefined) {
            executor.callbacks[task]()
            delete executor.callbacks[task];
            console.log("on end")
        }
        if (executor.task.length > 0)
            executor.execNext()
    })
    console.log("this.task length " + this.task.length)

}

var SaveNoteTask = function (writer) {
    this.writer = writer;

}
SaveNoteTask.prototype.trySave = function (onEnd, trial) {
    // /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ 
    //var re = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    //var m;

    const content = this.writer.textEditor.getContent()
    const cleanText = this.writer.textEditor.getCleanText()
    var urls = cleanText.match(Utils.httpReg)
    if (urls == null)
        urls = []
    if (this.writer.note.metadata.urls == undefined) {
        this.writer.note.metadata.urls = {}
    }
    var currentUrls = Object.keys(this.writer.note.metadata.urls)
    for (var url of urls) {
        if (currentUrls.indexOf(url) < 0)
            this.writer.note.metadata.urls[url] = {}
    }

    for (var url of currentUrls) {
        if (urls.indexOf(url) < 0)
            delete this.writer.note.metadata.urls[url]
    }

    const task = this;
    if (this.writer.note.metadata.creation_date === "")
        this.writer.note.metadata.creation_date = Date.now();

    this.writer.note.metadata.todolists = this.writer.textEditor.getTodoListData()
    this.writer.note.metadata.last_modification_date = Date.now();
    RequestBuilder.sRequestBuilder.post("/note/saveText", {
        id: this.writer.saveID,
        path: this.writer.note.path,
        html: content,
        isMarkdown: this.writer.note.isMarkdown,
        metadata: JSON.stringify(this.writer.note.metadata)
    }, function (error, data) {
        if (error) {
            if (trial < 3) {
                setTimeout(function () {
                    task.trySave(onEnd, trial + 1);
                }, 1000)
            } else {
                writer.displaySnack({
                    message: $.i18n("error_save"),
                    timeout: 60000 * 300,
                })
                writer.setDoNotEdit(true)
                onEnd();
            }
        } else {
            onEnd();
            task.writer.setNextSaveTask()
        }
    });
}

SaveNoteTask.prototype.saveTxt = function (onEnd) {
    this.trySave(onEnd, 0);
}

SaveNoteTask.prototype.run = SaveNoteTask.prototype.saveTxt;

var lastscroll = 0;

function resetScreenHeight() {
    console.log("resetScreenHeight")
    var screen = $(window).innerHeight(),
        header = $("#toolbar-container").height(),
        content = screen - header

    $("#center").height(content);
    $("#text").css('min-height', content - header - $("#keywords-list").height() - $("#name-input").height() - 20 - (writer == undefined || writer.listOfMediaURL == undefined || writer.listOfMediaURL.length == 0 ? $("#media-toolbar").height() + 5 : 0) + "px");
    $("#center").scrollTop(lastscroll);
    if (writer != undefined) {
        var diff = content - 45 - writer.getCaretPosition().y + header
        console.log(diff)
        if (diff < 0)
            $("#center").scrollTop(lastscroll - diff);
    }
    console.log(content - 45)
    if (document.activeElement != undefined && document.activeElement.resizeListener != undefined) {
        document.activeElement.resizeListener();
    }
}


function loadPath(path, action) {
    if (writer == undefined)
        return;
    writer.reset();
    var note = new Note("", "", path, undefined);
    writer.setNote(note);
    console.log("extract")
    writer.extractNote(function () {
        writer.handleAction(action, undefined)
    });

}

window.loadPath = loadPath

if (loaded == undefined)
    var loaded = false; //don't know why, loaded twice on android

var writer = undefined;
var isElectron = false;
function init() {
    isElectron = compatibility.isElectron;
    console.log("isElectron " + isElectron)
    rootpath = document.getElementById("root-url").innerHTML.trim();
    api_url = document.getElementById("api-url").innerHTML.trim();

    new RequestBuilder(api_url);
    RequestBuilder.sRequestBuilder.get("/settings/editor_css", function (error, data) {
        if (!error && data != null && data != undefined) {
            console.log("data " + data)
            for (var sheet of data) {
                console.log("sheet " + sheet)

                Utils.applyCss(sheet)
            }
        }
    })
    if (writer == undefined) {
        writer = new Writer(document);
        window.writer = writer
        writer.init();
    }

    if (!loaded) {
        $(window).on('resize', resetScreenHeight);

        var path = Utils.getParameterByName("path");
        var action = Utils.getParameterByName("action");
        var tmp = Utils.getParameterByName("tmppath");
        if (tmp != null)
            tmppath = tmp;
        if (path != undefined) {
            console.log("path " + Utils.getParameterByName("action"))
            loadPath(path, action)

        }

        loaded = true;
    }
    /* window.oldOncontextmenu = window.oncontextmenu;
     window.oncontextmenu = function (event) {
         event.preventDefault();
         event.stopPropagation();
         return false;
     };*/
    compatibility.loadLang(function () {
        $('body').i18n();
    })
    $.i18n().locale = navigator.language;

}
$(window).on('touchstart', function (e) {
    if ($(e.target).closest('.block-scroll').length >= 1) {
        writer.oCenter.style.overflowY = "hidden";
    }
});
$(window).on('touchend', function () {
    writer.oCenter.style.overflowY = "auto";
});

compatibility.setOnReadyCallback(init)

const RequestBuilder = require("../requests/request_builder").RequestBuilder
const Compatibility = require("../compatibility/compatibility").Compatibility
const compatibility = new Compatibility()
compatibility.addNextcloudToken()
const UISettingsHelper = require("../settings/ui_settings_helper").UISettingsHelper
const FileBrowser = require("./file-browser").FileBrowser
const File = require("./file-browser").File
const Note = require("./note").Note
const Utils = require("../utils/utils").Utils

var root_url = document.getElementById("root-url") != undefined ? document.getElementById("root-url").innerHTML : "";
var api_url = Utils.getParameterByName("api_url")
if (api_url == undefined)
    api_url = document.getElementById("api-url").innerHTML !== "!API_URL" ? document.getElementById("api-url").innerHTML : "./";
new RequestBuilder(api_url);



class SearchEngine {
    refreshTimeout;
    lastListingRequestId;
    resetGrid;
    onListEnd;
    constructor(resetGrid, onListEnd) {
        this.resetGrid = resetGrid;
        this.onListEnd = onListEnd
    }
    oldSearchInNotes(searching) {
        this.resetGrid(false)
        notes = [];
        document.getElementById("note-loading-view").style.display = "inline";

        RequestBuilder.sRequestBuilder.get("/notes/search?path=." + "&query=" + encodeURIComponent(searching), function (error, data) {
            if (!error) {
                list("search://", true);
            }
        });

    }
    sendSearchQuery() {
        var self = this;
        this.lastListingRequestId = RequestBuilder.sRequestBuilder.get("/notes/search?path=." + "&query=" + encodeURIComponent(this.query) + "&from=" + this.from, function (error, data) {
            if (!error) {
                if (data['end'] || data['files'].length > 0) {
                    document.getElementById("page-content").style.display = "block";
                    document.getElementById("note-loading-view").style.display = "none";
                    if (data['files'].length > 0) {
                        var hasChanged = false;
                        for (let node of data['files']) {
                            if (node.path == "quickdoc")
                                continue;
                            file = new File(node.path, !node.isDir, node.name);
                            var isIn = false
                            for (let fileIn of self.result) {
                                if (fileIn.path == node.path) {
                                    isIn = true;
                                    break;
                                }

                            }
                            if (!isIn) {
                                self.result.push(file)
                                hasChanged = true;
                            }
                        }
                        var callbackFiles = []
                        callbackFiles = callbackFiles.concat(self.result)
                        if (hasChanged)
                            self.onListEnd("search://", callbackFiles, undefined, true);

                    }
                }
                self.from = data['next']
                if (!data['end'])
                    self.refreshTimeout = setTimeout(function () {
                        self.sendSearchQuery();
                    }, 500)

            }
        });
    }

    searchInNotes(query) {
        if (compatibility.isElectron) {
            this.oldSearchInNotes(query)
            return;
        }
        if (this.refreshTimeout !== undefined)
            clearTimeout(this.refreshTimeout)
        if (this.lastListingRequestId != undefined) {
            RequestBuilder.sRequestBuilder.cancelRequest(this.lastListingRequestId)
        }
        this.result = []
        var oldFiles = []
        this.query = query;
        this.resetGrid(false)
        var notes = [];
        document.getElementById("note-loading-view").style.display = "inline";
        this.from = 0;
        this.sendSearchQuery();
    }



}

class Search{
    searchEngine;
    init(resetGrid, onListEnd){
        this.searchEngine = undefined;

        document.getElementById("search-input").onkeydown = function (event) {
            if (event.key === 'Enter') {
                if (this.searchEngine == undefined)
                    this.searchEngine = new SearchEngine(resetGrid, onListEnd);
                this.searchEngine.searchInNotes(this.value)

            }
        }


        document.getElementById("search-button").onclick = function () {
            var value = document.getElementById("search-input").value;
            if (value.length > 0) {
                if (this.searchEngine == undefined)
                    this.searchEngine = new SearchEngine(resetGrid, onListEnd);
                this.searchEngine.searchInNotes(value)
            }
        }
    }
}

exports.Search = Search;



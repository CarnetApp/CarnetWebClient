
var rootpath = "";

const Compatibility = require("./compatibility").Compatibility
const AndroidRecorder = require("./android/android_recorder").AndroidRecorder

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function (suffix) {
    return this.indexOf(suffix) === 0;
};

class CompatibilityEditor extends Compatibility {
    constructor() {
        super();
        if (this.isElectron) {
            module.paths.push(rootpath + 'node_modules');
            var ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.on('loadnote', function (event, path) {
                loadPath(path)
            });
            ipcRenderer.on('action', function (event, action) {
                writer.handleAction(action)
            });
        } else {
            var exports = function () { }
        }
    }

    exit() {
        if (this.isGtk) {
            window.parent.document.title = "msgtopython:::exit"
            parent.postMessage("exit", "*")
        }
        else if (this.isElectron) {
            const {
                ipcRenderer
            } = require('electron')
            ipcRenderer.sendToHost('exit', "")
        }
        else if (this.isAndroid)
            app.postMessage("exit", "*");

        else if (window.self !== window.top) //in iframe
            parent.postMessage("exit", "*")
    }

    getRecorder(options) {
        if (this.isAndroid) return new AndroidRecorder(options);
        return new Recorder(options);
    }


    postMessage(message){
        if (this.isGtk) {
            document.getElementsByClassName('mdl-layout__header')[0].style.display = "none"
            window.parent.document.title = "msgtopython:::"+message
        }
        if (this.isElectron) {
            const {
                ipcRenderer
            } = require('electron')
            ipcRenderer.sendToHost(message, "")
        } else if (this.isAndroid) {
            app.hideProgress();
        } else {
            parent.postMessage(message, "*")
        }
    }
    onNoteLoaded() {
        if (this.isGtk) {
            document.getElementsByClassName('mdl-layout__header')[0].style.display = "none"
            window.parent.document.title = "msgtopython:::noteloaded"
        }
        if (this.isElectron) {
            const {
                ipcRenderer
            } = require('electron')
            ipcRenderer.sendToHost('loaded', "")
        } else if (this.isAndroid) {
            app.hideProgress();
        } else {
            parent.postMessage("loaded", "*")
        }
    }
    setOnReadyCallback(callback) {
        var isElectron = false;
        if (!isElectron) {
            $(document).ready(function () {
                callback()
            })
        }
        else {
            var ipcRenderer = require('electron').ipcRenderer;
            ipcRenderer.on('remote_ready', function (event, path) {
                callback()
            });
        }

    }
}


exports.CompatibilityEditor = CompatibilityEditor
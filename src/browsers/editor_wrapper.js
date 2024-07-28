class EditorWrapper{
        editorIFrame;
        isLoaded
        isLoading
        onEditorLoaded

        constructor(compatibility) {
            this.compatibility = compatibility
            this.events = []
            if (compatibility.isElectron) {
                this.editorIFrame = document.getElementById("writer-webview");
            
                this.editorIFrame.addEventListener('ipc-message', event => {
                    if (this.events[event.channel] !== undefined) {
                        for (var callback of this.events[event.channel])
                            callback();
                    }
                });
            
            } else {
                this.editorIFrame = document.getElementById("writer-iframe");
                // iframe events

                const events = this.events
            
                var eventMethod = window.addEventListener ?
                    "addEventListener" :
                    "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod === "attachEvent" ?
                    "onmessage" :
                    "message";
                eventer(messageEvent, function (e) {
                    if (events[e.data] !== undefined) {
                        for (var callback of events[e.data])
                            callback();
                    }
            
                });
            }
            this.editorIFrame.isLoaded = false
            
        }

        registerWriterEvent(event, callback) {
            if (this.events[event] == null) {
                this.events[event] = []
            }
            this.events[event].push(callback)
        
        }


}

exports.EditorWrapper = EditorWrapper

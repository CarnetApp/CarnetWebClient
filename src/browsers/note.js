var Note = function (title, text, path, metadata, previews, needsRefresh = false, media, fromCache) {
    this.title = title;
    this.text = text;
    this.path = path;
    this.previews = previews;
    this.media = media;
    this.fromCache = fromCache;
    this.needsRefresh = needsRefresh
    if (metadata == undefined) {
        this.metadata = new NoteMetadata();
        this.metadata.creation_date = Date.now();
        this.metadata.last_modification_date = this.metadata.creation_date;
    } else
        this.metadata = metadata;

}

var NoteMetadata = function () {
    this.creation_date = ""
    this.last_modification_date = ""
    this.keywords = []
    this.rating = -1;
    this.color = "none"
}
exports.Note = Note
exports.NoteMetadata = NoteMetadata

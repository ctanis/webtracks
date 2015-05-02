var ui = {
  loadNewTrack: function (track) {
    var newTrackTemplate = Handlebars.compile($("#track-template").html())
    tracks.append(newTrackTemplate(track))
  }
}

var ui = {
  // LOCALS:
  tracks: $('#tracks'),
  // METHODS:
  loadNewTrack: function (track) {
    var newTrackTemplate = Handlebars.compile($("#track-template").html())
    this.tracks.append(newTrackTemplate(track))
  },
  toggleEffects: function () {
    var effectControls = $(this).parents('.track').find('.track-effects')
    effectControls.toggleClass('open')
  },
  init: function () {
    this.loadNewTrack(this.dummyTrack)
  },
  // FOR TESTING PURPOSES ONLY:
  dummyTrack: {
    id: 'track-42',
    name: 'Awww, yeah!'
  }
}

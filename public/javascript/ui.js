var ui = {
  // LOCALS:
  tracks: $('#tracks'),
  recorder: $('#recorder'),

  // METHODS:
  loadNewTrack: function (track) {
    var newTrackTemplate = Handlebars.compile($("#track-template").html())
    var newTrack = $(newTrackTemplate(track))
    newTrack.find('.waveform-wrapper').append(track.canvas)
    ui.toggleRecorder()
    ui.tracks.append(newTrack)
  },
  toggleEffects: function () {
    var effectControls = $(this).parents('.track').find('.track-effects')
    effectControls.toggleClass('open')
  },
  toggleRecorder: function () {
    console.log(this.recorder)
    ui.recorder.toggleClass('focused')
  },
  init: function () {
    // this.loadNewTrack(this.dummyTrack)
  },

  // FOR TESTING PURPOSES ONLY:
  dummyTrack: {
    id: 'track-42',
    name: 'Awww, yeah!'
  }
}

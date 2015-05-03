var ui = {
  // LOCALS:
  tracks: $('#tracks'),
  recorder: $('#recorder'),
  recorderOverlay: $('#recorder-overlay'),
  recorderStart: $('#recorder-start'),
  recorderStop: $('#recorder-stop'),
  recorderStep1: $('#recorder-step-1'),
  recorderStep2: $('#recorder-step-2'),
  recordingName: $('#recording-name'),

  // METHODS:
  loadNewTrack: function (track) {
    var newTrackTemplate = Handlebars.compile($("#track-template").html())
    var newTrack = $(newTrackTemplate(track))
    newTrack.find('.waveform-wrapper').append(track.canvas)
    ui.tracks.append(newTrack)
  },
  toggleEffects: function () {
    var effectControls = $(this).parents('.track').find('.track-effects')
    effectControls.toggleClass('open')
  },
  toggleRecorder: function () {
    ui.recorderOverlay.fadeToggle(200)
  },
  recordNew: function () {
    ui.recorderStart.hide()
    ui.recorderStop.show()
    recordNew()
  },
  recordStop: function () {
    recordStop(function () {
      ui.recorderStep1.hide()
      ui.recorderStep2.show()
    })
  },
  recordSave: function () {
    commitRecorded(ui.recordingName.val(), function (track) {
      ui.loadNewTrack(track)
      ui.resetRecorder()
    })
  },
  recordCancel: function () {
    lastRecording = null
    ui.resetRecorder()
  },
  resetRecorder: function () {
    ui.toggleRecorder()
    setTimeout(function () {
      ui.recordingName.val('')
      ui.recorderStop.hide()
      ui.recorderStart.show()
      ui.recorderStep2.hide()
      ui.recorderStep1.show()
    }, 250)
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

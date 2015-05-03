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
  play: function () {
    wt.play()
  },
  stop: function () {
    wt.stop()
  },
  loadNewTrack: function (track) {
    var newTrackTemplate = Handlebars.compile($("#track-template").html())
    var newTrack = $(newTrackTemplate(track))
    newTrack.find('.waveform-wrapper').append(track.canvas)
    ui.tracks.append(newTrack)
  },
  removeTrack: function (event) {
    var track = $(event.target).attr('data-track')
    wt.removeTrack(track)
  },
  removeTrackFromUI: function (track) {
    $('#' + track).remove()
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
    commitRecorded(ui.recordingName.val(), function () {
      ui.resetRecorder()
    })
  },
  recordCancel: function () {
    lastRecording = null
    ui.resetRecorder()
  },
  resetRecorder: function () {
    ui.toggleRecorder()
    lastRecording = null
    setTimeout(function () {
      ui.recordingName.val('')
      ui.recorderStop.hide()
      ui.recorderStart.show()
      ui.recorderStep2.hide()
      ui.recorderStep1.show()
    }, 250)
  },
  trackSetVolume: function (event) {
    var track = $(event.target).attr('data-track')
    wt.trax[track].setVolume(event.target.value)
  },
  masterSetVolume: function (event) {
    wt.masterVolume(event.target.value)
  },
  setEchoTime: function (event) {
    masterEcho.setDelay(event.target.value)
  },
  setEchoFeedback: function (event) {
    masterEcho.setFeedback(event.target.value)
  },
  setEchoVolume: function (event) {
    masterEcho.setVolume(event.target.value)
  },
  setTrackEchoVolume: function (event) {
    var track = $(event.target).attr('data-track')
    wt.trax[track].setSend(event.target.value)
  },

  init: function (track) {
    ui.loadNewTrack(track);
  },

  // FOR TESTING PURPOSES ONLY:
  dummyTrack: {
    id: 'track-42',
    name: 'Awww, yeah!'
  }
}

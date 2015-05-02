// Main JavaScript file
var tracks = $('#tracks')

var toggleEffects = function () {
  var effectControls = $(this).parents('.track').find('.track-effects')
  console.log(effectControls)
  effectControls.toggleClass('open')
}

var dummyTrack = {
  trackId: 'track-42',
  trackTitle: 'Awww, yeah!'
}

var init = function () {
  ui.loadNewTrack(dummyTrack)
}

window.onLoad = init()

$('.track-effects-toggle').on('click', toggleEffects)

var fpo = function(e){console.log(e.target, e.target.value)} // For Position Only (i.e. does nuthin’)

// MASTER CONTROLS
$('#play').on('click', ui.play)
$('#stop').on('click', ui.stop)
$('#master-vol').on('input', ui.masterSetVolume)
$('#recorder-start').on('click', ui.recordNew)
$('#recorder-stop').on('click', ui.recordStop)
$('#recorder-save').on('click', ui.recordSave)
$('#recorder-cancel').on('click', ui.recordCancel)
$('#record-toggle').on('click', ui.toggleRecorder)
$('#echo-time').on('input', ui.setEchoTime)
$('#echo-feedback').on('input', ui.setEchoFeedback)
$('#echo-volume').on('input', ui.setEchoVolume)

// TRACK-SPECIFIC CONTROLS
$(document).on('click', '.track-effects-toggle', ui.toggleEffects)
  .on('click', '.track-mute-toggle', fpo)
  .on('input', '.track-vol', ui.trackSetVolume)
  .on('input', '.track-echo-level', ui.setTrackEchoVolume)
  .on('click', '.track-remove', ui.removeTrack)
  .on('click', '.track-waveform', fpo) // catch value for x-axis; reposition

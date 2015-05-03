var fpo = function(e){console.log(e.target, e.target.value)} // For Position Only (i.e. does nuthin’)

// MASTER CONTROLS
$('#play').on('click', wt.play)
$('#stop').on('click', wt.stop)
$('#master-vol').on('input', fpo)
$('#recorder-start').on('click', ui.recordNew)
$('#recorder-stop').on('click', ui.recordStop)
$('#recorder-save').on('click', ui.recordSave)
$('#recorder-cancel').on('click', ui.recordCancel)
$('#record-toggle').on('click', ui.toggleRecorder)

// TRACK-SPECIFIC CONTROLS
$(document).on('click', '.track-effects-toggle', ui.toggleEffects)
  .on('click', '.track-mute-toggle', fpo)
  .on('input', '.track-vol', fpo)
  .on('click', '.track-reverb-toggle', fpo)
  .on('input', '.track-reverb-level', fpo)
  .on('click', '.track-echo-toggle', fpo)
  .on('input', '.track-echo-level', fpo)
  .on('click', '.track-remove', fpo)
  .on('click', '.track-waveform', fpo) // catch value for x-axis; reposition

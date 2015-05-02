var fpo = function(e){console.log(e.target, e.target.value)} // For Position Only (i.e. does nuthin’)

// MASTER CONTROLS
$('#play').on('click', play)
$('#stop').on('click', stop)
$('#master-vol').on('input', fpo)

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

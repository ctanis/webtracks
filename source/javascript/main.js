// Main JavaScript file
$('.track-effects-toggle').on('click', function (e) {
  var effectControls = $(this).parents('.track').find('.track-effects')
  console.log(effectControls)
  effectControls.toggleClass('open')
})

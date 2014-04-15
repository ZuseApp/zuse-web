// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

$(document).ready(function() {

  $('#play').click(function() {
    game.start();
    $('#play-panel').hide();
    $('#stop-pause-panel').show();
  });

  $('#refresh').click(function() {
    game.stop();
    game = new ZuseAppEngine( { canvas: $("#viewport"), project_json: window.project_json, compiled_components: window.compiled_components } );
  });

  $('#pause').click(function() {
    if ($(this).hasClass("ion-pause"))
    {
      game.pause();
      $('#pause').removeClass("ion-pause").addClass("ion-play");
    }
    else if ($(this).hasClass("ion-play"))
    {
      game.continue();
      $('#pause').removeClass("ion-play").addClass("ion-pause");
    }
  });
});

document.onreadystatechange = function () 
{
  if (document.readyState == "complete") 
  {
    //document is ready. Do your stuff here
    var world = Physics();

    var renderer = Physics.renderer("canvas", {
      el: "view",
      width: 500,
      height: 500
    });

    var bounds = Physics.aabb(0, 0, 500, 500);

    world.add( Physics.behavior('edge-collision-detection', {
      aabb: bounds,
      restitution: 0.3
    }));

    world.add( Physics.behavior('body-impulse-response') );

    world.add(renderer);

    var square = Physics.body('convex-polygon', {
      x: 250,
      y: 250,
      vx: 0.01,
      vertices: [
        {x: 0, y: 50},
        {x: 50, y: 50},
        {x: 50, y: 0},
        {x: 0, y: 0}
      ]
    });

    world.add(square);

    world.add( Physics.behavior('constant-acceleration') );

    Physics.util.ticker.subscribe(function( time, dt ){
      world.step( time );
    });

    Physics.util.ticker.start();

    world.subscribe("step", function() {
      world.render();
   });

    world.add( Physics.body('convex-polygon', {
      x: 250,
      y: 50,
      vx: 0.05,
      vertices: [
        {x: 0, y: 80},
        {x: 60, y: 40},
        {x: 60, y: -40},
        {x: 0, y: -80}
      ]
    }) );

    world.add( Physics.body('convex-polygon', {
      x: 400,
      y: 200,
      vx: -0.02,
      vertices: [
        {x: 0, y: 80},
        {x: 80, y: 0},
        {x: 0, y: -80},
        {x: -30, y: -30},
        {x: -30, y: 30}
      ]
    }) );

    world.add( Physics.behavior('body-collision-detection') );
    world.add( Physics.behavior('sweep-prune') );
  }
}


<? include('libs/lib.php'); ?>
<html>
  <head>
    <title>Train Station</title>
  <style>
  body {
    margin:0px;
    padding:0px;
  }
  canvas{
		cursor: none
  }
  </style>
  </head>
  <body>
    <canvas id='back' style="position: absolute; z-index: 0"></canvas>
    <canvas id='c' style="position: absolute; z-index: 1">Canvas is not supported By this Browser</canvas>
    <script> var eng = <?php echo ObjToJson('/Applications/XAMPP/xamppfiles/htdocs/train/trains/cube.obj'); ?> </script>
    <script src="game.js"></script>
  </body>
</html>
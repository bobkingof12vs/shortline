<?php

include("mysqli.php");

$train_db = mysqliConnect("p:127.0.0.1","root","","train");


if ($_GET['f'] == 'getTrack'){
	$q = "select m.x,m.y,g.color from map m join ground g on m.ground = g.groundid
	where x between {$_GET['x']} and {$_GET['x']}+10 and y between {$_GET['y']} and {$_GET['y']}+10";
	$result = mysqliQuery($train_db,$q);
	echo json_encode($result);
}

?>
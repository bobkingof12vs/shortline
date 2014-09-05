<?php

include("sql.php");

$mysql = new sqli();

if(isset($_GET['type']) and $_GET['type'] == 'add'){

  if(empty($email = $mysql->escapeStr($_GET['email'])))
    exit('Email Address is required');

  if(!isset($_POST['data']))
    exit('No Data Received');

  $data = json_decode($_POST['data']);

  $mysql->runQuery("insert into save (email) values('$email')");

  $id = $mysql->getQuery("SELECT max(id) id FROM train.save where email='$email'");
  $id = $id[0]['id'];

  if(!empty($data->tree)){
    $values = '';
    foreach($data->tree as $tree)
      $values .= "($id, {$tree->x}, {$tree->z}),";
    $mysql->runQuery("insert into tree (saveid, x, z) values".rtrim($values,','));
  }

  if(!empty($data->track)){
    $values = '';
    foreach($data->track as $track)
      $values .= "($id, {$track->x}, {$track->z}),";
    $mysql->runQuery("insert into track (saveid, x, z) values".rtrim($values,','));
  }

  if(!empty($data->land)){
    $values = '';
    foreach($data->land as $land)
      $values .= "($id, {$land->x}, {$land->y}, {$land->z}),";
    $mysql->runQuery("insert into land (saveid, x, y, z) values".rtrim($values,','));
  }

  if(!empty($data->building)){
    $values = '';
    foreach($data->building as $building)
      $values .= "($id, '{$building->name}', {$building->x}, {$building->z}, {$building->height}, {$building->rotY}),";
    $mysql->runQuery("insert into building (saveid, name, x, z, height, rotY) values".rtrim($values,','));
  }

  echo $id;
}
elseif(isset($_GET['type']) and $_GET['type'] == 'get'){
  if(empty($id = $mysql->escapeStr($_GET['id'])))
    exit('id is required');

  if(empty($id = $mysql->getQuery("SELECT id FROM train.save where id='$id'")))
    exit('id does not exist');

  $id = $id[0]['id'];

  $data = array(
    'tree' => $mysql->getQuery("select x,z from tree where saveid = $id"),
    'track' => $mysql->getQuery("select x,z from track where saveid = $id"),
    'land' => $mysql->getQuery("select x,y,z from land where saveid = $id"),
    'building' => $mysql->getQuery("select name,x,z,height,rotY from building where saveid = $id")
  );

  echo json_encode($data, JSON_NUMERIC_CHECK);
}
else
  echo "Request Error";


?>

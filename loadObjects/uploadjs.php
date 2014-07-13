<code>
<?php
  print_r($_REQUEST);

  $uploadFile = "../js/trains/{$_POST["objName"]}.js";
  if (move_uploaded_file($_FILES["file"]["tmp_name"], $uploadFile)) {
    echo "File is valid, and was successfully uploaded.\n";
  } else {
    echo "Possible file upload attack!\n";
  }

  file_put_contents("../js/images/{$_POST['objName']}.png",base64_decode(substr($_POST['imageData'],strlen('data:image/png;base64,'))));

  $dataFile = array(
            "path"=> "js/trains/{$_POST["objName"]}.js",
            "type"=> "{$_POST["type"]}",
            "dispOpts"=> array(
                    "scale"=> "new THREE.Vector3({$_POST['scale']}, {$_POST['scale']}, {$_POST['scale']})",
                    "castShadow"=> true,
                    "receiveShadow"=> true,
                    "line"=> true
            ),
            "imageData" => "../js/images/{$_POST['objName']}.png"
  );

  if($_POST['type'] == 'engine'){
    $dataFile["maxAcc"] = $_POST["maxAcc"];
    $dataFile["dec"] = $_POST["dec"];
    $dataFile["top"] = $_POST["top"];
  }

  if($_POST['type'] != 'other'){
    $dataFile["axleOffset"] = $_POST["axleOffset"];
    $dataFile["sizeLength"] = $_POST["sizeLength"];
  }

  file_put_contents("./{$_POST["objName"]}",json_encode($dataFile, JSON_PRETTY_PRINT));
?>
</code>

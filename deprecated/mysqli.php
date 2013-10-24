<?php
 function mysqliConnect($host,$username,$passwd,$dbname,$port = "3306"){
	$link = mysqli_connect($host,$username,$passwd,$dbname,$port);
	if($link == true and $link != null){
		return $link;
	}
	else{
		print "Connection to $dbname Failed\nError Number: ".mysqli_connect_errno." \n Error: ".mysqli_connect_error()."\n\n";die;
	}
 }
 
 function mysqliQueryID($link) {
		return mysqli_insert_id($link);
	}

 //to force a single row query, set $array_type = "row"
 //to force an array $array_type = "array"
 function mysqliQuery($link, $query, $array_type = "null", $type = 1){
	$array_type = strtolower($array_type);
	if (!in_array($array_type, array("null","array","row"))){
		print "Error: argument 3 of mysqliQuery contains an unusable value";
		die;
	}
	for($count = 0; $count <= 10; $count++){
	 $result = mysqli_query($link,$query);
	 if($result){
		if($result === TRUE){
		 return mysqli_affected_rows($link);
		}
		elseif(mysqli_num_rows($result) > 1 or $array_type == "array"){
		 while ($rows = mysqli_fetch_array($result, ($type == 1 ? MYSQL_ASSOC : MYSQL_NUM))){
			$row[] = $rows;
		 }
		}
		elseif(mysqli_num_rows($result) <= 1 or $array_type == "row"){
		 $row = mysqli_fetch_array($result, ($type == 1 ? MYSQL_ASSOC : MYSQL_NUM));
		}
		return $row;
	 }
	 else{
		$err = mysqli_errno($link);
		if($err == 1205 || $err == 1213){
		 sleep(600);
		 if ($count > 10){echo "\n\nError: table locked for too long\n\n";die;}
		 //else continue for loop
		}
		elseif($err == 1062){
		 print "\n\nError number: ".$err."\n".mysqli_error($link)."\n\nErring Query:\n".$query."\ncontinuing\n\n"; return;
		}
		else{
		 print "\n\nError number: ".$err."\n".mysqli_error($link)."\n\nErring Query:\n".$query."\n\n"; die;
		}
	 }
	}	
 }
?>
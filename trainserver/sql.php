<?php

class sqli{
	function __construct(){
		$this->mysqli = new mysqli('localhost','web','1111111111','train');
		if (mysqli_connect_errno())
			exit("Connect failed: ".mysqli_connect_error());
	}

	function runQuery($sql){
		if (($result = $this->mysqli->query($sql)) === false)
			exit($this->mysqli->error);

		$return = $this->mysqli->affected_rows;
		return empty($return) ? false : $return;
	}


	function getQuery($sql){
		if (($result = $this->mysqli->query($sql)) === false)
			exit($this->mysqli->error);

		$return = array();
		while ($row = $result->fetch_assoc())
			$return[] = $row;
		$result->free();
		return empty($return) ? false : $return;
	}

	function escapeStr($var){
		$return = $this->mysqli->escape_string($var);
		return empty($return) ? false : $return;
	}
}
?>

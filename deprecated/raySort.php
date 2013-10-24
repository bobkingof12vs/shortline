<?php

class text {
	
	function text($x=0,$y=0){
		echo exec("tput cup $x $y");
		$this->getSize();
	}
	
	function cpos($x,$y){
		echo exec("tput cup $y $x");
	}
	
	function getSize(){
		exec('tput lines',$y);
		$this->y = intval($y[0]);
		exec('tput cols',$x);
		$this->x = intval($x[0]);
	}
	
	function colors($back, $fore){
		exec("tput setab $back");
		exec("tput setaf $fore");
	}
	
	function line($x1,$y1,$x2,$y2,$char){
		$temp1 = $x2 < $x1 ? $x2 : $x1;
		$temp1 = $y2 < $y1 ? $y2 : $y1;
		$temp2 = $x2 >= $x1 ? $x2 : $x1;
		$temp2 = $y2 >= $y1 ? $y2 : $y1;
		$x1 = intval($temp1);
		$y1 = intval($temp1);
		$x2 = intval($temp2);
		$y2 = intval($temp2);
		for($i = $x1; $i <= $x2; $i++){
			$this->cpos($i,round(($y1+(($y2-$y1)*abs(($i-$x1)*(($x2-$x1)/100))))));
			echo $char;
		}
		for($i = $y1; $i <= $y2; $i++){
			$this->cpos(round(($x1+(($x2-$x1)*abs(($i-$y1)*(($y2-$y1)/100))))),$i);
			echo $char;
		}
		$this->cpos(0,0);
	}
	
	function clr(){
		$width = $this->x;
		$height = $this->y;
		for($i = 0; $i <= $height; $i++){	
			$this->cpos(0,$i);
			for($j = 0; $j <= $width; $j++){
				echo ' ';
			}
			echo "\n";
		}
		$this->cpos(0,0);
	}
	
}

function lerpLine($p1,$p2,$t){
	return array(
		$p1[0]+(($p2[0]-$p1[0])*$t),
		$p1[1]+(($p2[1]-$p1[1])*$t),
		$p1[2]+(($p2[2]-$p1[2])*$t));
}

function lerpCurve($p1,$p2,$p3,$p4,$t){
	$p5 = lerpLine($p1,$p2,$t);
	$p6 = lerpLine($p3,$p4,$t);
	return lerpLine($p5,$p6,$t);
}

function distance3D($p1,$p2){
	return(sqrt(pow(($p2[0]-$p1[0]),2)+pow(($p2[1]-$p1[1]),2)+pow(($p2[2]-$p1[2]),2)));
}

function lineIntersect($p1,$p2,$p3,$p4){
	  
	$bx = $p2[0] - $p1[0]; 
	$by = ($p2[1]+$p2[2]) - ($p1[1]+$p1[2]) ; 
	$dx = $p4[0] - $p3[0]; 
	$dy = ($p4[1]+$p4[2])  - ($p3[1]+$p3[2]) ;
	$cx = $p3[0] - $p1[0];
	$cy = ($p3[1]+$p3[2]) - ($p1[1]+$p1[2]);
  
	$b_dot_d_perp = $bx * $dy - $by * $dx;
  
	if($b_dot_d_perp == 0) {
    return false;
  }
  $t = ($cx * $dy - $cy * $dx) / $b_dot_d_perp;
  if($t < 0 | $t > 1) {
    return false;
  }
  $u = ($cx * $by - $cy * $bx) / $b_dot_d_perp;
  if(u < 0 | u > 1) {
    return false;
  }
	return true;
}

function triangulate($face,$vec){
	
	$text = new text(0,0);
	$text->clr();
	$widthRatio  = $text->x/10;
	$heightRatio = $text->y/10;
	
	if(count($face) == 4){
		return(array($face[0],array($face[1],$face[2],$face[3])));
	}
	
	
	for($i = 0; $i < count($face)-1; $i++){
		//echo "\n-{$vec[$i][0]} + ".($vec[$i][1]+$vec[$i][2])."+".$vec[$i+1][0]."+".($vec[$i+1][1]+$vec[$i+1][2]).',X';
		$text->line($vec[$i][0],$vec[$i][1]+$vec[$i][2],$vec[$i+1][0],$vec[$i+1][1]+$vec[$i+1][2],'X');
	}
	fgets(STDIN);
	die;
	
	unset($done);
	$done = array();
	$tri = array();
	$tri[] = $face[0];
	$i = 0;
	
	//find someinfo about the object
	$minD = distance3d($vec[1],$vec[2]);
  $maxD = distance3d($vec[1],$vec[2]);
  for ($j = 1; $j < count($vec); $j++){
		for ($k = 1; $k < count($vec); $k++){
			if($k != $j){
				$tempD = distance3d($vec[$j],$vec[$k]);
				if($tempD<=$minD){$minD = $tempD;}
				if($tempD>=$maxD){$maxD = $tempD;}
			}
		}
  }
	
	$maxD *= 3; //its greatest distance, x3 to be definately outside the face
	$minD /= 3; //its smallest distance, /3 to be definately inside all faces
	
	while(count($done) < count($face)-3){
		
		$point = array();
		for($j = 1; $j <= 3; $j++){
			$i++;
			if($i >= count($face)){$i = 1;}
			while(isset($done[$i]) or in_array($i,$point)){
				$i++;
				if($i >= count($face)){$i = 1;}
			}
			$point[$j] = $i;
		}
		
		//check if it is an innie or and outie
		$mid_point = lerpCurve($vec[$point[0]],$vec[$point[1]],$vec[$point[1]],$vec[$point[2]],.5);
		$mid_outside = array($mid_point[0]+$maxD,$mid_point[1]+$maxD,$mid_point[2]+$maxD);
		$num_intersects = 0;
		$j = 1;
		while($j < count($face)-2){
			while(isset($done[$j])){$j++;}
			$p1 = $vec[$face[$j]];
			$j++;
			while(isset($done[$j])){$j++;}
			$p2 = $vec[$face[$j]];
			if(lineIntersect($p1,$p2,$mid_point,$mid_outside)){
				$num_intersects++;
			}
		}
		
		if((floor($num_intersects/2)*2) != $num_intersects){
			$in_tri = 0;
			for($j = 1; $j < count($face); $j++){
				if(!in_array($j,$point)){
					
					$j_outside = array($vec[$face[$j]][0]+$maxD,$vec[$face[$j]][1]+$maxD,$vec[$face[$j]][2]+$maxD);
					if(lineIntersect($vec[$face[$j]],$j_outside,$vec[$point[0]],$vec[$point[1]])){$in_tri++;echo ".";}
					if(lineIntersect($vec[$face[$j]],$j_outside,$vec[$point[1]],$vec[$point[2]])){$in_tri++;echo "'";}
					if(lineIntersect($vec[$face[$j]],$j_outside,$vec[$point[2]],$vec[$point[0]])){$in_tri++;echo "-";}
					if($in_tri == 1){
						$in_tri = 1;
						break;
					}
				}
			}
			if ($in_tri == 0){
				$tri[] = $point;
				$done[$point[1]] = $point[1];
			}
		}
		else{
			//var_dump($point);
			//var_dump($done);
			//var_dump($num_intersects);die;
		}
	}
	return $tri;
}

function ObjToJson($file){
	$f = fopen($file,'r');
	$in = 'a';
	$vec = array('');
	$face = array();
	$col = array();
	$ctemp = array();
	$vtemp = array();
	$ftemp1 = array();
	$colors = array();
	while (!feof($f)){
		$inl = explode(' ',trim(fgets($f)));
		$inc = $inl[0];
		unset($inl[0]);
		
		if($inc == 'mtllib'){
			$parse = explode('/',$file);
			$mtllib = fopen(str_replace($parse[count($parse) - 1],$inl[1],$file),'r');
			$mtlname = '';
			while(!feof($mtllib)){
				$ml = explode(' ',trim(fgets($mtllib)));
				$mc = $ml[0];
				unset($ml[0]);
				if($mc == 'newmtl'){
					$mtlname = $ml[1];
				}
				if($mc == 'Kd'){
					$colors[$mtlname] = array(round(255*$ml[1]),round(255*$ml[2]),round(255*$ml[3]));
				}
			}
			fclose($mtllib);
		}
		
		if($inc == 'usemtl'){
			$colName = $inl[1];
		}
		
		if($inc == 'v'){
			foreach($inl as $in){
				$vtemp[] = 4 * round(floatval($in),2);
			}
			$vec[] = $vtemp;
			$vtemp = array();
		}
		
		if($inc == 'f'){
			$ftemp2[] = $colors[$colName];
			foreach($inl as $in){
				$ftemp2[] = intval($in);
			}
			$face[] = $ftemp2;
			$ftemp2 = array();
		}
	}
	
	$tris = array();
	for($i = 0; $i < count($face); $i++){
		echo " -".$i;
		$tris[] = triangulate($face[1],$vec);
	}
	var_dump($tris);
	
}


echo ObjToJson('/Applications/XAMPP/xamppfiles/htdocs/train/trains/engine2.obj');

?>
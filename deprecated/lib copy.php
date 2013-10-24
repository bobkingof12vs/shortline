<?php
function calcNormal($face){
	$u = array($face[0][0] - $face[1][0], $face[0][1] - $face[1][1], $face[0][2] - $face[1][2]);
	$v = array($face[2][0] - $face[1][0], $face[2][1] - $face[1][1], $face[2][2] - $face[1][2]);
	return array((($u[1]*$v[2])-($u[2]*$v[1])),(($u[2]*$v[0])-($u[0]*$v[2])),(($u[0]*$v[1])-($u[1]*$v[0])));
}

function dist($p1,$p2){
	return (sqrt(pow(($p2[0]-$p1[0]),2)+pow(($p2[1]-$p1[1]),2)+pow(($p2[2]-$p1[2]),2)));
}

function str($a, $b){
	if($a[0] > $b[0]){
		return -1;
	}
	elseif($a[0] < $b[0]){
		return 1;
	}
}


function flf($a, $b){
	$x = 1;
	$y = 1;
	$z = 1;
	if($a[2]==$b[2]){
		if($a[1]==$b[1]){
			if($a[0]==$b[0]){
				return 0;
			}
			elseif($a[0] > $b[0]){
				return $x;
			}	
			elseif($a[0] < $b[0]){
				return -1*$x;
			}	
		}
		elseif($a[1] > $b[1]){
			return $y;
		}
		elseif($a[1] < $b[1]){
			return -1*$y;
		}
	}
	elseif($a[2] > $b[2]){
		return $z;
	}
	elseif($a[2] < $b[2]){
		return -1*$z;
	}
}

function frf($a, $b){
	$x = 1;
	$y = -1;
	$z = 1;
	if($a[2]==$b[2]){
		if($a[1]==$b[1]){
			if($a[0]==$b[0]){
				return 0;
			}
			elseif($a[0] > $b[0]){
				return $x;
			}	
			elseif($a[0] < $b[0]){
				return -1*$x;
			}	
		}
		elseif($a[1] > $b[1]){
			return $y;
		}
		elseif($a[1] < $b[1]){
			return -1*$y;
		}
	}
	elseif($a[2] > $b[2]){
		return $z;
	}
	elseif($a[2] < $b[2]){
		return -1*$z;
	}
}

function flb($a, $b){
	$x = -1;
	$y = 1;
	$z = 1;
	if($a[2]==$b[2]){
		if($a[1]==$b[1]){
			if($a[0]==$b[0]){
				return 0;
			}
			elseif($a[0] > $b[0]){
				return $x;
			}	
			elseif($a[0] < $b[0]){
				return -1*$x;
			}	
		}
		elseif($a[1] > $b[1]){
			return $y;
		}
		elseif($a[1] < $b[1]){
			return -1*$y;
		}
	}
	elseif($a[2] > $b[2]){
		return $z;
	}
	elseif($a[2] < $b[2]){
		return -1*$z;
	}
}
function frb($a, $b){
	$x = -1;
	$y = -1;
	$z = 1;
	if($a[2]==$b[2]){
		if($a[1]==$b[1]){
			if($a[0]==$b[0]){
				return 0;
			}
			elseif($a[0] > $b[0]){
				return $x;
			}	
			elseif($a[0] < $b[0]){
				return -1*$x;
			}	
		}
		elseif($a[1] > $b[1]){
			return $y;
		}
		elseif($a[1] < $b[1]){
			return -1*$y;
		}
	}
	elseif($a[2] > $b[2]){
		return $z;
	}
	elseif($a[2] < $b[2]){
		return -1*$z;
	}
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
				$vtemp[] = 10 * round(floatval($in),2);
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
	
	$tempx = array();
	$tempy = array();
	$tempz = array();
	$tempn = array();
	foreach($face as $fpart){
		for($i = 1; $i < count($fpart); $i++){
			$tempx[] = $vec[$fpart[$i]][0];
			$tempy[] = $vec[$fpart[$i]][1];
			$tempz[] = $vec[$fpart[$i]][2];
			$tempn[] = array($vec[$fpart[$i]][0],$vec[$fpart[$i]][1],$vec[$fpart[$i]][2]);
		}
		$flf[] = array(array_sum($tempx)/count($tempx),array_sum($tempy)/count($tempy),array_sum($tempz)/count($tempz),$fpart,calcNormal($tempn));
		$frf[] = array(array_sum($tempx)/count($tempx),array_sum($tempy)/count($tempy),array_sum($tempz)/count($tempz),$fpart,calcNormal($tempn));
		$flb[] = array(array_sum($tempx)/count($tempx),array_sum($tempy)/count($tempy),array_sum($tempz)/count($tempz),$fpart,calcNormal($tempn));
		$frb[] = array(array_sum($tempx)/count($tempx),array_sum($tempy)/count($tempy),array_sum($tempz)/count($tempz),$fpart,calcNormal($tempn));
		
		$tempx = array();
		$tempy = array();
		$tempz = array();
		$tempn = array();
	}
	//var_dump( $flf);
	//foreach($flf as $f){echo $f[0].",\t ".$f[1].",\t ".$f[2].",\t ".$f[3].",\t ".$f[4].",\t ".$f[5]."\n";}
	usort($flf,'flf');
	usort($frf,'flf');
	usort($flb,'flf');
	usort($frb,'flf');
	
	foreach($flf as $left){
		//echo $left[0].",\t ".$left[1].",\t ".$left[2].",\t ".$left[3].",\t ".$left[4].",\t ".$left[5].",\t ".$left[6][1]."\n";
		$facelf[] = $left[3];
		$normlf[] = $left[4];
	}
	
	foreach($frf as $right){
		$facerf[] = $right[3];
		$normrf[] = $right[4];
	}
	
	foreach($flb as $left){
		$facelb[] = $left[3];
		$normlb[] = $left[4];
	}
	
	foreach($frb as $right){
		$facerb[] = $right[3];
		$normrb[] = $right[4];
	}
	
	$obj = array('vec' => $vec, 'lf' => $facelf, 'rf' => $facerf, 'lb' => $facelb, 'rb' => $facerb,
							 'nlf' => $normlf, 'nlb' => $normlb, 'nrf' => $normrf, 'nrb' => $normrb);
	return json_encode($obj);
 
 }
 
  //echo ObjToJson('/Applications/XAMPP/xamppfiles/htdocs/train/trains/cube.obj');
?>

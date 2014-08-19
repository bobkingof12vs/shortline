<?php

	include('../mysqli.php');
	extract($_GET);
	if(isset($data)){$data = json_decode($data);}
	
	switch($type){
		case 'points':
			runQuery("replace into train.segments(ownerid,segId,seqNum,x,y,z)
				values
				  (1,{$data->segId},0,{$data->p1->x},{$data->p1->y},{$data->p1->z}),
				  (1,{$data->segId},1,{$data->p2->x},{$data->p2->y},{$data->p2->z}),
					(1,{$data->segId},2,{$data->p3->x},{$data->p3->y},{$data->p3->z})"
			);
			echo "segment inserted";
			break;
		case 'sections':
			$seqNum = -1;
			runquery("delete from train.points where ownerid = 1 and secId = {$data->id}");
			foreach($data->points as $point){
				$seqNum++;
				runQuery("insert into train.points(ownerId,secId,seqNum,x,y,z)
					values(1,{$data->id},$seqNum,{$point->x},{$point->y},{$point->z})");
			}
			
			$seqNum = -1;
			runquery("delete from train.secSegIds where ownerid = 1 and secId = {$data->id}");
			foreach($data->segmentIds as $segId){
				$seqNum++;
				runQuery("insert into train.secSegIds(ownerId,secId,seqNum,segId)
					values(1,{$data->id},$seqNum,{$segId})");
			}
			
			echo "section inserted";
			break;
		default:
			echo "no data received";
			
	}
	
?>
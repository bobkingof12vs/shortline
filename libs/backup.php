<?php

	$body = "../train/\n";

	if ($handle = opendir('/Applications/XAMPP/xamppfiles/htdocs/train/')) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." and $entry != ".." and $entry != '.DS_Store') {
				$body .= "\n\n$entry\n".file_get_contents('/Applications/XAMPP/xamppfiles/htdocs/train/'.$entry);
			}
		}
		closedir($handle);
	}
	$body .= "\n\n../train/libs\n";
	
	if ($handle = opendir('/Applications/XAMPP/xamppfiles/htdocs/train/libs/')) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." and $entry != ".." and $entry != '.DS_Store') {
				$body .= "\n\n$entry\n".file_get_contents('/Applications/XAMPP/xamppfiles/htdocs/train/libs/'.$entry);
			}
		}
		closedir($handle);
	}
	$body .= "\n\n../train/trains\n";
	if ($handle = opendir('/Applications/XAMPP/xamppfiles/htdocs/train/trains/')) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." and $entry != ".." and $entry != '.DS_Store') {
				$body .= "\n\n$entry\n".file_get_contents('/Applications/XAMPP/xamppfiles/htdocs/train/trains/'.$entry);
			}
		}
		closedir($handle);
	}
	
	$body .= "\n\n../train/js\n";
	if ($handle = opendir('/Applications/XAMPP/xamppfiles/htdocs/train/js/')) {
		while (false !== ($entry = readdir($handle))) {
			if ($entry != "." and $entry != ".." and $entry != '.DS_Store') {
				$body .= "\n\n$entry\n".file_get_contents('/Applications/XAMPP/xamppfiles/htdocs/train/js/'.$entry);
			}
		}
		closedir($handle);
	}
	
	$latest_ctime = 0;
	if ($handle = opendir('/Users/jchisholm/Google Drive/backups/')) {
		while (false !== ($entry = readdir($handle))) {
			$filepath = "/Users/jchisholm/Google Drive/backups/$entry";
			// could do also other checks than just checking whether the entry is a file
			if (is_file($filepath) && filectime($filepath) > $latest_ctime) {
				$latest_ctime = filectime($filepath);
				$latest_filename = "/Users/jchisholm/Google Drive/backups/$entry";
			} 
		}
  }
	
	if ( file_get_contents($latest_filename) != $body){
		$date = getdate();
		$file = fopen("/Users/jchisholm/Google Drive/backups/backup{$date[0]}.txt",'w');
		fputs($file,$body);
		fclose($file);
	}

?>

<?php
	define('ASSETPATH', 'assets/');
	define('MINIGAMESPATH', 'minigames/');

	// Does not support flag GLOB_BRACE
	function rglob($pattern, $flags = 0) {
	    $files = glob($pattern, $flags); 
	    foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
	        $files = array_merge($files, rglob($dir.'/'.basename($pattern), $flags));
	    }
	    return $files;
	}

	$image_files = array_merge(rglob(ASSETPATH.'*.png'), rglob(ASSETPATH.'*.jpg')/*, rglob(MINIGAMESPATH.'*.png'), rglob(MINIGAMESPATH.'*.jpg')*/);
	$sound_files = array_merge(rglob(ASSETPATH.'*.mp3')/*, rglob(MINIGAMESPATH.'*.mp3')*/);
	$font_files = rglob(ASSETPATH.'*.fnt');

	$post_data = json_encode(array('images' => $image_files, 'sounds' => $sound_files, 'fonts' => $font_files), JSON_FORCE_OBJECT);

	echo $post_data;
?>
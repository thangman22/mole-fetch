<?php
$data = json_decode( file_get_contents('php://input') );

sleep(60);

$img = str_replace('data:image/png;base64,', '', $data->image);
$img = str_replace(' ', '+', $img);
$data = base64_decode($img);
$file = uniqid() . '.png';
$success = file_put_contents($file, $data);
print $success ? $file : 'Unable to save the file.';
?>

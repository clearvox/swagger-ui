<?php
// This outputs a json file
header("Content-Type: text/json");

// Get all the changelog files
$versionFiles = glob("versions/*.json");

// Build an array of versions
$versions = [];
foreach($versionFiles as $file) {
    $file = pathinfo($file);
    $versions[] = $file['filename'];
}

// Sort naturally
natsort($versions);

$versions = array_reverse($versions);
$versions = array_values($versions);

// Print the json representation
echo json_encode(['versions' => $versions]);
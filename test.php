<?php

if (isset($_POST['savedScenario'])) {

	$ipadd = get_client_ip();
	$myfile = fopen("out/savedScenarios.txt", "a") or die("Unable to open file!");
	$txt = $_POST['savedScenario'];
	fwrite($myfile, "\nIP=" . $ipadd . "&savedScenario=" . $txt);
	fclose($myfile);
	
	echo "done.";

} else {

	echo "no POST data.";

} 

function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}

?>
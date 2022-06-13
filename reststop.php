<?php

if (isset($_POST['pullBathrooms']))
    $jsonSearch = $_POST['pullBathrooms'];
else if (isset($_POST['bathroomUse']))
    $nUsedBathroomID = $_POST['bathroomUse'];
else if (isset($_POST['pullReviews']))
    $nBathroomID = $_POST['pullReviews'];
else if (isset($_POST['writeReview']))
    $jsonReview = $_POST['writeReview'];
else if (isset($_POST['insertBathroom']))
    $jsonNewBathroom = $_POST['insertBathroom'];
else if (isset($_POST['insertBug']))
    $sBug = $_POST['insertBug'];
else if (isset($_POST['giveMeYourIP']))
    $pullIPPOST = $_POST['giveMeYourIP'];
else if (isset($_POST['voteOnABathroom']))
    $jsonVoteData = $_POST['voteOnABathroom'];


if ($jsonSearch)
    $sFeedback = pullBathrooms ($jsonSearch);
else if ($nUsedBathroomID)
    $sFeedback = bathroomUse ($nUsedBathroomID);
else if ($nBathroomID)
    $sFeedback = pullReviews ($nBathroomID);
else if ($jsonReview)
    $sFeedback = writeReview ($jsonReview);
else if ($jsonNewBathroom)
    $sFeedback = insertBathroom ($jsonNewBathroom);
else if ($sBug)
    $sFeedback = insertBug ($sBug);
else if ($pullIPPOST)
    $sFeedback = getUserIPAddr ();
else if ($jsonVoteData)
    $sFeedback = voteOnABathroom ($jsonVoteData);

echo $sFeedback;

function pullBathrooms ($jsonSearch) {
    $objSearch = json_decode ($jsonSearch);

    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    if (0 == $objSearch->type) {
        $objSearch->query = "%" . $objSearch->query . "%";
        $stmt = $dbconnect->prepare("SELECT * FROM Bathrooms WHERE description LIKE ?"); // AND striked=0
    }
    else if (1 == $objSearch->type)
        $stmt = $dbconnect->prepare("SELECT * FROM Bathrooms WHERE state=?");
    else if (2 == $objSearch->type)
        $stmt = $dbconnect->prepare("SELECT * FROM Bathrooms WHERE city=?");
    else if (3 == $objSearch->type)
        $stmt = $dbconnect->prepare("SELECT * FROM Bathrooms WHERE zip=?");
    $stmt->bind_param("s", $objSearch->query);
    $stmt->execute();
    $tResult = $stmt->get_result();
    $nRows = $tResult->num_rows;
    $stmt->close();

    if ($nRows > 10) $nRows = 10;

    $aBathrooms = [];
    if ($nRows > 0) {
        for ($i=0; $i<$nRows; $i++) {
            $row = $tResult->fetch_assoc();
            $aBathrooms[$i] = new stdClass();
            $aBathrooms[$i]->id = $row["id"];
            $aBathrooms[$i]->description = $row["description"];
            $aBathrooms[$i]->adminadress = $row["adminadress"];
            $aBathrooms[$i]->country = $row["country"];
            $aBathrooms[$i]->state = $row["state"];
            $aBathrooms[$i]->city = $row["city"];
            $aBathrooms[$i]->zip = $row["zip"];
            $aBathrooms[$i]->longitude = $row["longitude"];
            $aBathrooms[$i]->latitude = $row["latitude"];
            $aBathrooms[$i]->uses = $row["uses"];
            $aBathrooms[$i]->address = $row["address"];
            $aBathrooms[$i]->created = $row["created"];
            $aBathrooms[$i]->lastuse = $row["lastuse"];
            $aBathrooms[$i]->votes = $row["votes"];
        }
    }

    return json_encode ($aBathrooms);
}

function bathroomUse ($nUsedBathroomID) {
    $sSQL = "UPDATE Bathrooms SET uses = uses + 1 WHERE id=" . $nUsedBathroomID;
    return QueryDB ($sSQL) ? true : null;
}

function pullReviews ($nBathroomID) {
    $sSQL = "SELECT * FROM Reviews WHERE bid=" . $nBathroomID;
    $tResult = QueryDB ($sSQL);
    $nRows = $tResult->num_rows;
    $aReviews = [];

    if ($nRows > 10) $nRows = 10;

    if ($nRows > 0) {
        for ($i=0; $i<$nRows; $i++) {
            $row = $tResult->fetch_assoc();
            $aReviews[$i] = new stdClass();
            $aReviews[$i]->comment = $row["comment"];
            $aReviews[$i]->created = $row["created"]; // timestamp
        }
    }

    return json_encode ($aReviews);
}

function writeReview ($jsonReview) {
    $objReview = json_decode ($jsonReview);

    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("INSERT INTO Reviews (bid, comment) VALUES (?, ?)");
    $stmt->bind_param("is", $objReview->id, $objReview->comment);
    $bStatus = $stmt->execute();
    $stmt->close();

    return $bStatus;
}

function insertBathroom ($jsonNewBathroom) {
    $objBathroom = json_decode ($jsonNewBathroom);

    if (!checkBathroomUnique($objBathroom->latitude, $objBathroom->longitude))
        return "this bathroom is already marked";

    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $one = 1;
    $zero = 0;
    $stmt = $dbconnect->prepare("INSERT INTO Bathrooms (description, country, state, city, adminadress, zip, longitude, latitude, address, uses, votes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssii", $objBathroom->description, $objBathroom->country, $objBathroom->state, $objBathroom->city, $objBathroom->adminadress, $objBathroom->zip, $objBathroom->longitude, $objBathroom->latitude, $objBathroom->address, $one, $zero);
    $bStatus = $stmt->execute();
    $stmt->close();

    return $bStatus;
}

function voteOnABathroom ($jsonVoteData) {
    $objVote = json_decode ($jsonVoteData);
    if ($objVote->bUpvote)
        $sSQL = "UPDATE Bathrooms SET votes = votes + 1 WHERE id=" . $objVote->bid;
    else
        $sSQL = "UPDATE Bathrooms SET votes = votes - 1 WHERE id=" . $objVote->bid;
    return QueryDB ($sSQL) ? true : null;
}

function checkBathroomUnique ($sLat, $sLong) {
    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $stmt = $dbconnect->prepare("SELECT * FROM Bathrooms WHERE latitude=? AND longitude=?");
    $stmt->bind_param("ss", $sLat, $sLong);
    $stmt->execute();
    $tResult = $stmt->get_result();
    $nRows = $tResult->num_rows;
    $stmt->close();
    return 0 == $nRows;
}

function insertBug ($sBug) {
    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);

    $one = 1;
    $stmt = $dbconnect->prepare("INSERT INTO Bugs (bug) VALUES (?)");
    $stmt->bind_param("s", $sBug);
    $bStatus = $stmt->execute();
    $stmt->close();

    return $bStatus;
}

function getUserIPAddr() {
    if(!empty($_SERVER['HTTP_CLIENT_IP'])) // ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    else if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) // ip pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else
        $ip = $_SERVER['REMOTE_ADDR'];
    return $ip;
}


function QueryDB ($sSQL) {
    $dbhost = 'localhost';
    $dbuser = 'rootpisser';
    $dbpass = '';
    $db = "reststop";
    $dbconnect = new mysqli($dbhost, $dbuser, $dbpass, $db);
    $Result = $dbconnect->query($sSQL);
    $dbconnect->close();
    return $Result;
}

?>

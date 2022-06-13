"use strict";

var g_objLocationData = {};
var g_objUserData = {};

onload = () => {
    g_objUserData.dataLoaded = false;
    getLocation();
    MainFrame();
}

function getLocation() {
    if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(logLocation);
    else
        alert("geolocation is not supported in this browser");
}

function logLocation(position) {
    g_objLocationData.latitude = position.coords.latitude;
    g_objLocationData.longitude = position.coords.longitude;
    g_objLocationData.accuracy = position.coords.accuracy; // meters off from location
    g_objLocationData.timestamp = position.timestamp; // maybe 100000 < x < 1000000 from ts pull again
    const geocoder = new google.maps.Geocoder();
    let location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);  // turn coordinates into an object
    geocoder.geocode({'latLng': location}, function (results, status) {
        if (google.maps.GeocoderStatus.OK == status) {
//             let aComponenets = ["streetnumber", "route", "neighborhood", "locality", "administrative_area_level_2", "administrative_area_level_1", "country", "postal_code"];
            // this will DEFINITELY cause err
            g_objLocationData.streetnumber = results[0].address_components[0].long_name;
            g_objLocationData.streetname = results[0].address_components[1].long_name;
            g_objLocationData.neighborhood = results[0].address_components[2].long_name;
            g_objLocationData.city = results[0].address_components[3].long_name;
            if ('administrative_area_level_2' == results[0].address_components[4].types[0]) {
                g_objLocationData.administrativearea = results[0].address_components[4].long_name;
                g_objLocationData.state = results[0].address_components[5].long_name;
                g_objLocationData.country = results[0].address_components[6].long_name;
                g_objLocationData.zip = results[0].address_components[7].long_name;
            }
            else {
                g_objLocationData.state = results[0].address_components[4].long_name;
                g_objLocationData.country = results[0].address_components[5].long_name;
                g_objLocationData.zip = results[0].address_components[6].long_name;
            }
            g_objLocationData.formattedaddress = results[0].formatted_address;
            g_objUserData.dataLoaded = true;
        }
        else
            alert("geolocation error, refresh"); // should never hit
    });
}

function Header() {
    let sPage = "";
    sPage += "<div class='headerFrame'>";
    sPage += "<strong>Reststop</strong><br>";
    sPage += "<a href=\"javascript:MainFrame()\">Home</a> ";
    sPage += "<a href=\"javascript:MarkABathroomFrame()\">Mark a Bathroom</a> ";
    sPage += "<a href=\"javascript:MastHeadFrame()\">Masthead</a> ";
    sPage += "<a href=\"javascript:FoundABugFrame()\">Found A Bug?</a> ";
    sPage += "</div>";
    return sPage;
}

function MainFrame() {
    let sPage = "";
    sPage += Header();
    sPage += "<div id='mainFrame' class='centered'>";
    sPage += "<div style='text-align: center;'>";
    sPage += "Sort By: ";
    sPage += "<a href=\"javascript:checkLocationDataLoaded(1)\">State</a> ";
    sPage += "<a href=\"javascript:checkLocationDataLoaded(2)\">City</a> ";
    sPage += "<a href=\"javascript:checkLocationDataLoaded(3)\">Zip Code</a><br>";
    sPage += "Search: <input id='ajaxBathrooms' onKeyUp='checkLocationDataLoaded(0)' />";
    sPage += "</div>";
    sPage += "<div style='text-align: center;' id='bathroomsInYouArea'></div>";
    sPage += "</div>";
    document.getElementById('main').innerHTML = sPage;

    checkLocationDataLoaded(3);
}

function BathroomFrame(objBathroom) {
    let sPage = "";
    sPage += "<ul>Bathroom's Data:";
    sPage += "<li>description: " + objBathroom.description + "</li>";
    sPage += "<li>state: " + objBathroom.state + "</li>";
    sPage += "<li>city: " + objBathroom.city + "</li>";
    sPage += "<li>zip: " + objBathroom.zip + "</li>";
    sPage += "<li>number of uses: " + objBathroom.uses + "</li>";
    sPage += "<li>date entered: " + objBathroom.created + "</li>";
    sPage += "<li>last used: " + objBathroom.lastuse + "</li>";
    sPage += "</ul>";
    sPage += "<input id='review' style='height: 50px; width: 70%; margin-right: 10px' placeholder='write a review' />";
    sPage += "<button style='height: 50px;' onClick='writeAReview("+objBathroom.id+")'>Submit!</button>";
    sPage += "<br>";
    sPage += "<div id='reviews'></div>";
    document.getElementById('mainFrame').innerHTML = sPage;
    postFileFromServer("reststop.php", "pullReviews=" + encodeURIComponent(objBathroom.id), pullReviewsCallback);
    postFileFromServer("reststop.php", "bathroomUse=" + encodeURIComponent(objBathroom.id), someonePeedCallback);
    function someonePeedCallback(data) {
        if (!data) console.log("possible network error");
    }
}

function pullReviewsCallback(data) {
    let sPage = "";
    let objData;
    if (data)
        objData = JSON.parse(data);
    if (!data || 0 == objData.length) {
        sPage += "No reviews on this Reststop. Leave the first one!";
        document.getElementById('reviews').innerHTML = sPage;
        return;
    }
    sPage += "<ul>Reviews:";
    for (let i=objData.length - 1; i>=0; i--) {
        sPage += "<li>" + objData[i].comment;
        sPage += "<ul>";
        sPage += "<li>" + objData[i].created + "</li>";
        sPage += "</ul></li>";
    }
    sPage += "</ul>";
    document.getElementById('reviews').innerHTML = sPage;
}

function writeAReview(nbID) {
    let sReview = document.getElementById('review').value;
    let objReview = {};
    objReview.comment = sReview;
    objReview.id = nbID;
    let jsonReview = JSON.stringify(objReview);
    postFileFromServer("reststop.php", "writeReview=" + encodeURIComponent(jsonReview), writeReviewCallback);
    function writeReviewCallback(data) {
        if (data) {
            document.getElementById('review').value = "";
            postFileFromServer("reststop.php", "pullReviews=" + encodeURIComponent(nbID), pullReviewsCallback);
        }
    }
}

function MastHeadFrame() {
    let sPage = "";
    sPage += "<div style='text-align: center;'>";
    sPage += "<strong>Founders:</strong><br>Ryan Cheng<br>Wyatt Lake<br>Jake Parker<br>Kian Sharifi<br>John Zhang";
    sPage += "</div>";
    document.getElementById('mainFrame').innerHTML = sPage;
}

function MarkABathroomFrame() {
    let sPage = "";
    sPage += "<div style='text-align: center; padding: 10px;'>";
    sPage += "<textarea id='description' placeholder=Description style='margin-top: 7px;' maxlength=200></textarea><br>";
    sPage += "<button style='margin-top: 7px; width: 70%; height: 30px;' onClick='addBathroomToDatabase()'>Submit!</button>";
    sPage += "<br><div id='thankYou'></div>";
    sPage += "</div>";
    document.getElementById('mainFrame').innerHTML = sPage;
}

function FoundABugFrame() {
    let sPage = "";
    sPage += "<div style='text-align: center; padding: 10px;'>";
    sPage += "<textarea id='bugFinder' placeholder=Bug Description style='margin-top: 7px;' maxlength=200></textarea><br>";
    sPage += "<button style='margin-top: 7px; width: 70%; height: 30px;' onClick='addBugToDatabase()'>Report</button>";
    sPage += "<br><div id='thankYou'></div>";
    sPage += "</div>";
    document.getElementById('mainFrame').innerHTML = sPage;
}

function addBugToDatabase() {
    let sBug = document.getElementById('bugFinder').value;
    postFileFromServer("reststop.php", "insertBug=" + encodeURIComponent(sBug), foundABugCallback);
    function foundABugCallback(data) {
        if (data)
            document.getElementById("thankYou").innerHTML = "Thank you! We will fix this as soon as possible!";
    }
}

/* 0: ajax | 1: state | 2: city | 3: zip */
function checkLocationDataLoaded(nSearchEnum) {
    if (!g_objUserData.dataLoaded) {
        setTimeout(function() {
            if (g_objUserData.dataLoaded)
                findMeABathroom(nSearchEnum);
            else
                checkLocationDataLoaded(nSearchEnum);

        }, 1000);
    }
    else
        findMeABathroom(nSearchEnum);
}

function findMeABathroom(nSearchEnum) {
    let objSearch = { type: nSearchEnum };
    if (0 == nSearchEnum)
        objSearch.query = document.getElementById('ajaxBathrooms').value;
    else if (1 == nSearchEnum)
        objSearch.query = g_objLocationData.state;
    else if (2 == nSearchEnum)
        objSearch.query = g_objLocationData.city;
    else if (3 == nSearchEnum)
        objSearch.query = g_objLocationData.zip;
    let jsonSearch = JSON.stringify(objSearch);
    if (!document.getElementById('bathroomsInYouArea')) return;
    postFileFromServer("reststop.php", "pullBathrooms=" + encodeURIComponent(jsonSearch), findMeABathroomCallback);
    function findMeABathroomCallback(data) {
        let sPage = "";
        let objData;
        if (data) objData = JSON.parse(data);
        if (!data || 0 == objData.length) {
            sPage += "<br>No bathrooms inside your search<br><a href=\"javascript:MarkABathroomFrame()\">Mark your location as a new bathroom</a>";
            document.getElementById('bathroomsInYouArea').innerHTML = sPage;
            return;
        }
        sPage += "<ul>Bathrooms Within Your Search:";
        for (let i=0; i<objData.length; i++) {
            sPage += "<li onClick='BathroomFrame(" + JSON.stringify(objData[i]) + ")'>";
            sPage += objData[i].description;
            sPage += "</li>";
        }
        sPage += "</ul>";
        document.getElementById('bathroomsInYouArea').innerHTML = sPage;
    }
}

function addBathroomToDatabase() {
    let sDescription = document.getElementById('description').value;
    if (!sDescription)
        return;
    let objBathroom = {};
    objBathroom.description = sDescription;
    objBathroom.country = g_objLocationData.country;
    objBathroom.state = g_objLocationData.state;
    objBathroom.city = g_objLocationData.city;
    objBathroom.adminadress = g_objLocationData.administrativearea;
    objBathroom.zip = g_objLocationData.zip;
    objBathroom.longitude = `${g_objLocationData.longitude}`;
    objBathroom.latitude = `${g_objLocationData.latitude}`;
    objBathroom.address = g_objLocationData.formattedaddress;

    if (!objBathroom.longitude || !objBathroom.latitude) {
        document.getElementById("thankYou").innerHTML = "Sorry, we do not have your location";
        return;
    }

    let jsonBathroom = JSON.stringify(objBathroom);
    postFileFromServer("reststop.php", "insertBathroom=" + encodeURIComponent(jsonBathroom), addBathroomToDatabaseCallback);
    function addBathroomToDatabaseCallback(data) {
        if ("this bathroom is already marked" == data) {
            document.getElementById("thankYou").innerHTML = "This bathroom is already marked";
            return;
        }
        if (data)
            document.getElementById("thankYou").innerHTML = "Thank you! Your Reststop has been noted!";
    }
}

function postFileFromServer(url, sData, doneCallback) {
    var xhr;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(sData);
    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}

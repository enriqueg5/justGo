var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = express.Router();
var request = require('request');

//Obtains Athorization for HomeAway API  
var authorize = {
    method: 'POST',
    url: 'https://ws.homeaway.com/oauth/token',
    headers: {
        'cache-control': 'no-cache',
        authorization: 'Basic Y2QyZGQyM2MtYmUwMy00OTk4LTg4NWItYjg0ZDY4ODg4ZjEyOmU4ZjcyZjUzLTRlMTMtNDYyNy04NDQ4LTBhYjQzNDVlYWYyMw=='
    }
};

//global variable to hold selected city
var city;

//===================================================================

router.get('/', function(req, res, next) {
    request(authorize, function(error, response, body) {
        if (error) throw new Error(error);
        // console.log(body);
    })
    res.render('index');
});

router.get('/city', function(req, res, body) {
    res.render('city');
});


router.get('/form', function(req, res, body) {
    res.render('form');
});

router.get('/result', function(req, res, body) {
    res.render('results');
})

//Identify Selected City
// getElementById('nyc').on('click', function(){
//     city = "New York";
// });

router.post('/formResponse', function(req, res) {
    //GET Request Parameters------------------
    console.log(req.body);
    //global parameters
    var sleeps = req.body.numOfPeople;
    var max = req.body.budget;

    //city specific parameters
    var longitude;
    var latitude;
    // if(city === 'New York'){
    //     console.log('city identified, new york');
    //     if(req.body.myActivity === 'food'){
    //         latitude = '40.674857';
    //         longitude = '-73.976870';
    //     }
    // }
    

    var search = {
        method: 'GET',
        url: 'https://ws.homeaway.com/public/search',
        qs: { 
            // q: city,
            minSleeps: sleeps, 
            // availabilityStart: yyyy-MM-dd,
            // availabilityEnd: yyy-MM-dd, 
            // centerPointLongitude: longitude,
            // centerPointLatitude: latitude,
            // distanceInKm: 2,
            maxNightlyPrice: max,
            sort: "averageRating", 
            imageSize: "MEDIUM" 
        },
        headers: {
            'cache-control': 'no-cache',
            authorization: 'Bearer NTZlNjYzZGYtNTYxNS00NWViLWFjZTQtOWY0ZDVlMmMwZjIz'
        }
    };
    // Request---------------------------------
    // console.log(search);
    request(search, function(error, response, body) {
        if (error) throw new Error(error);

        var results = JSON.parse(body);
        var resultArray = [];

        var numOfResults = results.entries.length;

        if (numOfResults === 0) {
            // alert("No Results Match Those Parameters.  Please search again.");
            res.redirect('/form');
        } 
        else {
            for (i = 0; i < numOfResults; i++) {
                var resultObject = {
                    headline: results.entries[i].headline,
                    image: results.entries[i].thumbnail.uri,
                    listing: results.entries[i].listingUrl,
                    description: results.entries[i].description
                }
                resultArray.push(resultObject);
            }
            if(numOfResults < 5){
                var display = "<div class='result-display'><h2 class='headline'>" + resultArray[0].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[0].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[0].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[0].listing + "'>" + "View Listing" + "</a></div>";
            }
            else {
                var display = "<html><head><link rel='stylesheet' type='text/css' href='/assets/css/style.css'></head><body><div class='result-display'><h2 class='headline'>" + resultArray[0].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[0].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[0].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[0].listing + "'>" + "View Listing" + "</a></div>" +

                   "<div class='result-display'><h2 class='headline'>" + resultArray[1].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[1].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[1].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[1].listing + "'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[2].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[2].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[2].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[2].listing + "'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[3].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[3].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[3].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[3].listing + "'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[4].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[4].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[4].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[4].listing + "'>" + "View Listing" + "</a></div></body></html>";
            }
        };      
        res.send(display);
    });    
});

module.exports = router;

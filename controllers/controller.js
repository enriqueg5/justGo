var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var router = express.Router();
var request = require('request');
var selection =require('../public/assets/js/cityPicker.js');

var Sequelize = require('sequelize');

// Change database, username, and password
var sequelize = new Sequelize('users_db', 'root', '151822ea');

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


router.get('/NYC', function(req, res, body) {
    console.log(req.params);
    res.render('form');
});

router.get('/Paris', function(req, res, body) {
    res.render('form');
});

router.get('/London', function(req, res, body) {
    res.render('form');
});

router.post('/listings', function(req, res) {
    console.log(req.body);

    
   
    //PARAMETERS===================================================

    //For ALL Searches
    var sleeps = req.body.numOfPeople;
    var max = req.body.budget;
    var min;
    var city = req.body.city;
    var start;
    var end;
    var activity = req.body.myActivity;

    //Determine minimum price point
    if(max === '300'){
        min = '0';
    }
    else if(max === '1000'){
        min = '300';
    }
    else if(max === '3000'){
        min = '1000';
    }
    else{
        min = '3000';
    }

    //City Specific
    var longitude;
    var latitude;

    //New York
    if(city === 'New York'){
        if(activity.includes('food') && activity.includes('party')){
            console.log('park slope');
            latitude = '40.674857';
            longitude = '-73.976870';
        }
        else if(activity.includes('tourist') && activity.includes('shopping') && activity.includes('sport')){
            console.log('times square');
            latitude = '40.759106';
            longitude = '-73.984273';
        }
        else if(activity.includes('work') && activity.includes('food') && activity.includes('arts')){
            console.log('tribeca');
            latitude = '40.715248';
            longitude = '-74.007532';
        }
        else if(activity.includes('party') && activity.includes('arts')){
            console.log('williamsburg');
            latitude = '40.719621';
            longitude = '-73.960038';
        }
        else{
            latitude = '40.715248';
            longitude = '-74.007532';
        }
    }
    //Paris
    else if(city === 'Paris'){
        if(activity.includes('food') && activity.includes('party')){
            console.log('in paris');
            latitude = '48.868986';
            longitude = '2.343454';
        }
        else if(activity.includes('tourist') && activity.includes('shopping') && activity.includes('sport')){
            console.log('in france');
            latitude = '48.8414';
            longitude = '2.2530';
        }
        else if(activity.includes('work') && activity.includes('food') && activity.includes('arts')){
            console.log('tribeca');
            latitude = '48.8897';
            longitude = '2.2418';
        }
        else if(activity.includes('party') && activity.includes('arts')){
            console.log('france');
            latitude = '48.868986';
            longitude = '2.343454';
        }
        else{
            latitude = '48.8584';
            longitude = '2.2945';
        }
    }
    //London
     else{
        if(activity.includes('food') && activity.includes('party')){
            latitude = '51.501495';
            longitude = '-0.125663';
        }
        else if(activity.includes('tourist') && activity.includes('shopping') && activity.includes('sport')){
            latitude = '51.501495';
            longitude = '-0.125663';
        }
        else if(activity.includes('work') && activity.includes('food') && activity.includes('arts')){
            latitude = '51.501495';
            longitude = '-0.125663';
        }
        else if(activity.includes('party') && activity.includes('arts')){
            latitude = '51.501495';
            longitude = '-0.125663';
        }
        else{
            latitude = '51.501495';
            longitude = '-0.125663';
        }
    };

    //INSERT DATA TO SQL

    sequelize.query("INSERT INTO logs(city, categories) VALUES ('"+city+"', '"+JSON.stringify(activity)+"')");
    tempInsert = "INSERT INTO users(name, lastname, email, phone, city, createdAt, updatedAt) VALUES ('"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.email+"',  '"+req.body.tel+"', '"+req.body.city+"', 'test', 'test')";
    sequelize.query(sequelize.Utils.format(tempInsert), {__factory:{autoIncrementField: 'id'}, id: '' }, {raw: true});

    //SELECT ALL SEARCHES THAT MATCHED
    sequelize.query("SELECT * from logs WHERE city = '"+city+"'" , { type: sequelize.QueryTypes.SELECT})
    .then(function(logs){ 
        
        matchCount = logs.length;
    
    });

    //CREATE SEARCH==================================================
    var search = {
        method: 'GET',
        url: 'https://ws.homeaway.com/public/search',
        qs: { 
            // q: city,
            minSleeps: sleeps, 
            // availabilityStart: yyyy-MM-dd,
            // availabilityEnd: yyy-MM-dd, 
            centerPointLongitude: longitude,
            centerPointLatitude: latitude,
            distanceInKm: 2,
            minNightlyPrice: min,
            maxNightlyPrice: max,
            sort: "averageRating", 
            imageSize: "MEDIUM" 
        },
        headers: {
            'cache-control': 'no-cache',
            authorization: 'Bearer NTZlNjYzZGYtNTYxNS00NWViLWFjZTQtOWY0ZDVlMmMwZjIz'
        }
    };

    console.log('search = ', search);
    //Send Request
    
    request(search, function(error, response, body) {
        if (error) throw new Error(error);

        var results = JSON.parse(body);
        var resultArray = [];

        var numOfResults = results.entries.length;
        // console.log('# results = ', numOfResults)
        if (numOfResults === 0) {
            var noResults="<div><h1 id='no-result'>Sorry, no results matched your search criteria.  Please try again.</h1><a href='/city'><button id='no-result-button action='/city'>Start Over</button></div></a>"
            res.send(noResults);
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
                var display = "<html><head><link rel='stylesheet' type='text/css' href='/assets/css/style.css'></head><body><div class='result-display'><h2 class='headline'>" + resultArray[0].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[0].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[0].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[0].listing + "' target='_blank'>" + "View Listing" + "</a></div></body></html>";
            }
            else {
                var display = "<html><head><link rel='stylesheet' type='text/css' href='/assets/css/style.css'></head><body id='result-body'><div id='wrapper'><a href='#'><div id='button-holder'><button id='result-button'>SEE FRIENDS</button></a></div><div class='result-display'><h2 class='headline'>" + resultArray[0].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[0].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[0].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[0].listing + "' target='_blank'>" + "View Listing" + "</a></div>" +

                   "<div class='result-display'><h2 class='headline'>" + resultArray[1].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[1].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[1].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[1].listing + "' target='_blank'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[2].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[2].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[2].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[2].listing + "' target='_blank'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[3].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[3].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[3].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[3].listing + "' target='_blank'>" + "View Listing" + "</a></div>" +

                    "<div class='result-display'><h2 class='headline'>" + resultArray[4].headline + "</h2>" + "<br>" +
                    "<img class='home-photo' src=" + resultArray[4].image + ">" + "<br>" +
                    "<p class='result-description'>" + resultArray[4].description + "</p><br>" +
                    "<a class='result-link' href='" + resultArray[4].listing + "' target='_blank'>" + "View Listing" + "</a></div></div></body></html>";
            }
        };
       display += "<h1>There are " + matchCount + " people visiting this city for the same reason as you!</h1>";      
       res.send(display);
    });    
});

module.exports = router;

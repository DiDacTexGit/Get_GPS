$("document").ready(function() {

//var refreshrate = 2000; //1000ms refreshes the markers
//var datafiles = ['./data/test.csv','./data/_storage_emulated_0_Tue Sep 18 10_28_46 EDT 2018357497085751631.csv',];
// ----------------Markers ---------------------
let allm = L.markerClusterGroup(); // These will be the markers for map
let markers = {};
let locations = [];
  // infoTemplate is a string template for use with L.Util.template()
var infoTemplate =   '<h2>Phone: {phone}</h2>\
                      <p>Lat: {latitude}</p>\
                      <p>Long: {longitude}</p>';

// map context
//let mymap;
let phoneListElement = document.getElementById('phoneList');
const DAYTON = [39.7889, -84.041916];  // Var to point the map too
// Set the Map ------------------------
let mymap 

const makelist = (list, listElement) => {
        //Getting only the object phone;
        let liststring = '';
        for (var i=0; i<list.length;i++){
          liststring += '<li>'+list[i].phone+'</li>';
        }
        listElement.innerHTML = liststring;
      }


function drawmarkers(infoTemplate, locations){
      let bluemarker  = [];
      let location; //NOTE location not locations
      const len     = locations.length;
      for (i = 0; i < len; i++) {
          location  = locations[i];
          // Here we're defining a new icon to use on our map.
          var icondir     = 'icons/';
          var iconpre     = '.png';
          var iconname    = icondir.concat(location.icon,iconpre);
          var customIcon  = L.icon({
                     iconUrl: iconname,
                     iconSize: [65,65]
                 });
          let marker = new L.marker([location.latitude, location.longitude], {
                  icon: customIcon});
          marker.bindPopup(L.Util.template(infoTemplate,location));
          bluemarker.push(marker);
      }
      const temp = L.markerClusterGroup();
      temp.addLayers(bluemarker);
      return temp

}


  function read_in_markers(data){
      //Read in data and return markers
      // jQuery gives us back the data as a big string, so the first step
      // is to split on the newlines
      var lines     = data.split('\n');
      var i;
      var values ;
      var len       = lines.length;
      for (i = 1; i < len; i++) {
           $('#selectedAddress').text(lines[i]+ "i "+ String(i));
          // for each line, split on the tab character. The lat and long
          // values are in the first and second positions respectively.
          values = lines[i].split(',');
          // ignore header line of the csv as well as the ending newline
          // keep lines that have a numeric value in the first, second slot
          if ( !isNaN(values[1])) {
              locations.push({
                  latitude:   Number(values[8]).toFixed(4),
                  longitude:  Number(values[9]).toFixed(4),
                  name:         values[0],
                  description:  "To Do",
                  team:         "Blue",
                  phone:        values[5],
                  icon:         "female_blue",
                  date:   values[6]
              });
          }
      }
       //$('#selectedAddress').text("Locations"+locations[0].date+" "+locations[0].name);
    //  return locations;
    }

  function update_locations(data,index){
    //Read in data and new locations.  Keep other attributes of locations
    // is to split on the newlines
    var lines     = data.split('\n');
    var i;
    var values ;
    for (i = 1; i < lines.length; i++) {
        values = lines[i].split(',');
        if ( !isNaN(values[1])) {
            locations[index].latitude  =  Number(values[8]).toFixed(4);
            locations[index].longitude =  Number(values[9]).toFixed(4);
        }
    }
    makelist(locations, phoneListElement);
  }

  function createMap(){
    //-------------Different Types of Maps---------
    const Streetmap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });//.addTo(mymap);
    const Stamen_Terrain = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.{ext}', {
  	  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  	  subdomains: 'abcd',
  	  ext: 'png'
    });
    // https: also suppported.
    const Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	   attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    });
    //---------------------------------------
    // Map choices.----------
    const baseMaps = {
     "Street":Streetmap,
     "TopoMap":Stamen_Terrain,
     "WorldImagery":Esri_WorldImagery
    };
    // Set the Map ------------------------
    mymap = L.map('map',{
          layers:[Streetmap]
        }).setView(DAYTON, 15);

    L.control.layers(baseMaps).addTo(mymap);
    mymap.on('click', function(e) {
        var popLocation= e.latlng;
        var popup = L.popup()
        .setLatLng(popLocation)
        .setContent('<h2>Mouse Click Location</h2><p>Lat: ' + e.latlng.lat.toFixed(3) +
               "<br />Long: " + e.latlng.lng.toFixed(3) +'</p>')
        .openOn(mymap);
    });
   }


  function getmarkers(){
      //$('#selectedAddress').text("Getting Marker");
    // locations = [];
    // $.each(datafiles,function(index,file) {
    var file = datafiles[1];
         $.get(file, function(data) {
           if (datafiles.length === locations.length){ //update markers
             update_locations(data,index);
             $('#selectedAddress').text("at index"+ String(index));
             allm.addLayers(allmarker);
             allm.addTo(mymap);
           }else{
             read_in_markers(data); // Initialize markers
             allmarker = new drawmarkers(infoTemplate, locations);
             allm.addLayers(allmarker);
             allm.addTo(mymap);
             // Now we can zoom the map to the extent of the markers
            mymap.fitBounds(allm.getBounds());
        }
      });//$.get()

    }

   $('#Icon_00').on('change',function(e){
     if (0<locations.length){
     textd =  this.options[this.selectedIndex].value;
     //changeIcon(0,textd);
       $('#selectedAddress').text("Updated Markers");
   } else {
     $('#selectedAddress').text("NO Marker");
   }
   makelist(locations, phoneListElement);
   });

function changeIcon(i, text){
     if (i<locations.length){
       var location = locations[i];
       location.icon = text;
       locations[i]=location;
       mymap.removeLayer(allm);
       allm.clearLayers();
       var newIconsLayer=[];
       newIconsLayer =  drawmarkers(infoTemplate, locations);
       allm  = new L.markerClusterGroup();
       allm.addLayers(newIconsLayer);
       allm.addTo(mymap);
        // Now we can zoom the map to the extent of the markers
       mymap.fitBounds(allm.getBounds());
 }
}


function refresh(){
  //Refesh Locations
  //Currently it refeshes everything in Location!
   getmarkers();
   mymap.removeLayer(allm);
   allm.clearLayers();
   var newIconsLayer=[];
   newIconsLayer =  drawmarkers(infoTemplate, locations);
   //allmarker = newIconsLayer;
   allm  = new L.markerClusterGroup();
   allm.addLayers(newIconsLayer);
   allm.addTo(mymap);
}


function get_user_info(latitude,longitude){
  var phone = document.getElementById('Input_00').value;
  var icon = document.getElementById('Icon_00').value;
  if (phone.length>0){ //get and draw the Locations
    //FInd the matching location and if not add to location
    if (locations.length>0){
       var index = locations.findIndex(x => x.phone===phone);
       if (index>=0){
         console.log(index);
         changeIcon(index,icon);
       }
       else{
         console.log("Entering NEW Locations", icon);
         locations.push({
            latitude:   Number(latitude).toFixed(4),
            longitude:  Number(longitude).toFixed(4),
            phone:      phone,
            icon:       icon
          });
          mymap.removeLayer(allm);
          allm.clearLayers();
          let newIconsLayer=[];
          newIconsLayer = new drawmarkers(infoTemplate, locations);
          //allmarker = newIconsLayer;
          allm  = new L.markerClusterGroup();
          allm.addLayers(newIconsLayer);
          allm.addTo(mymap);
          mymap.fitBounds(allm.getBounds());

      }

    }else{
      console.log("Updating Locations", icon);
      locations.push({
          latitude:   Number(latitude).toFixed(4),
          longitude:  Number(longitude).toFixed(4),
          phone:      phone,
          icon:       icon
        });
        console.log("Updating Locations ", locations)
        allmarker = new drawmarkers(infoTemplate, locations);
        allm.addLayers(allmarker);
        allm.addTo(mymap);
        mymap.fitBounds(allm.getBounds());
    }
  }
  }



 //HTML5 input placeholder fix for < ie10
 $('input, textarea').placeholder();


 function uiFixes() {
    //JS to fix the Twitter Typeahead styling, as it is unmodifyable in the bower folder
   $('.twitter-typeahead').css('display', '');
   //Fix for the Twitter Typeahead styling of the pre tag causing issues with horizontal scrolling in conentpanel
   $('pre').css("margin-left", "-50%");
 }

 uiFixes();

 //JS FAQ triggers

 function clickedFAQ(element) {
   var clickedFAQ = element.id;
   var expandFAQ = clickedFAQ + "-expand";
   var isExpandedFAQ = $("#"+expandFAQ).css("display");

   if (isExpandedFAQ === "block"){
     $("#"+expandFAQ).hide("slow");
     $("#"+expandFAQ+" *").hide("slow");
     $("#"+clickedFAQ+" h4 span.expanded-icon").replaceWith("<span class='expand-icon'>+</span>");
     console.log(clickedFAQ+" h4 span.expand-icon");
   }else{
     $("#"+expandFAQ).show();
     $("#"+expandFAQ+" *").show("fast");
     $("#"+clickedFAQ+" h4 span.expand-icon").replaceWith("<span class='expanded-icon'>&#8210;</span>");
   }
 }

 $("[id^=FAQ-]").click( function() {
   clickedFAQ(this);
 });


/// GEO Location stuff
// https://crate.io/a/geolocation-101-get-users-location//

$('#clear-allMarkers-button').on('click',function(e){
  locations = [];
  mymap.removeLayer(allm);
  allm.clearLayers();
});

$('#watch-button').on('click',function(e){
  geolocate();
});

function watchLocation() {
  const watchId = navigator.geolocation.watchPosition(onLocationChange, onGeolocateError);
  window.localStorage.setItem('lastWatch', watchId);
  console.log('Set watchId', watchId);

}

function onLocationChange(coordinates) {
  const { latitude, longitude } = coordinates.coords;
  console.log('Changed coordinates: ', latitude, longitude);
}

function clearWatch() {
  const watchId = window.localStorage.getItem('lastWatch');
  navigator.geolocation.clearWatch(watchId);
  console.log('Cleared watchId: ', watchId);
}

$('#geolocation-button').on('click',function(e){
  geolocate();
  $('#selectedAddress').text("button clicked");
});


function geolocate() {
  $('#selectedAddress').text("Getting geolocation");
  navigator.geolocation.getCurrentPosition(onGeolocateSuccess, onGeolocateError);
  makelist(locations, phoneListElement);
  //postjson();
}

function postjson() {
  var url = "./test.json"
  xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(json.email + ", " + json.name)
    }
   };
   var data = JSON.stringify({"email":"tomb@raider.com","name":"LaraCroft"});
   console.log(data)
   xhr.send(data);
}


function onGeolocateSuccess(coordinates) {
  const { latitude, longitude } = coordinates.coords;
  console.log('Found coordinates: ', latitude, longitude);
  get_user_info(latitude,longitude);
  console.log('Finished coordinates: ', latitude, longitude);
 $('#selectedAddress').text("Finished getting");;
 makelist(locations, phoneListElement);
}

function onGeolocateError(error) {
  console.warn(error.code, error.message);
  if (error.code === 1) {
    // they said no
  } else if (error.code === 2) {
    // position unavailable
  } else if (error.code === 3) {
    // timeout
  }
}



function init(){
  createMap();
  //getmarkers();
  $('#selectedAddress').text("Made Map");
//  var int=self.setInterval(function(){refresh()},refreshrate);
}

init();

});

$(document).ready(function() {
   var natgeo = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
		    attribution : 'Tiles &copy; Esri &mdash; Source: US National Park Service',
		    maxZoom : 12,
		    minZoom : 2
		});

    var map = L.map('map', {
        center : new L.LatLng(0, 0),
        zoom : 2,
        layers : [ natgeo ],
        worldCopyJump : true
    });
    var markerLayer;
     /** Uncomment for layer controls
     * L.control.layers({ "Physical" : natgeo
     * }).addTo(map);
     */
    
    function populateDetails(details) {
	var s = '';
	$.each(details, function(i, d) {
	    s = s + 'Name: ' + d.exname + '<br>' + 
	    'Planting Date: ' + d.pdate + '<br>'
	    + 'Geohash: ' + d['~fl_geohash~'] + '<hr>';
	});
	return s;
    }

    function queryCrop(currentCrop) {
	var markers = [];
	var currentPop;
	if (markerLayer) {
	    map.removeLayer(markerLayer);
	}
	// TODO: Convert this to a pure $.ajax() to allow for cache
	$.getJSON('http://api.agmip.org/ace/1/query/?callback=?&crid='+currentCrop, function(data) {
		    var collapsedJSON = {};
		    $('#status').html('Found ' + data.length + ' results');
		    $.each(data, function(i, d) {
			var ll = new L.LatLng(parseFloat(d.fl_lat),
				parseFloat(d['fl_long']));
			if (collapsedJSON[ll] == undefined) {
			    collapsedJSON[ll] = {};
			    collapsedJSON[ll]['count'] = 1;
			    collapsedJSON[ll]['loc'] = ll;
			    collapsedJSON[ll]['details'] = [];
			    collapsedJSON[ll]['details'].push(d);
			} else {
			    collapsedJSON[ll]['count']++;
			    collapsedJSON[ll]['details'].push(d);
			}
		    });
		    $.each(collapsedJSON, function(i, l) {
			markers.push(new L.marker(l['loc']).on('click', function(e){
			   $('#search-results').html('');
			   $.each(l.details, function(idx, md) {
			       $('#search-results').append('<div>'+
				       '<strong>Name: </strong>'+md.exname+
				       '<br><strong>Planting Date: </strong>'+md.pdate+
				       '<br><strong>Crop: </strong>'+md.crid+
				       '<hr></div>');
			   });
			   $('#search-panel').accordion('option', 'active', 1);
			}));
		    });
		    map.fitWorld();
		    markerLayer = new L.MarkerClusterGroup();
		    markerLayer.addLayers(markers);
		    map.addLayer(markerLayer);
		});
    }
    
    function initSearch() {
	$.getJSON('http://api.agmip.org/ace/1/cache/crop?callback=?', function(data) {
	   $.each(data, function(value, name){
	       $('#crop-search').append('<option value="'+value+'">'+name+'</option>');
	   });
	});
    }

    
    initSearch();
    //queryCrop($('#crop-search option:selected').val());
    $('#search-panel').accordion();
    $('#search').on('click', function(e) {
	$('#status').html('');
	$('#search-results').html('');
	queryCrop($('#crop-search option:selected').val());
    });
});
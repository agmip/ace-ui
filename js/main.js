$(document).ready(function() {
   var natgeo = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
		    attribution : '',
		    maxZoom : 16,
		    minZoom : 1,
		    subdomains: '1234'
		});

    var map = L.map('map', {
        center : new L.LatLng(0, 0),
        zoom : 1,
        layers : [ natgeo ],
        worldCopyJump : true
    });
    var markerLayer;
    var server='http://localhost:8080/';
   
    
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
	var query = '&crid='+currentCrop;
	if ($('#pdate-year').val() != "") {
	    query += '&pdate_year='+($('#pdate-year').val());
	}
	console.log('Query: ',query);
	$.ajax(server+'ace/1/query/beta?callback=?'+query, { 
		dataType: 'jsonp',
		beforeSend: function() { $('#query-spinner').show();},
		complete: function() { $('#query-spinner').hide();},
		success: function(data) {
		    var collapsedJSON = {};
		    console.log(data);
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
		    (function(markers, data) {
			    var len = markers.length;
			    for(var index=0; index < len; index++) {
				var popup;
				markers[index].on('mouseover', function(e) {
				    var ll = this.getLatLng();
				    popup = L.popup({offset: new L.Point(0,-33)}).setLatLng(ll).setContent('There are '+data[ll].details.length+' data entries here.').openOn(map);
				});
				markers[index].on('mouseout', function(e) {
				    map.closePopup();
				});
				markers[index].on('dblclick', function(e) {
				    map.panTo(this.getLatLng());
				    map.zoomIn(3);
				});
			    }
			})(markers, collapsedJSON);
		}});
	
    }
    
    function initSearch() {
	$.getJSON(server+'ace/1/cache/crop?callback=?', function(data) {
	   $.each(data, function(value, name){
	       $('#crop-search').append('<option value="'+value+'">'+name+'</option>');
	   });
	});
    }

    
    initSearch();
    $('#search-panel').accordion();
    $('#tabs').tabs();
    $('#search').on('click', function(e) {
	$('#status').html('');
	$('#search-results').html('');
	queryCrop($('#crop-search option:selected').val());
    });
});
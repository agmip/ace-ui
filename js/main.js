var natgeo = L.tileLayer(
		'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		{
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
/** Layer control if necessary
L.control.layers({
    "Physical" : natgeo
}).addTo(map); */
var markerLayer;

$(document).ready(
	function() {

	    function populateDetails(details) {
		var s = '';
		$.each(details, function(i, d) {
		    s = s + 'Name: ' + d.exname + '<br>' + 'Planting Date: '
			    + d.pdate + '<hr>';
		});
		return s;
	    }

	    function queryCrop(currentCrop) {
		var markers = [];
		if (markerLayer) {
		    map.removeLayer(markerLayer);
		}
		$.getJSON('http://api.agmip.org/ace/1/query/?callback=?&crid='
			+ currentCrop, function(data) {
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
			markers.push(new L.marker(l['loc']).bindPopup(
				"<strong>Number of experiments:</strong> "
					+ l.count + '<br>Lat: ' + l.loc.lat
					+ '<br>Lon: ' + l.loc.lng + '<hr>'
					+ populateDetails(l.details), {
				    minWidth : 200,
				    maxWidth : 450,
				    maxHeight : 125
				}));
		    });
		    map.fitWorld();
		    markerLayer = new L.MarkerClusterGroup();
		    markerLayer.addLayers(markers);
		    map.addLayer(markerLayer);
		});
	    }

	    queryCrop($('#crop option:selected').val());

	    $('#crop').on('change', function(e) {
		$('#status').html('');
		queryCrop($('option:selected', this).val());
	    });
	});
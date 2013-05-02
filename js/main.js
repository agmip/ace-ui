var terrain = L
	.tileLayer(
		'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		{
		    attribution : 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
		    maxZoom : 12,
		    minZoom : 2
		}), natgeo = L
	.tileLayer(
		'http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		{
		    attribution : 'Tiles &copy; Esri &mdash; Source: US National Park Service',
		    maxZoom : 12,
		    minZoom : 2
		});

var map = L.map('map', {
    center : new L.LatLng(0, 0),
    zoom : 2,
    layers : [ terrain, natgeo ],
    worldCopyJump : true
});
L.control.layers({
    "Topography" : terrain,
    "Physical" : natgeo
}).addTo(map);
var markerLayer = L.layerGroup();
markerLayer.addTo(map);

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
		markerLayer.clearLayers();
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
			markerLayer.addLayer(L.marker(l['loc']).bindPopup(
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
		});
	    }

	    queryCrop($('#crop option:selected').val());

	    $('#crop').on('change', function(e) {
		$('#status').html('');
		queryCrop($('option:selected', this).val());
	    });
	});
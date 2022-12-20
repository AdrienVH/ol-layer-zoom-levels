/**********************************************************************************/
/*********************************************************************** LAYERS ***/
/**********************************************************************************/

const basemap = new ol.layer.Tile({
	source: new ol.source.XYZ({ url: 'https://api.mapbox.com/styles/v1/adrienvh/cl1rt30gq000a14pc9yr9oii2/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYWRyaWVudmgiLCJhIjoiU2lDV0N5cyJ9.2pFJAwvwZ9eBKKPiOrNWEw' }),
	name: "Basemap"
})

const city = new ol.layer.Vector({
	source: new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(cityGeojson),
		projection : 'EPSG:3857'
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({ color: '#0b7285', width: 2, lineDash: [2, 5] })
	}),
	name: "City",
	maxZoom: 17
})

const buildings = new ol.layer.Vector({
	source: new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(buildingsGeojson),
		projection : 'EPSG:3857'
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({ color: 'white', width: 0.5 }),
		fill: new ol.style.Fill({ color: '#fab005' })
	}),
	name: "Buildings",
	minZoom: 16
})

const trees = new ol.layer.Vector({
	source: new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(treesGeojson),
		projection : 'EPSG:3857'
	}),
	style: new ol.style.Style({
		image: new ol.style.Circle({
			radius: 4,
			stroke: new ol.style.Stroke({ color: 'white', width: 0.5 }),
			fill: new ol.style.Fill({ color: '#82c91e' })
		})
	}),
	name: "Trees",
	minZoom: 15,
	maxZoom: 18
})

/**********************************************************************************/
/************************************************************************** MAP ***/
/**********************************************************************************/

const WIDTH_OF_A_ZOOM_LEVEL = 20

const BLUES = ['#d0ebff', '#74c0fc', '#1c7ed6']
const GREYS = ['#f1f3f5', '#ced4da', '#495057']

const url = new URLSearchParams(window.location.search)
const eventType = url.get('event') === 'moveend' ? 'moveend' : 'postrender'

const map = new ol.Map({
	layers: [basemap, city, buildings, trees],
	target: document.getElementById('map'),
	view: new ol.View({
		center: ol.proj.transform([2.65732, 48.54296], 'EPSG:4326','EPSG:3857'),
		zoom: 14,
		minZoom: 10,
		maxZoom: 20
	}),
	controls: ol.control.defaults({ zoom: false })
})

let mapCurrentZoom = -1

map.on(eventType, function(e) {
	if (mapCurrentZoom == -1) {
		initZoomBars(map.getView().getMinZoom(), map.getView().getMaxZoom())
		updateZoomBars(map.getView().getMinZoom(), map.getView().getZoom(), map.getView().getMaxZoom())
	} else if (map.getView().getZoom() !== mapCurrentZoom) {
		updateZoomBars(map.getView().getMinZoom(), map.getView().getZoom(), map.getView().getMaxZoom())
	}
	mapCurrentZoom = map.getView().getZoom()
})

function initZoomBars(mapMinZoom, mapMaxZoom) {
	// Layers
	for (const layer of map.getLayers().getArray()) {
		// Layer Zooms
		const layerMinZoom = Math.abs(layer.getMinZoom()) === Infinity || layer.getMinZoom() < mapMinZoom ? mapMinZoom : layer.getMinZoom()
		const layerMaxZoom = Math.abs(layer.getMaxZoom()) === Infinity || layer.getMaxZoom() > mapMaxZoom ? mapMaxZoom : layer.getMaxZoom()
		// div
		const layerDiv = $(`<div class="layer" id="layer_${layer.ol_uid}"></div>`)
			.appendTo('#layers')
		// div p
		const layerP = $(`<p>${layer.get('name')}</p>`)
			.appendTo(layerDiv)
		// div p span
		$(`<span>i</span>`)
			.appendTo(layerP)	
			.attr('title', `This "${layer.get('name')}" layer is visible from ${layerMinZoom.toFixed(2)} to ${layerMaxZoom.toFixed(2)}`)
			.tipTop()
		// div div.zoomBar
		const zoomBarDiv = $(`<div class="zoomBar"></div>`)
			.appendTo(layerDiv)
			.css('width', `${(mapMaxZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
		// div div.zoomBar div.layerZooms
		$('<div class="layerZooms"></div>')
			.appendTo(zoomBarDiv)
			.css('left', `${(layerMinZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
			.css('width', `${(layerMaxZoom - layerMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
		// div div.zoomBar div.mapCurrentZoom
		$('<div class="mapCurrentZoom"></div>')
			.appendTo(zoomBarDiv)
		// div div.zoomTicks
		$(`<div class="zoomTicks"></div>`)
			.appendTo(layerDiv)
			.css('width', `${(mapMaxZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
		// div div.zoomTicksLabels
		$(`<div class="zoomTicksLabels"></div>`)
			.appendTo(layerDiv)
			.css('width', `${(mapMaxZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
	}
	// Add ticks & labels
	for (let zoomLevel = Math.ceil(mapMinZoom + 1); zoomLevel <= Math.ceil(mapMaxZoom - 1); zoomLevel++) {
		// .zoomTicks
		$(`<div></div>`)
			.appendTo('.zoomTicks')
			.css('left', `${(zoomLevel - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
		// .zoomTicksLabels
		$(`<div>${zoomLevel}</div>`)
			.appendTo('.zoomTicksLabels')
			.css('left', `${((zoomLevel - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL - 5)}px`)
	}
	// Reverse the layers
	const layersList = $('#layers')
	const layers = layersList.children('.layer')
	layersList.append(layers.get().reverse())
}

function updateZoomBars(mapMinZoom, mapCurrentZoom, mapMaxZoom) {
	// Layers
	for (const layer of map.getLayers().getArray()) {
		// Layer Zooms
		const layerMinZoom = Math.abs(layer.getMinZoom()) === Infinity || layer.getMinZoom() < mapMinZoom ? mapMinZoom : layer.getMinZoom()
		const layerMaxZoom = Math.abs(layer.getMaxZoom()) === Infinity || layer.getMaxZoom() > mapMaxZoom ? mapMaxZoom : layer.getMaxZoom()
		// div p
		$(`#layer_${layer.ol_uid} p`)
			.css('color', layer.rendered ? BLUES[2] : GREYS[2])
		// div p span
		$(`#layer_${layer.ol_uid} p span`)
			.attr('title', `This "${layer.get('name')}" layer is visible from ${layerMinZoom.toFixed(2)} to ${layerMaxZoom.toFixed(2)} ${layer.rendered ? 'and' : 'but'} current zoom is ${mapCurrentZoom.toFixed(2)}`)
		// div div.zoomBar
		$(`#layer_${layer.ol_uid} div.zoomBar`)
			.css('background-color', layer.rendered ? BLUES[0] : GREYS[0])
		// div div.zoomBar div.layerZooms
		$(`#layer_${layer.ol_uid} div.layerZooms`)
			.css('background-color', layer.rendered ? BLUES[1] : GREYS[1])
		// div div.zoomBar div.mapCurrentZoom
		$(`#layer_${layer.ol_uid} div.mapCurrentZoom`)
			.css('left', `${(mapCurrentZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
	}
}

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
		stroke: new ol.style.Stroke({ color: 'black', width: 2, lineDash: [2, 5] })
	}),
	name: "City",
	maxZoom: 18
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
		maxZoom: 22
	}),
	controls: ol.control.defaults({ zoom: false })
})

let mapCurrentZoom = -1

map.on(eventType, function(e) {
	if (map.getView().getZoom() !== mapCurrentZoom) {
		$('#layers .layer').remove()
		// Map Zooms
		const mapMinZoom = map.getView().getMinZoom()
		const mapMaxZoom = map.getView().getMaxZoom()
		mapCurrentZoom = map.getView().getZoom()
		// Layers
		for (const layer of map.getLayers().getArray()) {
			// Layer Zooms
			const layerMinZoom = Math.abs(layer.getMinZoom()) === Infinity || layer.getMinZoom() < mapMinZoom ? mapMinZoom : layer.getMinZoom()
			const layerMaxZoom = Math.abs(layer.getMaxZoom()) === Infinity || layer.getMaxZoom() > mapMaxZoom ? mapMaxZoom : layer.getMaxZoom()
			// div.layer
			const layerDiv = $(`<div class="layer" id="layer${layer.ol_uid}"></div>`).appendTo('#layers')
			// div.layer p
			const layerP = $(`<p>${layer.get('name')} :</p>`)
				.appendTo(layerDiv)
				.css('color', layer.rendered ? BLUES[2] : GREYS[2])
			// div.layer p span
			$(`<span>i</span>`)
				.appendTo(layerP)	
				.attr('title', `This "${layer.get('name')}" layer is visible from ${layerMinZoom.toFixed(2)} to ${layerMaxZoom.toFixed(2)} ${layer.rendered ? 'and' : 'but'} current zoom is ${mapCurrentZoom.toFixed(2)}`)
				.tipTop()
			// div.layer div.zoomBar
			const zoomBarDiv = $(`<div class="zoomBar"></div>`)
				.appendTo(layerDiv)
				.css('width', `${(mapMaxZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
				.css('background-color', layer.rendered ? BLUES[0] : GREYS[0])
			// div.layer div.zoomBar div.layerZooms
			$('<div class="layerZooms"></div>')
				.appendTo(zoomBarDiv)
				.css('left', `${(layerMinZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
				.css('width', `${(layerMaxZoom - layerMinZoom) * WIDTH_OF_A_ZOOM_LEVEL}px`)
				.css('background-color', layer.rendered ? BLUES[1] : GREYS[1])
			// div.layer div.zoomBar div.mapCurrentZoom
			$('<div class="mapCurrentZoom"></div>')
				.appendTo(zoomBarDiv)
				.css('left', `${((mapCurrentZoom - mapMinZoom) * WIDTH_OF_A_ZOOM_LEVEL) - 1}px`)
				.css('background-color', layer.rendered ? BLUES[2] : GREYS[2])
		}
		// Reverse the layers 
		const list = $('#layers')
		const listItems = list.children('.layer')
		list.append(listItems.get().reverse())
	}
})
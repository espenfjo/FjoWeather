var dashboard = {};
var graphite = 'http://graphite.mrfjo.org/render/';

$(function () {
    dashboard.elements =
        [
            {
                name: "Balkong",
                metric:"mrfjo.hjemme.temp.telldus.Balkong",
                type: 'temperature',
                suffix: '',
                scale: '',
                single: true
            },
            {
                name: "Soverom",
                metric: "mrfjo.hjemme.temp.telldus.Soverom",
                type: 'temperature',
                suffix: '',
                scale: '',
                single: true
            },
            {
                name: "Barometer",
                metric: "mrfjo.hjemme.pressure.bmp085_pressure",
                type: 'pressure',
                suffix: '',
                scale: '',
                single: true
            }

    ];      
});
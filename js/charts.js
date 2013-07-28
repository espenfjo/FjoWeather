function temperature(name, metricPath, id) {
    $("#graphs").append('<div id="' + name + '" class="col-4">foo</div>');
    var chart;
    var options = {
        chart: {
            renderTo: name,
            type: "column",
            width: 200,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            events: {
                load: liveData(metricPath, $(this), id)
            }
        },
        plotOptions: {
            column: {
                pointWidth: 10
            }
        },
        legend: {
            enabled: false
        },
        title: {
            text: name
        },
        series: [ {
            name: "Temperature",
            data: [],
            tooltip: {
                valueSuffix: " °C"
            }
        } ]
    };
    $.ajax({
        async: false,
        dataType: "json",
        url: graphite + "?target=" + metricPath + "&from=-20minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            options.series[0].data = [ data[0] ];
        },
        cache: false
    });
    chart = new Highcharts.Chart(options);
}

function pressure(name, metricPath, id) {
    $("#graphs").append('<div id="barometer" class="col-4"></div>');
    var chart;
    var options = {
        chart: {
            renderTo: "barometer",
            type: "gauge",
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            events: {
                load: liveData(metricPath, $(this), id)
            }
        },
        title: {
            text: "Pressure"
        },
        pane: {
            startAngle: -120,
            endAngle: 120,
            background: [ {
                backgroundColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [ [ 0, "#FFF" ], [ 1, "#333" ] ]
                },
                borderWidth: 0,
                outerRadius: "109%"
            }, {
                backgroundColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [ [ 0, "#333" ], [ 1, "#FFF" ] ]
                },
                borderWidth: 1,
                outerRadius: "107%"
            }, {}, {
                backgroundColor: "#DDD",
                borderWidth: 0,
                outerRadius: "105%",
                innerRadius: "103%"
            } ]
        },
        yAxis: {
            min: 95e3,
            max: 105e3,
            minorTickInterval: "auto",
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: "inside",
            minorTickColor: "#666",
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: "inside",
            tickLength: 10,
            tickColor: "#666",
            labels: {
                step: 2,
                rotation: "auto"
            },
            title: {
                text: "Pa"
            },
            plotOptions: {
                gauge: {
                    dial: {}
                }
            },
            plotBands: [ {
                from: 95e3,
                to: 98e3,
                color: "#DF5353"
            }, {
                from: 98e3,
                to: 99e3,
                color: "#DDDF0D"
            }, {
                from: 99e3,
                to: 101e3,
                color: "#55BF3B"
            }, {
                from: 101e3,
                to: 102e3,
                color: "#DDDF0D"
            }, {
                from: 102e3,
                to: 105e3,
                color: "#DF5353"
            } ]
        },
        series: [ {
            name: "Pressure",
            data: [],
            tooltip: {
                valueSuffix: " Pa"
            }
        } ]
    };
    $.ajax({
        async: false,
        dataType: "json",
        url: graphite + "?target=" + metricPath + "&from=-20minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            options.series[0].data = [ data[0] ];
        },
        cache: false
    });
    chart = new Highcharts.Chart(options);
}

function liveData(element, that, id) {
    var chart = that[0].Highcharts.charts[id];
    if (typeof chart === "undefined") {
        setTimeout(function() {
            liveData(element, $(this), id);
        }, 5e3);
        return;
    }
    $.ajax({
        url: graphite + "?target=" + element + "&from=-20minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            console.info(data);
            chart.series[0].setData([ data[0] ]);
            setTimeout(function() {
                liveData(element, $(this), id);
            }, 5e3);
        },
        cache: false
    });
}

function getLatestPoint(points) {
    var i = points.length - 1;
    for (;i >= 0; i--) {
        var data = points[i];
        if (data[0] !== null) {
            return data;
        }
    }
}

/**
 * @license
 * Copyright 2013 Espen Fjellvær Olsen espen@mrfjo.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var name, single, metric, prefix;

$(function() {
    $("#dp1").datepicker({
        autoclose: true,
        minViewMode: "months",
        todayHighlight: true
    }).on("changeDate", function(ev) {
        startDate = new Date(ev.date);
        var month = startDate.getMonth() + 1;
        if (month < 10) month = "0" + month;
        var id = queryObj()["id"];
        setupChart(createUrl(startDate, id), id);
    });
    var now = new Date();
    var month = now.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var today = month + "-" + now.getFullYear();
    $(".datepicker").datepicker("setDate", now);
    $("#dp1 input").val(today);
    $("#dropdown-menu").empty();
    populateDropdown();
    setListener();
});

function setListener() {
    $(".dropdown-metric").on("click", function() {
        var id = $(this).attr("id");
        setupChart(createUrl(new Date(), id), id);
    });
    $(".home").on("click", function() {
        var id = $(this).attr("id");
        setupDashboard();
    });
}

function getMetricById(id) {
    return metrics[id];
}

function populateDropdown() {
    for (var i = 0; i < metrics.length; i++) {
        var metric = metrics[i];
        var name = metric.name;
        var metricPath = metric.metricPath;
        var type = metric.type;
        if ($("#" + type).length == 0) {
            $("#dropdown-menu").append("<li id='" + type + "' class='dropdown-header'>" + type + "</li>");
            $("#dropdown-menu").append("<li class='divider'></li>");
        }
        $("#" + type).after("<li> <span id='" + i + "'class='dropdown-metric'>" + name + "</span></li>");
    }
    $(".divider").last().remove();
}

function clearCharts() {
    if (typeof Highcharts !== "undefined") {
        for (var i = 0; i < Highcharts.charts.length; i++) {
            console.info(Highcharts);
            Highcharts.charts[i].destroy();
            console.info("Killing chart " + i);
        }
        Highcharts.charts = [];
    }
}

function setupDashboard() {
    clearCharts();
    for (var i = 0; i < metrics.length; i++) {
        var metric = metrics[i];
        var name = metric.name;
        var metricPath = metric.metricPath;
        var type = metric.type;
        if (metric.dashboard === true) {
            this[type](name, metricPath, i);
        }
    }
}

function createUrl(startDate, id) {
    var metric = getMetricById(id);
    var metricPath = metric.metricPath;
    var scale = metric.scale;
    var single = metric.single;
    var name = metric.name;
    if (typeof scale === "undefined" || scale == "") scale = 1;
    if (typeof startDate === "undefined") startDate = new Date();
    var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    var start_year = startDate.getFullYear();
    var start_month = startDate.getMonth() + 1;
    var end_year = endDate.getFullYear();
    var end_month = endDate.getMonth() + 1;
    var end_date = endDate.getDate();
    var url = graphite;
    date_from = "00:00_" + start_year + start_month + "01";
    date_to = "23:59_" + end_year + end_month + end_date;
    url += "?from=" + date_from + "&until=" + date_to;
    url += "&target=";
    var gd = metricPath;
    if (typeof single !== "undefined" && single != false) {
        if (typeof scale !== "undefined") {
            gd = "scale(" + gd + ',"' + scale + '")';
        }
        if (typeof name !== "undefined") {
            gd = "alias(" + gd + ',"' + name + '")';
        }
    }
    if (typeof single === "undefined" || single == "" || single == false) {
        var lgd = gd;
        if (typeof name !== "undefined" && name != "") {
            gd = sprintf("alias(scale(smartSummarize( %s, '1day', 'max'), %s), '%s Average')", lgd, scale, name);
            gd += sprintf("&target=alias(scale(smartSummarize( %s, '1day','min'), %s), '%s Min')", lgd, scale, name);
            gd += sprintf("&target=alias(scale(smartSummarize( %s, '1day','avg'), %s), '%s Average')", lgd, scale, name);
        } else {
            gd = "smartSummarize(" + lgd + ',"1day","max")';
            gd += "&target=smartSummarize(" + lgd + ",'1day','min')";
            gd += "&target=smartSummarize(" + lgd + ",'1day','avg')";
        }
    }
    url += gd;
    url += "&format=json&rawData=true";
    return url;
}

function setupChart(url, id) {
    clearCharts();
    $("#graphs").empty();
    $("#graphs").append('<div id="graph"></div>');
    var nodata = false;
    var title;
    var metric = getMetricById(id);
    var suffix = metric.suffix;
    var options = {
        chart: {
            renderTo: "#graph",
            type: "line",
            renderTo: "graph",
            marginTop: 80,
            zoomType: "xy"
        },
        title: {
            text: title
        },
        legend: {
            enabled: true,
            align: "right",
            borderColor: "black",
            borderWidth: 2,
            layout: "vertical",
            verticalAlign: "top",
            shadow: true,
            useHTML: true,
            floating: true,
            x: -1,
            y: -1,
            labelFormatter: function() {
                var name = this.chart.options.series[0].name;
                var curUrl = location.href;
                var single = metric.single;
                if (typeof single === "undefined" || single == "" || single == false) {
                    metric.single = true;
                    link = '<span class="dropdown-metric" onclick="javascript:setupChart(createUrl(new Date(), id), id)" id="' + id + '" style="color:#0898d9;text-decoration:underline;">[View detailed graph]</span>';
                } else {
                    metric.single = false;
                    link = '<span onclick="javascript:setupChart(createUrl(new Date(), id), id)" class="dropdown-metric" id="' + id + '" style="color:#0898d9;text-decoration:underline;">[View average]</span>';
                }
                return name + " " + link;
            }
        },
        rangeSelector: {
            enabled: false
        },
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: " " + suffix
        },
        yAxis: {
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            type: "linear"
        },
        xAxis: {
            type: "datetime"
        },
        series: []
    };
    $.ajax({
        async: false,
        url: url,
        dataType: "json",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                options.series[i] = [];
                options.series[i].id = i;
                options.series[i].name = data[i].target;
                options.series[i].data = flip(data[i].datapoints);
            }
            if (data.length > 1) {
                options.series[0].type = "arearange";
                options.series[0].linkedTo = ":next";
                options.series[0].data = merge(options.series[0].data, options.series[1].data);
                options.series[0].color = Highcharts.getOptions().colors[0];
                options.series[0].fillOpacity = .3;
                options.series[1] = options.series[2];
                options.series[1].zIndex = 1, options.series[1].marker = {
                    enabled: true,
                    fillColor: "white",
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }, options.series.splice($.inArray(2, options.series), 1);
            }
            if (data.length == 0 && typeof data.datapoints === "undefined") {
                nodata = true;
            }
        },
        cache: false
    });
    if (options.series.length > 0) options.title.text = options.series[0].name;
    var chart = new Highcharts.StockChart(options);
    if (nodata) {
        chart.showLoading("No data available for this metric for the given time period!");
    }
}

function merge(one, two) {
    for (var i = 0; i < one.length; i++) {
        one[i].push(two[i][1]);
    }
    return one;
}

function flip(series) {
    newseries = [];
    for (var i = 0; i < series.length; i++) {
        newseries.push([ series[i][1] * 1e3, series[i][0] ]);
    }
    return newseries;
}

function queryObj() {
    var result = {}, queryString = location.href, re = /([^?=]+)=([^&]*)/g, m;
    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
}

function sprintf(format) {
    for (var i = 1; i < arguments.length; i++) {
        format = format.replace(/%s/, arguments[i]);
    }
    return format;
}
d3.json("stock.json", function(error, data) {
    if (error) throw error;
    console.log(data);


    var bbo = data.bboList.map(function(stocks){
        return{
            ask: stocks.ask,
            bid: stocks.bid,
            timeStr: stocks.timeStr
        }
    });

    var tradeList = data.tradeList.map(function(stocks){
        return{
            price: stocks.price,
            time: stocks.time,
            shares: stocks.shares,
            tradeType: stocks.tradeType,
            orderReferenceNumber: stocks.orderReferenceNumber
        }
    });

    function nsToTime(duration) {
        var nanoseconds = parseInt((duration%10000)/1000),
            milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds + "."+nanoseconds;
    }

    var format = d3.time.format("%I%M%p");

    bbo.forEach(function(time, d) {
        var bboTime = time.timeStr;
        parseInt(bboTime, 10);
        console.log(nsToTime(parseInt(bboTime, 10)));
        d.bboTime = format(d.bboTime);
        d["bboTime"]= +d["bboTime"];
    });

    tradeList.forEach(function(trade, d) {
        var tradeTime = moment(trade.time);
        nsToTime(tradeTime);
        d.tradeTime = format(d.tradeTime);
        d["tradeTime"] = +d["tradeTime"];
        console.log(nsToTime(tradeTime));
    });

    x.domain(d3.extent(bbo, function(time) { return time.bbo.bboTime; }));
    x.domain(d3.extent(tradeList, function(time) { return time.tradeList.tradeTime; }));
});

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.svg.axisBottom(x)

var yAxis = d3.svg.axisLeft(y)

var line = d3.svg.area()
    .x(function(d) { return x(d.bboList.timeStr); })
    .y(function(d) { return y(d["bboList"]); });

var area = d3.svg.area()
    .curve(d3.curveStepAfter())
    .x0(function(d){ return x(d.bboTime);})
    .y0(function(d) { return y(d.bbo.ask); })
    .y1(function(d) { return y(d.bbo.bid); });

var area2 = d3.svg.area()
    .curve(d3.curveStepAfter())
    .x(function(d) { return x(data.tradeList.time); })
    .y1(function(d) { return y(d.bbo.price); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// function update(){
// //x.domain(d3.extent(data, function(d) { return d.bboList.timeStr; }));
//
// y.domain([
//     d3.min(data, function(d) { return Math.min(d["bboList"], d["tradeList"]); }),
//     d3.max(data, function(d) { return Math.max(d["bboList"], d["tradeList"]); })
// ]);
//
// svg.datum(data);
//
// svg.append("clipPath")
//     .attr("id", "clip-below")
//     .append("path")
//     .attr("d", area.y0(height));
//
// svg.append("clipPath")
//     .attr("id", "clip-above")
//     .append("path")
//     .attr("d", area.y0(0));
//
// svg.append("path")
//     .attr("class", "area above")
//     .attr("clip-path", "url(#clip-above)")
//     .attr("d", area.y0(function(d) { return y(d["San Francisco"]); }));
//
// svg.append("path")
//     .attr("class", "area below")
//     .attr("clip-path", "url(#clip-below)")
//     .attr("d", area);
//
// svg.append("path")
//     .attr("class", "line")
//     .attr("d", line);
//
// svg.append("g")
//     .attr("class", "x axis")
//     .attr("transform", "translate(0," + height + ")")
//     .call(xAxis);
//
// svg.append("g")
//     .attr("class", "y axis")
//     .call(yAxis)
//     .append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .text("Price ($)");
// };
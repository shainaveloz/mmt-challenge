d3.json("stock.json", function(error, data) {
    if (error) throw error;
    console.log(data);

    //map out objects
    var bboList = data.bboList.map(function(stocks){
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

    //create function for converting times
    function nsToTime(duration) {
        var nanoseconds = parseInt((duration%10000)/1000),
            milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds + "."+ nanoseconds;
    }

    var format = d3.timeParse("%X");
    var times = [];
    var priceArray = [];
    var askArray = [];
    var bidArray = [];
    var bboTimes = [];

    //Loop through bboList to put data into an empty array
    for(var i = 0; i<bboList.length; i++){
        //convert hundreds of pennies to dollars
        var ask = ((bboList[i].ask)/10000).toFixed(2);
        var bid = ((bboList[i].bid)/10000).toFixed(2);
        var bboTimeArray = bboList[i].timeStr;

        times.push(bboTimeArray);
        askArray.push(ask);
        bidArray.push(bid);
        bboTimes.push(bboTimeArray);
    }

    //Loop through tradeList to put data into an empty array
    for(var j = 0; j<tradeList.length; j++){
        //convert hundreds of pennies to dollars
        //use time converter to change time format
        var tradeTime = nsToTime(tradeList[j].time);
        var tradePrice = ((tradeList[j].price)/10000).toFixed(2);

        times.push(tradeTime);
        priceArray.push(tradePrice);
    }

    var newTimes = times.sort();
    var newPrices = priceArray.sort();
    var newAskArray = askArray.sort();
    var newBidArray = bidArray.sort();
    var newBboTimesArray = bboTimes.sort();

    //Create empty object for chart data
    //Push in other arrays into this one
    var chartData = {
        times: newTimes,
        prices: newPrices,
        bboAsk: newAskArray,
        bids: newBidArray,
        bboTimes: newBboTimesArray
    };
    console.log(chartData);

    //Make new arrays available for the graph
    chartData.times.forEach(function(d){
        d.times = format(d.times);
        console.log(d.times);
    });

    chartData.prices.forEach(function(d){
        d.prices = +d.prices;
        console.log(d.prices);
    });

    chartData.bboAsk.forEach(function(d){
        d.bboAsk = +d.bboAsk;
        console.log(d.bboAsk);
    });

    chartData.bids.forEach(function(d){
        d.bids = +d.bids;
        console.log(d.bids);
    });

    chartData.bboTimes.forEach(function(d){
        d.bboTimes = format(d.bboTimes);
        console.log(d.bboTimes);
    });

    //Create a function for the creation of the graph
    function initialize(){
        var svg = d3.select("svg"),
            margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scaleTime()
            .range([0, width]);

        var y = d3.scaleLinear()
            .range([height, 0]);

        var xAxis = d3.axisBottom(x);

        var yAxis = d3.axisLeft(y);

        var area = d3.area()
            .curve(d3.curveStepAfter)
            .x0(function(d){ return x(d.bboTimes);})
            .y0(function(d) { return y(d.bboAsk); })
            .y1(function(d) { return y(d.bids); });

        x.domain(d3.extent(chartData, function(d) { return d.times; }));
        y.domain([0, d3.max(chartData, function(d) { return d.prices; })]);
        area.y0(height);

        g.append("path")
            .datum([chartData])
            .attr("fill", "steelblue")
            .attr("d", area);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        g.append("g")
            .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price ($)");
    }

    initialize();
});
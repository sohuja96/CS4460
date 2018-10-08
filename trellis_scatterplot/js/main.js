// location,beds,bath,price,year_built,sqft,price_per_sqft
// **** Example of how to create padding and spacing for trellis plot****
var svg = d3.select('svg');

// Hand code the svg dimensions, you can also use +svg.attr('width') or +svg.attr('height')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

// Define a padding object
// This will space out the trellis subplots
var padding = {t: 50, r: 20, b: 60, l: 90};

// Compute the dimensions of the trellis plots, assuming a 2x2 layout matrix.
trellisWidth = svgWidth / 2 - padding.l - padding.r;
trellisHeight = svgHeight / 2 - padding.t - padding.b;

// As an example for how to layout elements with our variables
// Lets create .background rects for the trellis plots
svg.selectAll('.background')
    .data(['New York', 'Boston', 'San Francisco', 'Philadelphia']) // dummy data
    .enter()
    .append('rect') // Append 4 rectangles
    .attr('class', 'background')
    .attr('width', trellisWidth) // Use our trellis dimensions
    .attr('height', trellisHeight)
    .attr('transform', function(d, i) {
        // Position based on the matrix array indices.
        // i = 1 for column 1, row 0)
        var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
        var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
        return 'translate('+[tx, ty]+')';
    });

var parseDate = d3.timeParse('%b %Y');
// To speed things up, we have already computed the domains for your scales

// **** How to properly load data ****
d3.csv('../data/real_estate.csv', function(error, dataset) {
    if(error) {
        console.error('Error while loading ./real_estate.csv dataset.');
        console.error(error);
        return; // Early return out of the callback function
    }
    var maxPPSqFt = d3.max(dataset, function(d) { return +d.price_per_sqft; } );
    var yearMin = d3.min(dataset,function(d) {return +d.year_built;});
    var yearMax = d3.max(dataset,function(d) {return +d.year_built;});
    var dateDomain = [new Date(yearMax,0), new Date(yearMin,0)];
    var priceDomain = [maxPPSqFt,0];

  // **** Your JavaScript code goes here ****
  var nested = d3.nest().key(function(c) {
    return c.location;
  }).entries(dataset);
  var trellisG = svg.selectAll('.trellis')
    .data(nested)
    .enter()
    .append('g')
    .attr('class','trellis')
    .attr('transform',function(d,i) {
      var tx = (i % 2) * (trellisWidth + padding.l + padding.r) + padding.l;
      var ty = Math.floor(i / 2) * (trellisHeight + padding.t + padding.b) + padding.t;
      return 'translate('+[tx, ty]+')';
    });
  var xScale = d3.scaleTime()
    .domain(dateDomain)
      .range([trellisWidth,0]);
  var yScale = d3.scaleLinear().domain(priceDomain).range([0,trellisHeight]);
  var xAxis = d3.axisBottom(xScale).ticks(9);
  trellisG.append('g')
    .attr('class','x axis')
    .attr('transform','translate(0,'+trellisHeight+')')
    .call(xAxis);
  var yAxis = d3.axisLeft(yScale);
  trellisG.append('g').attr('class','y axis').attr('transform','translate(0,0)').call(yAxis);
  var companyNames = nested.map(function(d) {
    return d.key;
  });
  var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(companyNames);
  trellisG.selectAll('.circle').data(function(d){ return d.values; }).enter().append('circle').attr('class', 'dot')
    .style('fill', function(d) { if (d.beds > 2) {
      return 'rgba(0,0,160,.3)';
    } else {
      return 'rgba(0,160,0,.3)'; }})
    .style('stroke', function(d) { if (d.beds > 2) {
      return 'rgba(0,0,160,1)';
    } else {
      return 'rgba(0,160,0,1)';
    }})
    .attr('cx',function(d) { return xScale(new Date(d.year_built,0));})
    .attr('cy',function(d) { return yScale(d.price_per_sqft);})
    .attr('r', 2.5);
  svg.append("text")
    .attr("class","label")
    .attr("x",-300)
    .attr("y",20)
    .attr('transform','rotate(270)')
    .style("text-anchor","end")
    .text("Price Per Square Foot (USD)");
  svg.append("text")
    .attr("class","label")
    .attr("x",410)
    .attr("y",680)
    .style("text-anchor","end")
    .text("Year Built");
  trellisG.selectAll('text').data(function(d) { return d.values; }).enter().append("text")
    .attr("class","label")
    .attr("x",90)
    .attr("y",30)
    .text(function(d) { 
      return d.location;
    });
});

// Remember code outside of the data callback function will run before the data loads

// Color mapping based on year
var yearColors = {2000: '#8c8c8c', 2010: '#d86763'};
var valueColors = ['#fcc9b5','#fa8873','#d44951','#843540'];

var dots;
var xMin;
var xMax;
var yMin;
var yMax;
var avgXMin;
var avgXMax;
var data;
var svg = d3.select('svg');
var nested;

// Dataset from http://nbremer.github.io/urbanization/
d3.csv('./data/asia_urbanization.csv',
function(row){
    // This callback formats each row of the data
    return {
        city: row.city,
        country: row.country,
        type_country: row.type_country,
        land_2000: +row.land_2000,
        land_2010: +row.land_2010,
        land_growth: +row.land_growth,
        pop_2000: +row.pop_2000,
        pop_2010: +row.pop_2010,
        pop_growth: +row.pop_growth,
        density_2000: +row.density_2000,
        density_2010: +row.density_2010,
        density_growth: +row.density_growth
    }
},
function(error, dataset){
    if(error) {
        console.error('Error while loading ./data/asia_urbanization.csv dataset.');
        console.error(error);
        return;
    }

    // **** Your JavaScript code goes here ****
    data = dataset;
    nested = d3.nest().key(function(d) {
      return d.country;
    }).entries(dataset);
    var countries = nested.map(function(d) {
      return d.key;
    });

    var topPad = 10;
    var startGraphs = 250;

    yMax = d3.max(dataset, function(d) {
      var sum = 0;
      for (i in d.city) {
        sum += 1;
      }
      return sum;
    });

    yMin = d3.min(dataset, function(d) {
      var sum = 0;
      for (i in d.city) {
        sum += 1;
      }
      return sum;
    });
////
    //Avg pop density
    //  Hist
    xMin = d3.min(dataset, function(d) {
      return d.density_growth;
    });
    xMax = d3.max(dataset, function(d) {
      return d.density_growth;
    });
    //genHistogram(startGraphs, topPad);
    var xCo = startGraphs;
    var yCo = topPad;
    console.log(xMin);
    console.log(xMax);
    var scaleX = d3.scaleLinear()
      .domain([xMin,xMax])
      .range([0,300]);

    var scaleY = d3.scaleLinear()
      .domain([0,140])
      .range([650,0]);

    var histDens = d3.histogram()
      .domain(scaleX.domain())
      .thresholds(scaleX.ticks(80))
      .value(function(d) {
        return d.density_growth;
      })
      (data); 

    var binContainerDens = svg.selectAll('.gBin')
      .data(histDens)
      .enter()
      .append('g')
      .attr('class','gBin')
      .attr('transform', function(d) {
        return 'translate('+[xCo+(scaleX(d.x0) + (scaleX(d.x1) - scaleX(d.x0))/2), 10]+')';
      });

    data.sort(function (a, b) {
        return d3.descending(a.value.meanDensity2010, b.value.meanDensity2010);
    });
    var containerEnterDens = binContainerDens
      .selectAll('circ')
      .data(function(d) {
        d.sort(function(first, second) {
          return (second.density_2010 - first.density_2010);
        });
        return d.map(function(data,i) {
          return {
            "iy" : i,
            "city": data.city,
            "country": data.country,
            "density_2000": data.density_2000,
            "density_2010": data.density_2010,
            "density_growth": data.density_growth
          };
        });
      })
      .enter()
      .append('circle')
      .attr('cx', 1)
      .attr('cy', function(d) {
        return scaleY(d.iy);
      })
      .attr('r', 1)
      .attr("class", "circ");


    var axisX = d3.axisBottom(scaleX);
    var axisY = d3.axisLeft(scaleY);

    svg.append('g')
      .attr('class','axis')
      .call(axisX)
      .attr('transform','translate('+xCo+','+(653+yCo)+')');
    svg.append('g')
      .attr('class','axis')
      .call(axisY)
      .attr('transform','translate('+(xCo-3)+','+yCo+')');

    var nested = d3.nest()
      .key(function(d) {
        return d.country;
      })
      .rollup(function(d) {
        return d3.mean(d, function(de) {
          return de.density_2010;
        });
      })
      .entries(dataset);

    var arr = [];
    for (var i=0; i < nested.length; i++) {
      arr = arr.concat([i]);
    }
    console.log(arr);


    var scaleBar = d3.scaleBand()
      .domain(nested.map(function(d,i) {
        return d.key;
      }))
      .range([0,280]);
    var wMin = d3.min(nested, function(d) {
      return d.value;
    });
    var wMax = d3.max(nested, function(d) {
      return d.value;
    });
    var scaleWid = d3.scaleLinear()
      .domain([wMin, wMax])
      .range([4,140]);
    var axisBar = d3.axisLeft(scaleBar);

    svg.selectAll('rect')
      .data(nested)
      .enter()
      .append('rect')
      .style('fill','blue')
      .attr('y',function(d) {
        return scaleBar(d.key);
      })
      .attr('x',1)
      .attr('height',(280/nested.length)/2)
      .attr('width',function(d) {
        return scaleWid(d.value); 
      })
      .attr('transform','translate('+(130+startGraphs)+','+topPad+')');

    svg.append('g')
      .attr('class','axis')
      .call(axisBar)
      .attr('transform','translate('+(130+startGraphs)+','+topPad+')');


});

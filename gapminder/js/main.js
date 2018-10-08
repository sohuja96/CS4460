// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateChart(event.value.newValue);
});

// Color mapping based on continents
var contintentColors = {Asia: '#fc5a74', Europe: '#fee633',
    Africa: '#24d5e8', Americas: '#82e92d', Oceania: '#fc5a74'};
var tooltip = d3.select('#tooltip');
var svg = d3.select('svg');
var chartG = svg.append('g').attr('transform','translate(10,10)');
var datums;
var gdpPerCapMax;
var gdpPerCapMin;
var yearMax;
var yearMin;
var lifeExpMax;
var lifeExpMin;
var popMax;
var popMin;
var scaleY;
var scaleX;
var scaleR;
//Implemented using a map for more efficient scrollbar use
var yearMap = new Object();

d3.csv('./data/gapminder.csv',
    function(d){
        // This callback formats each row of the data
        return {
            country: d.country,
            year: +d.year,
            population: +d.population,
            continent: d.continent,
            lifeExp: +d.lifeExp,
            gdpPercap: +d.gdpPercap
        }
    },
    function(error, dataset){
        if(error) {
            console.error('Error while loading ./gapminder.csv dataset.');
            console.error(error);
            return;
        }

        // **** Set up your global variables and initialize the chart here ****
        datums = dataset;

        //Max and Min of relevent dimension data
        gdpPerCapMax = d3.max(dataset, function(d) {
          return d.gdpPercap;
        });
        gdpPerCapMin = d3.min(dataset, function(d) {
          return d.gdpPercap;
        });
        yearMax = d3.max(dataset, function(d) {
          return d.year;
        });
        yearMin = d3.min(dataset, function(d) {
          return d.year;
        });
        lifeExpMax = d3.max(dataset, function(d) {
          return d.lifeExp;
        });
        lifeExpMin = d3.min(dataset, function(d) {
          return d.lifeExp;
        });
        console.log(lifeExpMin);
        popMax = d3.max(dataset, function(d) {
          return d.population;
        });
        popMin = d3.min(dataset, function(d) {
          return d.population;
        });
        var contExtent = d3.extent(datums, function(d) {
          return d.continent;});

        //Scales
        scaleX = d3.scaleLog()
          .domain([gdpPerCapMin, gdpPerCapMax])
          .range([0, +svg.attr('width')]);
        scaleY = d3.scaleLinear()
          .domain([lifeExpMax,lifeExpMin])
          .range([0, 590]);
        scaleR = d3.scaleSqrt()
          .domain([popMin, popMax])
          .range([2, 40]);
        scaleRGB = d3.scaleQuantize()
          .domain(['Asia','Europe','Africa','Americas','Oceania'])
          .range(['#fc5a74','#fee633','#24d5e8','#82e92d','#fc5a74']);
        //Axis
        axisX = d3.axisBottom(scaleX).ticks(10);
        axisY = d3.axisLeft(scaleY).ticks(8);

        for (i = yearMin; i <= yearMax; i++) {
          yearMap[i]= datums.filter(function(d) {
            return d.year == i;
          }
          );
        }

        svg.append('g').attr('class','axis').call(axisX).attr('transform','translate(40,650)');
        svg.append('g').attr('class','axis').call(axisY).attr('transform','translate(40,60)');
        svg.append('text').attr('class','title')
          .attr('transform','translate(50,30)')
          .text('Gapminder');
        svg.append('text').attr('class','x label')
          .attr('transform','translate(500,690)')
          .text('GDP Per Capita');
        svg.append('text').attr('class','y label')
          .attr('transform','translate(15,370)rotate(270)')
          .text('Life Expectancy (Years)');

        gridVert = d3.axisBottom(scaleX)
          .tickSize(-650,0,0)
          .tickSizeOuter(0)
          .tickFormat('').tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]);
        gridHori = d3.axisLeft(scaleY)
          .tickSize(-(+svg.attr('width')),0,0)
          .tickSizeOuter(0)
          .ticks(6).tickFormat('');
        svg.append('g')
          .attr('class','grid').call(gridVert)
          .style('stroke-dasharray','1 5')
          .attr('transform','translate(40,650)');
        svg.append('g')
          .attr('class','grid').call(gridHori)
          .style('stroke-dasharray','1 5')
          .attr('transform','translate(40,60)');
        updateChart(1952);
    });


function updateChart(year) {
    filteredYear = yearMap[year];
    // **** Update the chart based on the year here ****
    var nodes = chartG.selectAll('circle')
      .data(filteredYear, function(d) {
        return d.year;
      });

    var nodesEnter = nodes.enter()
      .append('circle')
      .attr('class','circle');

    nodesEnter.merge(nodes)
      .attr('cx', function(d) {
        return 40+ scaleX(d.gdpPercap);})
      .attr('cy', function(d) {
        return 60+scaleY(d.lifeExp)-24;})
      .attr('r', function(d) {
        return scaleR(d.population);})
      .attr('fill', function(d) {
        return contintentColors[d.continent];})
      .on('mouseover', function(d) {
        tooltip.append('text')
          .attr('class', 'ttt')
          .text("Country: " + d.country)
          .attr('transform', 'translate('+(d3.event.pageX - 10)+','+(d3.event.pageY + 10)+')');
        tooltip.append('text')
          .attr('class', 'ttt')
          .text("GDP/Cap: " + d.gdpPercap)
          .attr('transform', 'translate('+(d3.event.pageX - 10)+','+(d3.event.pageY + 28)+')');
        tooltip.append('text')
          .attr('class', 'ttt')
          .text("Life Exp: " + d.lifeExp)
          .attr('transform', 'translate('+(d3.event.pageX - 10)+','+(d3.event.pageY + 46)+')');
        tooltip.style('visibility', 'visible');
        return 0;
      })
      .on('mouseout', function(d) {
        tooltip.style('visibility', 'hidden');
        d3.selectAll('.ttt').remove();
        return 0;
      });

    nodes.transition()
      .duration(200)
      .attr('cx', function(d) {
        return 40+ scaleX(d.gdpPercap);})
      .attr('cy', function(d) {
        return 60+scaleY(d.lifeExp)-24;})
      .attr('r', function(d) {
        return scaleR(d.population);})
      .attr('fill', function(d) {
        return contintentColors[d.continent];});

    nodes.exit().remove();
}

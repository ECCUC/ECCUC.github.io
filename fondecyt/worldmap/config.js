// main.js
const SVG1 = d3.select("#vis-1").append("svg"); //WORLD MAP

// World map
const WIDTH_VIS_1 = 900;
const HEIGHT_VIS_1 =650;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);


createWorldMap();


// Funcion to create worldMap
function createWorldMap(data) {
    // Define a projection and path for the map
    const projection =d3.geoWinkel3();
    const path = d3.geoPath().projection(projection);
  
  
    // Load the GeoJSON file
    d3.json("data/countries.json")
      .then(function(geoData) {
        // Fit the projection to the features' bounding box
        projection.fitSize([WIDTH_VIS_1, HEIGHT_VIS_1], geoData);
  
        // Create a lookup object for quick access to features
        const countryLookup = geoData.features.reduce((lookup, feature) => {
          lookup[feature.properties.name_english] = feature;
          return lookup;
      }, {});
          // Tooltips
        const info = d3.select("body")
        .append("div")
        .attr("class", "info")
        .style("display", "none");
  
        // Draw the map using the loaded GeoJSON data
        const countries = SVG1.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "white")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("stroke-width", 4) // Change border width on mouseover
            .attr("stroke", "black"); // Change border color on mouseover
  
          // Show tooltip
          info.style("display", "block")
            .html(`<strong>Country:</strong> ${d.properties.name_english}`) // Update with your desired content
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke-width", 1)
            .attr("stroke", "black"); // Reset border color on mouseout
  
          // Hide tooltip on mouseout
          info.style("display", "none");
        });
    });
}
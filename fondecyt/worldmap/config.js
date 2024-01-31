// main.js
const SVG1 = d3.select("#vis-1").append("svg"); //WORLD MAP

// World map
const WIDTH_VIS_1 = 900;
const HEIGHT_VIS_1 =650;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

// read csv summary info
d3.csv("data/example_data.csv").then(function(data) {
  createWorldMap(data);
});


// Define a projection and path for the map
const projection = d3.geoWinkel3();
const path = d3.geoPath().projection(projection);
const info = d3.select("body")
  .append("div")
  .attr("class", "info")
  .style("display", "none");

// Function to create worldMap
function createWorldMap(data) {
    // Load the GeoJSON file
    d3.json("data/countries.json").then(function (geoData) {
        // Fit the projection to the features' bounding box
        projection.fitSize([WIDTH_VIS_1, HEIGHT_VIS_1], geoData);

        // Create a lookup object for quick access to features
        const countryLookup = geoData.features.reduce((lookup, feature) => {
            lookup[feature.properties.name_english] = feature;
            return lookup;
        }, {});


        // Draw the map using the loaded GeoJSON data
        const countries = SVG1.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "white")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke-width", 4) // Change border width on mouseover
                    .attr("stroke", "black"); // Change border color on mouseover

                // Show tooltip
                info.style("display", "block")
                    .html(`<strong>Country:</strong> ${d.properties.name_english}`) // Update with your desired content
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");
            })
            .on("click", function (event, d) {
                console.log(d.properties.name_english);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke-width", 1)
                    .attr("stroke", "black"); // Reset border color on mouseout

                // Hide tooltip on mouseout
                info.style("display", "none");
            });

        // Now that the GeoJSON is loaded, add event listener to category dropdown
        const categoryDropdown = document.getElementById("elementSelect");
        categoryDropdown.addEventListener("change", function () {
            const selectedCategory = categoryDropdown.value;
            PrintWorldMap(data, geoData, selectedCategory, path); // Pass the 'path' variable to PrintWorldMap
        });
    });
}

function PrintWorldMap(data, geoData, selectedCategory) {
  // Remove any existing country shapes
  SVG1.selectAll(".country").remove();

  if (selectedCategory === "Null") {
    return;
  }

  // Filter data based on the selected category
  const values = data.map(d => parseFloat(d[selectedCategory])); // Assuming the values are numeric

  const minValue = d3.min(values);
  const maxValue = d3.max(values);

  // Create a linear color scale
  const colorScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range(["yellow", "orange"]); // Adjust the color range as needed

  // Append country shapes for the data received with color based on the selected category
  SVG1.selectAll(".country")
    .data(data, d => d.country)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", function (d) {
      // Find the corresponding feature in geoData
      const countryFeature = geoData.features.find(feature => feature.properties.name_english === d.country);
      if (countryFeature) {
        return path(countryFeature);
      }
      return null; // If country not found in geoData
    })
    .attr("fill", function (d) {
      // Use the selected category's value for color
      return colorScale(parseFloat(d[selectedCategory]));
    })
    .attr("stroke", "black")
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("stroke-width", 4) // Change border width on mouseover
        .attr("stroke", "Maroon"); // Change border color on mouseover

      // Show tooltip
      info.style("display", "block")
        .html(`<strong>Country:</strong> ${d.country}<br><strong>${selectedCategory}:</strong> ${d[selectedCategory]}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke-width", 1)
        .attr("stroke", "black"); // Reset border color on mouseout

      // Hide tooltip on mouseout
      info.style("display", "none");
    });
}

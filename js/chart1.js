// chart1.js
// Choropleth map visualization showing fast food density by county

(async function () {
  if (window.chart1Initialized) {
    console.log("Chart1 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz1");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");
  container.style("position", "relative");

  window.chart1Initialized = false;
  window.chart1AnimatedOnce = false;
  window.chart1Rendered = false;

  let processedDataByYear = null;
  let svg = null;
  let colorScale = null;
  let us = null;
  let years = [];
  let currentYear = 1990;
  let mapGroup, legendGroup, counties;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "chart1-tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("z-index", "1000");

  const width = 960,
    height = 650;
  const legendWidth = 260,
    legendHeight = 10,
    legendMargin = 20;

  try {
    svg = container.append("svg").attr("width", width).attr("height", height);
    const data = await loadCSVData("data/county_fast_food_data.csv");
    processedDataByYear = processCSVDataByYear(data);
    years = Object.keys(processedDataByYear)
      .map(Number)
      .sort((a, b) => a - b);

    if (!years.includes(1990)) {
      currentYear = years[0];
      console.log(
        `Year 1990 not found in dataset, using ${currentYear} instead`
      );
    }

    colorScale = createColorScale(processedDataByYear[currentYear]);
    us = await loadGeoJSONData("https://d3js.org/us-10m.v1.json");

    window.chart1Initialized = true;
    console.log(
      "Chart1 data prepared and ready for rendering when section is visible"
    );
  } catch (error) {
    console.error("Error loading or processing data:", error);
    createFallbackChart();
  }

  function loadCSVData(url) {
    return d3.csv(url);
  }

  function processCSVDataByYear(data) {
    const dataByYear = {};

    data.forEach((d) => {
      const year = +d.year;
      const fips = d.county.padStart(5, "0");
      const density = +d.den_fastfood || 0;

      if (!dataByYear[year]) {
        dataByYear[year] = {};
      }

      dataByYear[year][fips] = density;
    });

    return dataByYear;
  }

  function createColorScale(stateData) {
    const values = Object.values(stateData).filter((v) => v > 0);
    const maxCount = d3.max(values);

    const colorScale = d3
      .scalePow()
      .exponent(0.5)
      .domain([0, maxCount])
      .range(["#fee5d9", "#de2d26"]);

    function getColor(value) {
      if (value === 0) return "#f2f2f2";

      const normalizedValue = value / maxCount;

      if (normalizedValue < 0.1) return "#fee5d9";
      if (normalizedValue < 0.25) return "#fcbba1";
      if (normalizedValue < 0.5) return "#fc9272";
      if (normalizedValue < 0.75) return "#fb6a4a";
      if (normalizedValue < 0.9) return "#ef3b2c";
      return "#cb181d";
    }

    return getColor;
  }

  function loadGeoJSONData(url) {
    return d3.json(url);
  }

  function createMap() {
    if (!svg || !us || !processedDataByYear) {
      console.error("Missing required data or elements for map rendering");
      return;
    }

    const stateData = processedDataByYear[currentYear];
    colorScale = createColorScale(stateData);

    const mapTopMargin = legendHeight + 2 * legendMargin;

    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2 - 70)
      .attr("y", 150)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Fast food restaurants per 1,000 people`);

    legendGroup = svg
      .append("g")
      .attr("class", "color-legend")
      .attr("transform", `translate(${legendMargin}, ${legendMargin + 175})`);

    mapGroup = svg
      .append("g")
      .attr("class", "map-group")
      .attr(
        "transform",
        `translate(${width / 4 - 200}, ${mapTopMargin + 200}) scale(0.8)`
      );

    const geoFeatures = topojson.feature(us, us.objects.counties).features;
    counties = mapGroup
      .selectAll("path.county")
      .data(geoFeatures)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d) => {
        const countyFips = d.id.toString().padStart(5, "0");
        const ratio = stateData[countyFips] || 0;
        return colorScale(ratio);
      })
      .attr("stroke", "#b55b52")
      .attr("stroke-width", 0.3)
      .attr("stroke-opacity", 0.6)
      .attr("class", "county");

    mapGroup
      .append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "#8c2d26")
      .attr("stroke-width", 1.2)
      .attr("stroke-linejoin", "round")
      .attr("class", "state-boundary");

    counties
      .on("mouseover", function (event, d) {
        d3.select(this)
          .style("stroke", "#8c2d26")
          .style("stroke-width", 1.5)
          .style("stroke-opacity", 1);

        const countyFips = d.id.toString().padStart(5, "0");
        const ratio = stateData[countyFips] || 0;

        tooltip
          .style("visibility", "visible")
          .html(
            `<div><strong>Fast Food Restaurants Density (${currentYear})</strong></div>` +
              `<div>${ratio.toFixed(2)} restaurants per 1,000 people</div>`
          );
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .style("stroke", "#b55b52")
          .style("stroke-width", 0.3)
          .style("stroke-opacity", 0.6);
        tooltip.style("visibility", "hidden");
      });

    updateLegend(stateData);
  }

  function updateMap(year) {
    if (!counties || !processedDataByYear) return;

    currentYear = year;
    const stateData = processedDataByYear[year];
    colorScale = createColorScale(stateData);

    counties
      .transition()
      .duration(300)
      .attr("fill", (d) => {
        const countyFips = d.id.toString().padStart(5, "0");
        const ratio = stateData[countyFips] || 0;
        return colorScale(ratio);
      })
      .attr("stroke", "#b55b52")
      .attr("stroke-width", 0.3)
      .attr("stroke-opacity", 0.6);

    counties.on("mouseover", function (event, d) {
      d3.select(this)
        .style("stroke", "#8c2d26")
        .style("stroke-width", 1.5)
        .style("stroke-opacity", 1);

      const countyFips = d.id.toString().padStart(5, "0");
      const ratio = stateData[countyFips] || 0;

      tooltip
        .style("visibility", "visible")
        .html(
          `<div><strong>Fast Food Restaurants Density (${year})</strong></div>` +
            `<div>${ratio.toFixed(2)} restaurants per 1,000 people</div>`
        );
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    });

    counties.on("mouseout", function (event, d) {
      d3.select(this)
        .style("stroke", "#b55b52")
        .style("stroke-width", 0.3)
        .style("stroke-opacity", 0.6);
      tooltip.style("visibility", "hidden");
    });

    updateLegend(stateData);
  }

  function updateLegend(stateData) {
    if (!legendGroup || !colorScale) return;

    legendGroup.html("");

    const maxCount = d3.max(Object.values(stateData));

    legendGroup
      .insert("rect", ":first-child")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", legendWidth + 20)
      .attr("height", legendHeight + 20)
      .attr("fill", "white")
      .attr("opacity", 0.8);

    svg.select("defs").remove();
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%")
      .attr("y1", "0%")
      .attr("y2", "0%");

    const numStops = 10;
    for (let i = 0; i < numStops; i++) {
      gradient
        .append("stop")
        .attr("offset", `${(i / (numStops - 1)) * 100}%`)
        .attr("stop-color", colorScale((i / (numStops - 1)) * maxCount));
    }

    legendGroup
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    const xScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([0, legendWidth]);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickSizeOuter(0);

    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(xAxis);

    legendGroup
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 30)
      .attr("text-anchor", "middle");
  }

  function createYearControls() {
    const controlsContainer = container
      .append("div")
      .attr("class", "year-controls")
      .style("position", "absolute")
      .style("top", `180px`)
      .style("right", `80px`)
      .style("background", "rgba(254, 229, 217, 0.95)")
      .style("border", "1px solid #fcbba1")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("box-shadow", "0 2px 6px rgba(222, 45, 38, 0.15)");

    controlsContainer
      .append("label")
      .text("Year: ")
      .style("font-weight", "bold")
      .style("margin-right", "5px")
      .style("color", "#a63603");

    const yearDisplay = controlsContainer
      .append("span")
      .attr("id", "current-year-display")
      .text(currentYear)
      .style("margin-right", "10px")
      .style("color", "#a63603")
      .style("font-weight", "bold");

    const slider = controlsContainer
      .append("input")
      .attr("type", "range")
      .attr("min", d3.min(years))
      .attr("max", d3.max(years))
      .attr("step", 1)
      .attr("value", currentYear)
      .style("width", "150px")
      .style("margin", "8px 0")
      .style("accent-color", "#de2d26")
      .on("input", function () {
        const year = +this.value;
        yearDisplay.text(year);
        updateMap(year);
      });

    let playing = false;
    let animationTimeout = null;
    let yearIndex = 0;
    let animationComplete = false;

    const buttonContainer = controlsContainer
      .append("div")
      .style("margin-top", "8px")
      .style("display", "flex")
      .style("gap", "8px");

    const playButton = buttonContainer
      .append("button")
      .attr("id", "play-years-btn")
      .text("Play")
      .style("flex", "1")
      .style("padding", "6px")
      .style("cursor", "pointer")
      .style("background", "#de2d26")
      .style("color", "white")
      .style("border", "none")
      .style("border-radius", "4px")
      .style("font-weight", "bold");

    const pauseButton = buttonContainer
      .append("button")
      .attr("id", "pause-years-btn")
      .text("Pause")
      .style("flex", "1")
      .style("padding", "6px")
      .style("cursor", "pointer")
      .style("display", "none")
      .style("background", "#a63603")
      .style("color", "white")
      .style("border", "none")
      .style("border-radius", "4px")
      .style("font-weight", "bold");

    function startAnimation() {
      if (animationComplete) {
        yearIndex = 0;
        animationComplete = false;
      }

      playing = true;
      playButton.style("display", "none");
      pauseButton.style("display", "block");

      currentYear = years[yearIndex];
      slider.node().value = currentYear;
      yearDisplay.text(currentYear);
      updateMap(currentYear);

      function animate() {
        if (yearIndex < years.length - 1 && playing) {
          yearIndex++;
          currentYear = years[yearIndex];
          slider.node().value = currentYear;
          yearDisplay.text(currentYear);
          updateMap(currentYear);
          animationTimeout = setTimeout(animate, 500);
        } else {
          playing = false;
          animationComplete = true;
          playButton.style("display", "block");
          pauseButton.style("display", "none");
          playButton.text("Replay");
        }
      }

      animationTimeout = setTimeout(animate, 500);
    }

    function pauseAnimation() {
      playing = false;
      if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
      }
      playButton.style("display", "block");
      pauseButton.style("display", "none");
      playButton.text("Resume");
    }

    playButton.on("click", function () {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
      }
      startAnimation();
    });

    pauseButton.on("click", pauseAnimation);

    slider.on("input.stop", function () {
      yearIndex = years.indexOf(+this.value);
      pauseAnimation();
      animationComplete = false;
    });
  }

  function createFallbackChart() {
    if (!svg) return;

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(
        "Unable to load map data. Please check your connection and try again."
      );
  }

  function renderAndAnimateChart() {
    if (window.chart1Rendered) return;

    createMap();
    createYearControls();

    window.chart1Rendered = true;

    container.style("visibility", "visible").style("opacity", "1");

    window.chart1AnimatedOnce = true;
  }

  window.updateChart1 = function (progress, stepIndex) {
    if (!window.chart1AnimatedOnce && progress > 0.1) {
      renderAndAnimateChart();
    }
  };
})();

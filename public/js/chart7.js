// chart7.js
// Choropleth map of famous fast food chains by state

(async function () {
  if (window.chart7Initialized) {
    console.log("Chart7 is already initialized, skipping initialization");
    return;
  }

  const width = 1200;
  const height = 800;

  window.viz7Initialized = false;
  window.viz7AnimatedOnce = false;
  window.viz7Rendered = false;

  const container = d3.select("#viz7");
  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");

  let svg, logos;

  async function initializeViz() {
    svg = container
      .append("svg")
      .attr("viewBox", `-100 -150 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent");

    svg
      .append("text")
      .attr("x", width / 2 - 100)
      .attr("y", -100)
      .attr("text-anchor", "middle")
      .attr("font-size", "28px")
      .attr("font-weight", "bold")
      .text("Popular Fast Food Chains over the States");

    const [us, fastFoodData, chainData] = await Promise.all([
      d3.json(
        "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/us_states_hexgrid.geojson.json"
      ),
      d3.csv("data/most_popular_fast_food_by_state_2025.csv"),
      d3.csv("data/top_50_foodchain_revenue_and_location_2024.csv"),
    ]);

    const nameToHexLabel = {
      Alabama: "Ala.",
      Alaska: "A.K.",
      Arizona: "Ariz.",
      Arkansas: "Ark.",
      California: "Calif.",
      Colorado: "Colo.",
      Connecticut: "Conn.",
      Delaware: "Del.",
      "District of Columbia": "D.C.",
      Florida: "Fla.",
      Georgia: "Ga.",
      Hawaii: "H.I.",
      Idaho: "Idaho",
      Illinois: "Ill.",
      Indiana: "Ind.",
      Iowa: "Iowa",
      Kansas: "Kan.",
      Kentucky: "Ky.",
      Louisiana: "La.",
      Maine: "Maine",
      Maryland: "Md.",
      Massachusetts: "Mass.",
      Michigan: "Mich.",
      Minnesota: "Minn.",
      Mississippi: "Miss.",
      Missouri: "Mo.",
      Montana: "Mont.",
      Nebraska: "Neb.",
      Nevada: "Nev.",
      "New Hampshire": "N.H.",
      "New Jersey": "N.J.",
      "New Mexico": "N.M.",
      "New York": "N.Y.",
      "North Carolina": "N.C.",
      "North Dakota": "N.D.",
      Ohio: "Ohio",
      Oklahoma: "Okla.",
      Oregon: "Ore.",
      Pennsylvania: "Pa.",
      "Rhode Island": "R.I.",
      "South Carolina": "S.C.",
      "South Dakota": "S.D.",
      Tennessee: "Tenn.",
      Texas: "Texas",
      Utah: "Utah",
      Vermont: "Vt.",
      Virginia: "Va.",
      Washington: "Wash.",
      "West Virginia": "W.Va.",
      Wisconsin: "Wis.",
      Wyoming: "Wyo.",
    };
    const hexLabelToName = Object.fromEntries(
      Object.entries(nameToHexLabel).map(([name, label]) => [label, name])
    );

    const projection = d3.geoMercator().scale(850).translate([2025, 950]);

    const path = d3.geoPath().projection(projection);

    const fastFoodMap = new Map(
      fastFoodData.map((d) => [d["STATE"], d["TOP RATED CHAIN"]])
    );

    const chainStats = new Map(
      chainData.map((d) => {
        const locations = +d["Number of Locations"];
        const revenue = +d["Revenue (Millions)"].replace(/[$,]/g, "");
        return [
          d["Company"],
          { locations, revenue, dominance: locations * revenue },
        ];
      })
    );

    const dominanceScores = new Map(
      Array.from(fastFoodMap.entries()).map(([state, chain]) => {
        const stats = chainStats.get(chain);
        return [state, stats ? stats.dominance : 0];
      })
    );

    const color = d3
      .scaleQuantize()
      .domain(d3.extent(Array.from(dominanceScores.values())))
      .range(d3.schemeBlues[7]);

    const radiusByLocations = d3
      .scaleSqrt()
      .domain(d3.extent(chainData, (d) => +d.locations))
      .range([3, 15]);

    const radiusByRevenue = d3
      .scaleSqrt()
      .domain(d3.extent(chainData, (d) => +d.revenue))
      .range([3, 15]);

    let currentScale = radiusByLocations;

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "14px");

    const states = us.features;

    svg
      .append("g")
      .selectAll("path")
      .data(states)
      .join("path")
      .attr("d", path)
      .attr("fill", "#ffdddd")
      .attr("stroke", "#999")
      .attr("stroke-width", 1)
      .attr("shape-rendering", "crispEdges");

    svg
      .append("g")
      .attr("class", "hex-labels")
      .selectAll("text")
      .data(
        states.filter((d) => {
          const c = path.centroid(d);
          return isFinite(c[0]) && isFinite(c[1]);
        })
      )
      .join("text")
      .attr("x", (d) => path.centroid(d)[0])
      .attr("y", (d) => path.centroid(d)[1])
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#333")
      .text((d) => d.properties.label);

    const bubbleGroup = svg.append("g");

    const top3PerState = fastFoodData.map((d) => {
      const state = d["STATE"];
      const searchChains = [
        d["MOST SEARCHED FOR #1"],
        d["MOST SEARCHED FOR #2"],
        d["MOST SEARCHED FOR #3"],
      ];
      const top3 = searchChains.map((chainName) => {
        const stats = chainStats.get(chainName);
        return {
          chain: chainName,
          locations: stats ? stats.locations : 0,
          revenue: stats ? stats.revenue : 0,
          dominance: stats ? stats.dominance : 0,
        };
      });
      return { state, top3 };
    });

    us.features.forEach((feat) => {
      const label = feat.properties.label;
      const fullName = hexLabelToName[label];
      const entry = fullName && top3PerState.find((e) => e.state === fullName);
      feat.properties.top3 = entry ? entry.top3 : [];
      feat.properties.dominanceScore = d3.sum(
        feat.properties.top3,
        (d) => d.dominance
      );
    });

    const bubbleData = us.features.flatMap((feat) => {
      const fullName =
        hexLabelToName[feat.properties.label] || feat.properties.label;
      return feat.properties.top3.map((d, i) => ({
        feature: feat,
        state: fullName,
        chain: d.chain,
        locations: d.locations,
        revenue: d.revenue,
        rank: i + 1,
      }));
    });

    const bubbleOffsets = [
      { x: 0, y: -15 },
      { x: -12, y: 10 },
      { x: 12, y: 10 },
    ];

    function iconSize(rank) {
      return rank === 1 ? 24 : rank === 2 ? 16 : 12;
    }

    const logoMap = {
      "Chick-Fil-A": "data/logos/chickfila.svg",
      "McDonald's": "data/logos/mcdonalds.svg",
      Dominos: "data/logos/dominos.svg",
      "Pizza Hut": "data/logos/pizzahut.svg",
      Starbucks: "data/logos/starbucks.svg",
      "Taco Bell": "data/logos/tacoBell.svg",
      Chipotle: "data/logos/chipotle.svg",
      "Little Caesars": "data/logos/littlecaesars.svg",
      "Papa John's": "data/logos/papajohns.svg",
    };

    function drawBubbles() {
      const logos = bubbleGroup
        .selectAll("image.logo")
        .data(bubbleData)
        .join("image")
        .attr("class", "logo")
        .attr("href", (d) => logoMap[d.chain] || "")
        .attr("onerror", "this.remove()")
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("opacity", 0)
        .attr("width", (d) => iconSize(d.rank) * 1.5)
        .attr("height", (d) => iconSize(d.rank) * 1.5)
        .attr("data-width", (d) => iconSize(d.rank) * 1.5)
        .attr("data-height", (d) => iconSize(d.rank) * 1.5)
        .attr("x", (d) => {
          const c = path.centroid(d.feature);
          const off = bubbleOffsets[d.rank - 1] || { x: 0, y: 0 };
          return c[0] + off.x - (iconSize(d.rank) * 1.5) / 2;
        })
        .attr("y", (d) => {
          const c = path.centroid(d.feature);
          const off = bubbleOffsets[d.rank - 1] || { x: 0, y: 0 };
          return c[1] + off.y - (iconSize(d.rank) * 1.5) / 2;
        })
        .on("mouseover", function (event, d) {
          const chain = d.chain;
          const rank = d.rank;
          const stateName = d.state;
          tooltip
            .style("visibility", "visible")
            .html(
              `<div><strong>Chain name: ${chain}</strong></div>` +
                `<div>Search Rank in ${stateName}: ${rank}</div>`
            );
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 50 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          event.stopPropagation();
          const [[x0, y0], [x1, y1]] = path.bounds(d.feature);
          const s = 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height);
          const t = [(width - (x0 + x1) * s) / 2, (height - (y0 + y1) * s) / 2];
          svg
            .transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(t[0], t[1]).scale(s)
            );
        });

      return logos;
    }

    logos = drawBubbles();

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .filter(() => false)
      .on("zoom", (event) => {
        svg.selectAll("g").attr("transform", event.transform);
      });
    svg.call(zoom);

    svg
      .select("g")
      .selectAll("path")
      .on("click", function (event, d) {
        event.stopPropagation();
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const s = 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height);
        const t = [(width - (x0 + x1) * s) / 2, (height - (y0 + y1) * s) / 2];
        svg
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(t[0], t[1]).scale(s));
      });

    svg.on("click", function (event) {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

    d3.select(window).on("keydown", function (event) {
      if (event.key === "Escape") {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      }
    });

    window.viz7Initialized = true;
    console.log(
      "Viz7 data prepared and ready for rendering when section is visible"
    );
  }

  function animateLogos() {
    if (!logos || window.viz7AnimatedOnce) return;

    console.log("Animating viz7 logos");

    logos
      .transition()
      .duration(1000)
      .delay((d, i) => 100 + i * 25)
      .attr("opacity", 1)
      .on("end", function pulseLogo() {
        d3.select(this)
          .transition()
          .duration(1000)
          .attr("width", function () {
            const originalWidth = +this.getAttribute("data-width");
            return originalWidth * 1.1;
          })
          .attr("height", function () {
            const originalHeight = +this.getAttribute("data-height");
            return originalHeight * 1.1;
          })
          .transition()
          .duration(1000)
          .attr("width", function () {
            return +this.getAttribute("data-width");
          })
          .attr("height", function () {
            return +this.getAttribute("data-height");
          })
          .on("end", pulseLogo);
      });

    window.viz7AnimatedOnce = true;
  }

  function showVisualization() {
    if (window.viz7Rendered) return;

    console.log("Showing viz7 visualization");

    container.style("visibility", "visible");

    setTimeout(() => {
      container.style("opacity", "1");

      animateLogos();

      window.viz7Rendered = true;
    }, 50);
  }

  window.updateViz7 = function (progress) {
    if (!window.viz7Initialized) return;

    if (progress > 0 && !window.viz7Rendered) {
      showVisualization();
    }
  };

  await initializeViz();
})();

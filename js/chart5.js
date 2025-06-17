// chart5.js
// Zoomable sunburst for delivery app usage over the years and rating distribution

(async function () {
  if (window.chart5Initialized) {
    console.log("Chart5 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#chart5");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");

  window.chart5Initialized = false;
  window.chart5AnimatedOnce = false;
  window.chart5Rendered = false;

  let processedData = null;
  let chartSvg = null;

  try {
    const [yearData, appData] = await Promise.all([
      d3.csv("data/number_of_users_over_the_years.csv"),
      d3.csv("data/food_delivery_apps_clean.csv"),
    ]);

    const yearMap = new Map();
    yearData.forEach((d) => {
      const y = d["Year"].trim();
      yearMap.set(y, +d["Number of Users (in millions)"]);
    });

    appData.forEach((d) => {
      const raw = d.date && d.date.slice(0, 4);
      d.year = raw && !isNaN(raw) ? raw : "Unknown";
    });

    const grouped = d3.rollups(
      appData,
      (yearArr) =>
        d3.rollups(
          yearArr,
          (appArr) =>
            d3.rollups(
              appArr,
              (ratingArr) => ratingArr.length,
              (r) => r.score
            ),
          (r) => r.app
        ),
      (r) => r.year
    );

    function buildHierarchy(data) {
      const userCounts = d3.rollup(
        appData,
        (v) => new Set(v.map((d) => d.userName)).size,
        (d) => d.year,
        (d) => d.app
      );

      const sortedData = data.sort((a, b) => a[0] - b[0]);

      return sortedData.map(([year, apps]) => {
        const declaredYearUsers = yearMap.get(year) ?? 0;

        let observedYearUsers = 0;
        apps.forEach(([appName]) => {
          observedYearUsers += userCounts.get(year)?.get(appName) ?? 0;
        });

        const scale =
          observedYearUsers > 0 ? declaredYearUsers / observedYearUsers : 0;

        const children = apps.map(([appName, ratings]) => {
          const rawAppUsers = userCounts.get(year)?.get(appName) ?? 0;
          const scaledAppUsers = rawAppUsers * scale;

          const totalReviews = d3.sum(ratings, ([, cnt]) => cnt);
          const ratingKids = ratings.map(([score, cnt]) => ({
            name: score,
            value: totalReviews ? (cnt / totalReviews) * scaledAppUsers : 0,
          }));

          return {
            name: appName,
            children: ratingKids,
          };
        });

        return {
          name: year,
          children,
        };
      });
    }

    const hierarchyData = buildHierarchy(grouped);
    const rootData = { name: "root", children: hierarchyData };

    processedData = rootData;

    window.chart5Initialized = true;

    console.log(
      "Chart5 data prepared and ready for rendering when section is visible"
    );
  } catch (error) {
    console.error("Error loading or processing data:", error);
    createFallbackChart();
  }

  function createSunburst(data, chartSize = 500) {
    console.log("Rendering sunburst chart with size:", chartSize);

    const baseSize = chartSize * 1.25;
    const width = baseSize;
    const height = baseSize;

    const radius = width / 6;

    const fontSize = Math.max(10, Math.round(chartSize / 40));

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children.length + 1)
    );

    const partition = d3
      .partition()
      .size([2 * Math.PI, d3.hierarchy(data).sum((d) => d.value).height + 1]);

    const root = partition(d3.hierarchy(data).sum((d) => d.value));
    root.each((d) => (d.current = d));

    const arc = d3
      .arc()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3
      .create("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .attr("width", chartSize)
      .attr("height", chartSize)
      .style("font", `${fontSize}px sans-serif`);

    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", 0)
      .attr("y", -height / 2 + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .text("Delivery App Usage and Ratings Distribution");

    const chartGroup = svg.append("g").attr("transform", "scale(0.8)");

    const path = chartGroup
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1), (d) => `${d.data.name}__${d.depth}`)
      .join("path")
      .attr("fill", (d) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", 0)
      .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
      .attr("d", (d) => arc(d.current));

    path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "chart5-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    path
      .on("mouseover", function (event, d) {
        const pathString = d
          .ancestors()
          .map((d) => d.data.name)
          .reverse()
          .join(" > ");

        const value = d3.format(",.1f")(d.value);

        let content = `<div><strong>${d.data.name}</strong></div>`;

        if (d.depth === 1) {
          content += `<div>Year: ${d.data.name}</div>`;
          content += `<div>Users: ${value} million</div>`;
        } else if (d.depth === 2) {
          content += `<div>App: ${d.data.name}</div>`;
          content += `<div>Users: ${value} million</div>`;
        } else if (d.depth === 3) {
          content += `<div>Rating: ${d.data.name}</div>`;
          content += `<div>Users: ${value} million</div>`;
        }

        tooltip.style("visibility", "visible").html(content);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    const label = chartGroup
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", 0)
      .attr("transform", (d) => labelTransform(d.current))
      .text((d) => d.data.name);

    const parent = chartGroup
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    function clicked(event, p) {
      parent.datum(p.parent || root);

      if (p === root) {
        root.each((d) => {
          d.target = {
            x0: d.x0,
            x1: d.x1,
            y0: d.y0,
            y1: d.y1,
          };
        });
      } else {
        const nodesByDepth = {};

        p.descendants().forEach((d) => {
          const relativeDepth = d.depth - p.depth;
          if (!nodesByDepth[relativeDepth]) {
            nodesByDepth[relativeDepth] = [];
          }
          nodesByDepth[relativeDepth].push(d);
        });

        Object.entries(nodesByDepth).forEach(([depth, nodes]) => {
          let totalValue = d3.sum(nodes, (d) => d.value);

          nodes.sort((a, b) => a.x0 - b.x0);

          let currentAngle = 0;
          nodes.forEach((node) => {
            const angleSize = (node.value / totalValue) * 2 * Math.PI;

            if (node === p) {
              node.target = {
                x0: 0,
                x1: 2 * Math.PI,
                y0: 0,
                y1: 1,
              };
            } else {
              node.target = {
                x0: currentAngle,
                x1: currentAngle + angleSize,
                y0: +depth,
                y1: +depth + 1,
              };
            }

            currentAngle += angleSize;
          });
        });

        root.each((d) => {
          if (!p.descendants().includes(d) && d !== p) {
            d.target = {
              x0: 0,
              x1: 0,
              y0: 0,
              y1: 0,
            };
          }
        });
      }

      const t = svg.transition().duration(event.altKey ? 7500 : 750);

      path
        .transition(t)
        .tween("data", (d) => {
          const i = d3.interpolate(d.current, d.target);
          return (t) => (d.current = i(t));
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", (d) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))
        .attrTween("d", (d) => () => arc(d.current));

      label
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        })
        .transition(t)
        .attr("fill-opacity", (d) => +labelVisible(d.target))
        .attrTween("transform", (d) => () => labelTransform(d.current));
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    chartSvg = svg;
    return svg.node();
  }

  function renderAndAnimateChart() {
    if (!processedData) return;
    console.log("Rendering and animating chart5");

    container.style("visibility", "visible");

    setTimeout(() => {
      container.style("opacity", "1");

      const containerWidth = container.node().getBoundingClientRect().width;
      const chartSize = Math.min(600, containerWidth * 0.9);

      const svgNode = createSunburst(processedData, chartSize);

      container.html("");

      container.node().appendChild(svgNode);

      const path = d3.select(svgNode).selectAll("path");
      const label = d3
        .select(svgNode)
        .selectAll("text")
        .filter(function () {
          return !d3.select(this).classed("chart-title");
        });

      path
        .transition()
        .duration(1000)
        .delay((d, i) => i * 5)
        .attr("fill-opacity", (d) =>
          arcVisible(d) ? (d.children ? 0.6 : 0.4) : 0
        );

      label
        .transition()
        .duration(1000)
        .delay((d, i) => 500 + i * 10)
        .attr("fill-opacity", (d) => +labelVisible(d));

      window.chart5AnimatedOnce = true;
      window.chart5Rendered = true;
    }, 50);
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function createFallbackChart() {
    const width = 600;
    const height = 450;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);

    const title = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    title.textContent = "Delivery App Usage (Data Visualization)";
    title.setAttribute("x", width / 2);
    title.setAttribute("y", 50);
    title.setAttribute("text-anchor", "middle");
    title.setAttribute("font-size", "20px");
    title.setAttribute("font-weight", "bold");

    const message = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    message.textContent = "Chart data is loading or unavailable";
    message.setAttribute("x", width / 2);
    message.setAttribute("y", height / 2);
    message.setAttribute("text-anchor", "middle");
    message.setAttribute("font-size", "16px");

    svg.appendChild(title);
    svg.appendChild(message);

    container.node().appendChild(svg);

    container.style("visibility", "visible");
    container.style("opacity", "1");
  }

  window.updateChart5 = function (progress, index) {
    if (window.chart5Initialized && !window.chart5Rendered && progress > 0.2) {
      console.log("Chart5 entering viewport with progress:", progress);
      renderAndAnimateChart();
    }
  };
})();

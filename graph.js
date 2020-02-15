const width = 400;
const height = 400;
let scale = 1;

function color() {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.title);
}

function loadData() {
  d3.json("data.json")
    .then(data => createGraph(data))
    .catch(error => console.log(error));
}

function moveCenter(nodes) {

  let maxX = 0;
  let minX = Number.MAX_SAFE_INTEGER;
  let maxY = 0;
  let minY = Number.MAX_SAFE_INTEGER;
  for(let node of nodes) {
      if(node.x > maxX) maxX = node.x;
      if(node.x < minX) minX = node.x;
      if(node.y > maxY) maxY = node.y;
      if(node.y < minY) minY = node.y;
  }

  const bounds = d3.select("#svg-container").node().getBoundingClientRect();

  const graphW = minX - maxX;
  const graphH = minY - maxY;

  const transX = (bounds.width / 2) - (graphW / 2) - maxX;
  const transY = (bounds.height / 2) - (graphH / 2) - maxY; 

  scale = 2;

  d3.selectAll(".node, .link").transition().duration(2000).attr("transform", "translate(" + transX + ", " + transY + ")scale("+ scale + ")");
}

function createGraph(data) {
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-3000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(1))
      .force("y", d3.forceY(height / 2).strength(1))
      .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(1))

  const svg = d3.select("svg")
      // .attr("viewBox", [0, 0, width, height]);

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("class", "link")
      .attr("stroke-width", d => Math.sqrt(d.value));

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("class", "node")
      .attr("r", 5)
      .attr("fill", color())
      .call(drag(simulation));

  node.append("title")
      .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  d3.select("#btn").on("click", d => moveCenter(nodes));
}

function drag(simulation) {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

loadData();
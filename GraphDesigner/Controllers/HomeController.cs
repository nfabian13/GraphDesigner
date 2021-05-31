using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using GraphDesigner.GraphModels;
using GraphDesigner.Models;
using GraphDesignerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GraphDesigner.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public GraphModels.Graph GetGraphObject()
        {
            var graph = new Graph();
            graph.Name = "Grafo 1";

            var node1 = new Node();
            node1.Id = 1;
            node1.Name = "node 1";

            var node2 = new Node();
            node2.Id = 2;
            node2.Name = "node 2";

            var node3 = new Node();
            node3.Id = 3;
            node3.Name = "node 3";

            var edge = new Edge();
            var edge2 = new Edge();
            var edge3 = new Edge();
            var edge4 = new Edge();
            var edge5 = new Edge();

            //edge.StartNode = node1.Id;
            edge.EndNodeId = node2.Id;
            edge2.EndNodeId = node1.Id;
            node1.Edges.Add(edge);
            node2.Edges.Add(edge2);
            
            edge3.EndNodeId = node3.Id;
            edge4.EndNodeId = node2.Id;
            edge5.EndNodeId = node1.Id;

            node2.Edges.Add(edge3);
            node3.Edges.Add(edge4);

            graph.Nodes.Add(node1);
            graph.Nodes.Add(node2);
            graph.Nodes.Add(node3);

            var flag = graph.DetectCycleInGraph();
            
            return graph;
        }

        public IActionResult Index()
        {
            var graph = GetGraphObject();

            var grade = graph.CalculateGraphGrade();
            var sum = graph.CalculateSummatoryNodesGrade();
            var min = graph.CalculateLowestNodeGrade();

            var sb = new StringBuilder();
            sb.AppendLine($"Grade: {grade}");
            sb.AppendLine($"Sum: {sum}");
            sb.AppendLine($"Min: {min}");

            Debug.WriteLine(sb.ToString());

            return View();
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return View("~/Views/Home/Test.cshtml");
        }

        [HttpPost]
        [Route("get-graph")]
        public IActionResult GetGraph(List<NodeModel> nodes, List<EdgeModel> edges)
        {
            var graph = new Graph();
            foreach (var node in nodes)
            {
                graph.Nodes.Add(new Node
                {
                    Name = node.Name,
                    Id = node.Id
                });
            }

            foreach (var edge in edges)
            {
                var node = graph.Nodes.First(x => x.Id == edge.StartNodeId);
                node.Edges.Add(new Edge
                {
                    EndNodeId = graph.Nodes.First(x => x.Id == edge.EndNodeId).Id
                });
            }

            var graphDto = new GraphDto
            {
                Graph = graph,
                GraphGrade = graph.CalculateGraphGrade(),
                GraphGradeSummatory = graph.CalculateSummatoryNodesGrade(),
                GraphLowestGrade = graph.CalculateLowestNodeGrade(),
                GraphHasCycle = graph.DetectCycleInGraph()
            };

            return Json(graphDto);
        }

        [HttpGet]
        [Route("graph")]
        public IActionResult GetGraph()
        {
            var graph = GetGraphObject();
            return Ok(graph);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

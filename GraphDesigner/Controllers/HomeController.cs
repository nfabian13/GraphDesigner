using System.Diagnostics;
using System.Text;
using GraphDesignerApi.Models;
using GraphDesignerApi.Models.Graph;
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

        public Graph GetGraphObject()
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

            edge.StartNode = node1.Id;
            edge.EndNode = node2.Id;
            edge2.EndNode = node1.Id;
            node1.Edges.Add(edge);
            node2.Edges.Add(edge2);
            
            edge3.EndNode = node3.Id;
            edge4.EndNode = node2.Id;
            edge5.EndNode = node1.Id;

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

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
            node1.Name = "node 1";

            var node2 = new Node();
            node2.Name = "node 2";

            var node3 = new Node();
            node3.Name = "node 3";

            var edge = new Edge();
            edge.StartNode = node1;
            edge.EndNode = node2;

            node1.Edges.Add(edge);
            node2.Edges.Add(edge);

            var edge2 = new Edge();
            edge2.StartNode = node2;
            edge2.EndNode = node3;

            node2.Edges.Add(edge2);
            node3.Edges.Add(edge2);

            graph.Nodes.Add(node1);
            graph.Nodes.Add(node2);
            graph.Nodes.Add(node3);

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

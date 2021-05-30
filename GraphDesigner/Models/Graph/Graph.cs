using System;
using System.Collections.Generic;
using System.Linq;

namespace GraphDesignerApi.Models.Graph
{
    public class Graph
    {
        public Graph()
        {
            Nodes = new List<Node>();
        }

        public string Name { get; set; }
        public int Grade { get; set; }
        public List<Node> Nodes { get; set; }

        public int CalculateGraphGrade()
        {
            return Nodes.Max(x => x.Edges.Count);
        }

        public int CalculateSummatoryNodesGrade()
        {
            return Nodes.Select(x => x.Edges.Count).Sum();
        }

        public int CalculateLowestNodeGrade()
        {
            return Nodes.Min(x => x.Edges.Count);
        }

        public bool DetectCycleInGraph()
        {
            var node = Nodes.First();
            return HasCycle(node,-1);
        }

        private bool HasCycle(Node node, int prevNodeId)
        {
            var edges = node.Edges;
            foreach (var edge in edges)
            {
                if(prevNodeId == edge.EndNode) continue;
                var nextNode = Nodes.Find(node => node.Id == edge.EndNode);
                if (nextNode.Visit) return true;
                nextNode.Visit = true;
                var flag = HasCycle(nextNode, node.Id);
                if (flag)
                    return true;
            }
            return false;
        }
    }
}

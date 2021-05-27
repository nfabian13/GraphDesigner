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

        bool DetectCycleInGraph()
        {
            throw new NotImplementedException();
        }
    }
}

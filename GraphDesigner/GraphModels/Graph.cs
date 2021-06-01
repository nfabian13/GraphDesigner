using System.Collections.Generic;
using System.Linq;

namespace GraphDesigner.GraphModels
{
    public class Graph
    {
        public Graph()
        {
            Nodes = new List<Node>();
        }

        public string Name { get; set; }
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

        public void PaintValidPath(List<int> nodeIds)
        {
            var prevNode = new Node();
            foreach (var nodeId in nodeIds)
            {
                var currentNode = Nodes.Find(node => node.Id == nodeId);
                currentNode.ValidColor = true;
            }
        }
        public bool ValidPath(List<int> nodeIds)
        {
            if (nodeIds == null || nodeIds.Count == 0) return false;
           
            var prevNode = new Node();
            foreach (var nodeId in nodeIds)
            {
                var currentNode = Nodes.Find(node => node.Id == nodeId);
                if (prevNode.Id == 0)
                {
                    prevNode = currentNode;
                    continue;
                }

                var nodeIsConnected = false;
                foreach (var edge in prevNode.Edges)
                {
                    if (edge.EndNodeId == currentNode.Id)
                    {
                        prevNode = currentNode;
                        nodeIsConnected = true;
                        break;
                    }
                }

                if (!nodeIsConnected)
                    return false;
            }

            return true;
        }

        private bool HasCycle(Node node, int prevNodeId)
        {
            var edges = node.Edges;
            foreach (var edge in edges)
            {
                if(prevNodeId == edge.EndNodeId) continue;
                var nextNode = Nodes.Find(node => node.Id == edge.EndNodeId);
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

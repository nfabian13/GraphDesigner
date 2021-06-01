using System.Collections.Generic;

namespace GraphDesigner.GraphModels
{
    public class Node
    {
        public Node()
        {
            Edges = new List<Edge>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public bool Visit { get; set; }
        public bool ValidColor { get; set; } = false;
        public List<Edge> Edges { get; set; }
    }
}

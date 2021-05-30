using System.Collections.Generic;

namespace GraphDesignerApi.Models.Graph
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
        public List<Edge> Edges { get; set; }
    }
}

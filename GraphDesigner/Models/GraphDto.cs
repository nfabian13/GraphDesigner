using GraphDesigner.GraphModels;

namespace GraphDesigner.Models
{
    public class GraphDto
    {
        public Graph Graph { get; set; }
        public int GraphGrade { get; set; }
        public int GraphGradeSummatory { get; set; }
        public int GraphLowestGrade { get; set; }
        public bool GraphHasCycle { get; set; }
    }
}

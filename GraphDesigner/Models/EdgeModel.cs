using Newtonsoft.Json;

namespace GraphDesigner.Models
{
    public class EdgeModel
    {
        [JsonRequired]
        public int StartNodeId { get; set; }
        [JsonRequired]
        public int EndNodeId { get; set; }
    }
}

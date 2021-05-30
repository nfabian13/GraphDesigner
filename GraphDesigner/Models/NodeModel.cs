using Newtonsoft.Json;

namespace GraphDesigner.Models
{
    public class NodeModel
    {
        [JsonRequired]
        public int Id { get; set; }
        [JsonRequired]
        public string Name { get; set; }
    }
}

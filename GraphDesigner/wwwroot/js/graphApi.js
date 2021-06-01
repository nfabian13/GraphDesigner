function GraphApi(url) {
    var self = this;
    var nodes = [];
    var edges = [];
    var nodeIds = []; // used to check if there is a valid path between them

    var idGenerator = 0;

    self.getNodeIds = function() {
        return nodeIds;
    }

    self.addNodeId = function(nodeId) {
        nodeIds.push(nodeId);
    }

    self.resetNodeIds = function() {
        nodeIds = [];
    }

    self.getGraph = function(successCb, errorCb) {
        var myData = {
            nodes,
            edges,
            nodePathIds: nodeIds
        };

        $.ajax({
            type: "POST",
            url,
            data: myData,
            dataType: "json",
            success: successCb,
            error: errorCb
        });
    }

    self.getTableData = function() {
        var tableData = nodes.map(node => {
            return {
                startNode: node.name,
                endNodes: edges.filter(x => x.startNodeId == node.id)
                    .map(e => nodes.filter(n => n.id == e.endNodeId).map(nn => nn.name))
            };
        });
        return tableData;
    }

    self.addEdge = function(startNodeId, endNodeId) {
        var edge = {
            startNodeId,
            endNodeId
        };
        edges.push(edge);
    }

    self.getEdges = function() {
        return edges;
    }

    self.addNode = function(name) {
        var newId = ++idGenerator;
        nodes.push({ name, id: newId });
        return newId;
    }

    self.getNodes = function() {
        return nodes;
    }
}
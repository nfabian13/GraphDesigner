﻿function GraphDesigner() {
    var self = this;
    var $container = $("#mainContainer");
    var $txtNodeName = $container.find("#txtNodeName");
    var $startNodeSelect = $container.find("#startNodeSelect");
    var $endNodeSelect = $container.find("#endNodeSelect");
    var $btnConnectNodes = $container.find("#btnConnectNodes");
    var $table = $container.find("#nodeConnectionsTable");
    var $btnCreateGraph = $container.find("#btnCreateGraph");
    var $modal = $container.find("#graphModal");
    var url = $container.find("form").data("url");
    var graphApi = new GraphApi(url);
    var cy = cytoscape({
        container: document.getElementById("cy"),
        zoom: 1,
        pan: { x: 300, y: 200 },
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(id)'
                }
            }
        ]
    });

    self.init = function() {
        bindDOMEvents();
        resetTextInput();
    }

    function bindDOMEvents() {
        bindOnClickEvents();
        bindModalShownEvent();
        bindMiscEvents();
    }

    function bindMiscEvents() {
        $("form").submit(function(e) {
            e.preventDefault();
        });
        $startNodeSelect.on("change",
            function() {
                var nodeNamesArray = $(this).val();
                populateEndNodesTag();
                removeOptionFromSelectTag($endNodeSelect, nodeNamesArray);
                $endNodeSelect.prop("disabled", false);
                if (nodeNamesArray.length === graphApi.getNodes().length) {
                    $endNodeSelect.prop("disabled", true);
                }
            });
        $txtNodeName.on("keypress",
            function(e) {
                if (e.which === 13) {
                    var val = $txtNodeName.val();
                    var exists = graphApi.getNodes().filter(x => x.name === val).length > 0;
                    if (isEmpty(val)) {
                        alert("Invalid node name!");
                        return;
                    }
                    if (exists) {
                        alert("Duplicate node name!");
                        return;
                    }
                    var newlyAddedNodeId = graphApi.addNode(val);
                    resetStartNodesSelection();
                    appendOptionToSelectTag($startNodeSelect, newlyAddedNodeId, val);
                    increaseSelectTagHeight();
                    populateEndNodesTag();
                    resetTextInput();
                }
            });
    }

    function bindModalShownEvent() {
        $modal[0].addEventListener("shown.bs.modal",
            function(event) {
                var layout = cy.layout({
                    name: 'circle',
                    fit: true,
                    avoidOverlap: true
                });
                layout.run();
            });
    }

    function isEmpty(str) {
        return !str.trim().length;
    }

    function showModal() {
        var options = {
            backdrop: "static",
            focus: true
        };
        var myModal = new bootstrap.Modal($modal, options);
        myModal.show();
    }

    function addHardCodedNodesToGraph() {
        cy.add([
            { group: "nodes", data: { id: "a" } /*position: { x: 100, y: 100 }*/ },
            { group: "nodes", data: { id: "b" } /*position: { x: 200, y: 200 }*/ },
            { group: "nodes", data: { id: "c" } /*position: { x: 300, y: 300 }*/ },
            { group: "nodes", data: { id: 'd' } /*position: { x: 400, y: 400 }*/ },
            { group: "edges", data: { id: 'ab', source: 'a', target: 'b' } },
            { group: "edges", data: { id: 'ba', source: 'b', target: 'a' } },
            { group: "edges", data: { id: 'ad', source: 'a', target: 'd' } }
        ]);
    }

    function bindOnClickEvents() {
        $btnCreateGraph.on("click",
            function() {
                graphApi.getGraph(
                    function(response, textStatus, xhr) {
                        console.log(JSON.stringify(response));
                        var graph = response.graph;
                        var graphElements = [];
                        $.each(graph.nodes,
                            function(nodeIndex, node) {
                                var nodeElement = {
                                    group: "nodes",
                                    data: { id: node.name }
                                };
                                graphElements.push(nodeElement);
                                var edge = {};
                                node.edges.forEach((edgeElement, edgeIndex) => {
                                    var edgeId = "".concat(node.id).concat(edgeElement.endNodeId);
                                    var targetNodeId = graph.nodes.find(x => x.id === edgeElement.endNodeId).name;
                                    edge.group = "edges";
                                    edge.data = { id: edgeId, source: node.name, target: targetNodeId };
                                    graphElements.push(edge);
                                });
                            });
                        console.log(graphElements);
                        cy.add(graphElements);
                        //addHardCodedNodesToGraph();
                        showModal();
                    },
                    function(xhr, textStatus, errorThrown) {
                        alert("error: " + textStatus);
                    });
            });
        $btnConnectNodes.on("click",
            function() {
                var startNodesSelectedOptions = $startNodeSelect.children("option:selected").length
                    ? $startNodeSelect.children("option:selected")
                    : [];
                var endNodeSelectedOption = $endNodeSelect.children("option:selected").length
                    ? $endNodeSelect.children("option:selected")[0]
                    : null;
                if (!startNodesSelectedOptions || !startNodesSelectedOptions.length || !endNodeSelectedOption) {
                    alert("Nodes selection is invalid!");
                    return;
                }
                $.each(startNodesSelectedOptions,
                    function(index, opt) {
                        //duplicate addEdge() call due to bidirectional edge addition
                        graphApi.addEdge(parseInt(opt.value), parseInt(endNodeSelectedOption.value));
                        graphApi.addEdge(parseInt(endNodeSelectedOption.value), parseInt(opt.value));
                    });
                drawNodeConnectionsTable();
            });
    }

    function drawNodeConnectionsTable() {
        var $tbody = $table.children("tbody");
        var data = graphApi.getTableData();
        $tbody.empty();
        $.each(data,
            function(i, item) {
                var $circle = $("<button>").addClass("btn btn-primary btn-circle");
                var endNodesCircles = [];
                item.endNodes.forEach(
                    endNodeName => endNodesCircles.push($circle.addClass("me-1").text(endNodeName).prop("outerHTML")));
                $("<tr>").addClass("d-flex").append(
                        $("<td>").addClass("col-1").text(i + 1),
                        $("<td>").addClass("col-2").append($circle.text(item.startNode)),
                        $("<td>").addClass("col-0").append("<i class='bi-arrow-right'></i>"),
                        $("<tr>").addClass("col-4").html(endNodesCircles.join("")))
                    .appendTo($tbody);
            });
    }

    function resetStartNodesSelection() {
        var id = $startNodeSelect.attr("id");
        var selector = "#".concat(id).concat(" option:selected");
        $(selector).prop("selected", false);
    }

    function removeOptionFromSelectTag($selectTag, nodeNames) {
        var id = $selectTag.attr("id");
        $.each(nodeNames,
            function(i, val) {
                var selector = "#".concat(id).concat(" option[value='").concat(val).concat("']");
                var $option = $container.find(selector);
                if ($option) {
                    $option.remove();
                }
            });
    }

    function resetEndNodesTag() {
        $endNodeSelect.empty();
        //$endNodeSelect.append($("<option>").val("-1").text(""));
        $endNodeSelect.prop("disabled", true);
    }

    function populateEndNodesTag() {
        var nodes = graphApi.getNodes();
        var count = nodes.length;
        if (count <= 1) {
            return;
        }
        resetEndNodesTag();
        $.each(nodes,
            function(index, node) {
                appendOptionToSelectTag($endNodeSelect, node.id, node.name);
            });
    }

    function appendOptionToSelectTag($selectTag, id, text) {
        var $newNode = $("<option>").val(id).text(text);
        $selectTag.append($newNode);
    }

    function getNodesCount() {
        return graphApi.getNodes().length;
    }

    function increaseSelectTagHeight() {
        var startNodesCount = getNodesCount();
        if (startNodesCount <= 10) {
            $startNodeSelect.attr("size", startNodesCount++);
        }
    }

    function resetTextInput() {
        $txtNodeName.val('');
        $txtNodeName.focus();
    }
}
function GraphDesigner() {
    var self = this;
    var $container = $("#mainContainer");
    var $txtNodeName = $container.find("#txtNodeName");
    var $startNodeSelect = $container.find("#startNodeSelect");
    var $endNodeSelect = $container.find("#endNodeSelect");
    var $btnConnectNodes = $container.find("#btnConnectNodes");
    var $table = $container.find("#nodeConnectionsTable");
    var $btnCreateGraph = $container.find("#btnCreateGraph");
    var $modal = $container.find("#graphModal");
    var $validPathsSelect = $container.find("#nodesPathValidationDropdown");
    var $validateNodesPathContainer = $container.find("#validateNodesPathContainer");
    var $circle = $("<button>").addClass("btn btn-primary btn-circle");
    var url = $container.find("form").data("url");
    var graphApi = new GraphApi(url);

    self.init = function() {
        bindDOMEvents();
        resetTextInput();
    }

    function bindDOMEvents() {
        bindOnClickEvents();
        bindModalEvents();
        bindMiscEvents();
    }

    function getCytoscapeDefaults() {
        return {
            container: document.getElementById("cy"),
            zoom: 2,
            pan: { x: 300, y: 200 },
            layout: {
                name: 'circle',
                fit: true,
                avoidOverlap: true
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        //'background-color': '#4988fc',
                        'label': 'data(id)'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': '#ccc'
                    }
                }
            ]
        };
    }

    function bindMiscEvents() {
        $("form").submit(function(e) {
            e.preventDefault();
        });

        $validPathsSelect.on("change",
            function () {
                var nodeId = $(this).val();
                var nodeIdsArr = graphApi.getNodeIds();

                if (nodeId == -1) {
                    return;
                }

                // dont allow consecutive same node selection
                if (nodeIdsArr[nodeIdsArr.length - 1] == nodeId) {
                    return;
                }

                graphApi.addNodeId(nodeId);
                var nodeName = $(this).children("option:selected").text();

                if (nodeIdsArr.length == 1) {
                    $validateNodesPathContainer.append($circle.clone().text(nodeName).prop("outerHTML"));
                } else {
                    $validateNodesPathContainer.append("<i class='bi-arrow-right'></i>");
                    $validateNodesPathContainer.append($circle.clone().text(nodeName).prop("outerHTML"));
                }
               
            });

        $startNodeSelect.on("change",
            function() {
                var nodeIdsArray = $(this).val(); 
                populateEndNodesTag();
                removeOptionFromSelectTag($endNodeSelect, nodeIdsArray);
                $endNodeSelect.prop("disabled", false);
                if (nodeIdsArray.length === graphApi.getNodes().length) {
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
                    appendOptionToSelectTag($validPathsSelect, newlyAddedNodeId, val);
                }
            });
    }

    function bindModalEvents() {
        $modal[0].addEventListener("shown.bs.modal",
            function(event) {
            });

        $modal[0].addEventListener("hide.bs.modal",
            function (event) {
               
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

    function bindOnClickEvents() {
        $btnCreateGraph.on("click",
            function () {
                if (!graphApi.getNodes().length) {
                    alert("At least 1 Node must be specified");
                    return;
                }

                graphApi.getGraph(
                    function(response, textStatus, xhr) {
                        var cy = cytoscape(getCytoscapeDefaults());

                        var graph = response.graph;
                        var graphElements = [];
                        $.each(graph.nodes,
                            function (nodeIndex, node) {
                                var isValidColor = node.validColor;
                                var color = isValidColor ? "green" : "#4988fc";

                                var nodeElement = {
                                    group: "nodes",
                                    data: { id: node.name },
                                    style: {
                                        'background-color': color
                                    }
                                };

                                graphElements.push(nodeElement);
                                node.edges.forEach((edgeElement) => {
                                    var edge = {};
                                    var edgeId = "".concat(node.id).concat(edgeElement.endNodeId);
                                    var targetNodeName = graph.nodes.find(x => x.id === edgeElement.endNodeId).name;
                                    edge.group = "edges";
                                    edge.data = { id: edgeId, source: node.name, target: targetNodeName };
                                    graphElements.push(edge);
                                });
                            });

                      
                        displayGraphStats(response);
                        cy.add(graphElements);
                        setTimeout(function() {
                                var layout = cy.layout({
                                    name: 'circle',
                                    fit: true,
                                    avoidOverlap: true
                                });
                                layout.run();
                            },
                            100);
                       

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
               
                var edges = graphApi.getEdges();

                $.each(startNodesSelectedOptions,
                    function (index, opt) {
                        var duplicate = false;
                        var posibleMatchEdge = edges.filter((edge) => edge.startNodeId == opt.value);
                        posibleMatchEdge.forEach((edge) => {
                            if (edge.endNodeId == endNodeSelectedOption.value) {
                                duplicate = true;
                            }
                        });
                        if (!duplicate) {
                            graphApi.addEdge(parseInt(opt.value), parseInt(endNodeSelectedOption.value));
                            graphApi.addEdge(parseInt(endNodeSelectedOption.value), parseInt(opt.value));    
                        }
                        
                    });
                drawNodeConnectionsTable();
            });
    }

    function displayGraphStats(resp) {
        var footer = $modal.find("div.modal-footer");
        footer.addClass("fst-italic fw-bold");
        footer.empty();

        var graphGrade = resp.graphGrade;
        var graphGradeSummatory = resp.graphGradeSummatory;
        var graphLowestGrade = resp.graphLowestGrade;
        var hasCycle = resp.graphHasCycle === true ? "YES!" : "NO";

        footer.append($("<label>").text("Graph grade: ".concat(graphGrade)));
        footer.append($("<span>").text("·"));
        footer.append($("<label>").text("Graph's grade sum: ".concat(graphGradeSummatory)));
        footer.append($("<span>").text("·"));
        footer.append($("<label>").text("Graph's lowest grade: ".concat(graphLowestGrade)));
        footer.append($("<span>").text("·"));
        footer.append($("<label>").text("Has cycle?: ".concat(hasCycle)));
    }

    function drawNodeConnectionsTable() {
        var $tbody = $table.children("tbody");
        var data = graphApi.getTableData();
        $tbody.empty();
        $.each(data,
            function(i, item) {
                var endNodesCircles = [];
                item.endNodes.forEach(
                    endNodeName => endNodesCircles.push($circle.clone().addClass("me-1").text(endNodeName).prop("outerHTML")));
                $("<tr>").addClass("d-flex").append(
                        $("<td>").addClass("col-1").text(i + 1),
                        $("<td>").addClass("col-2").append($circle.clone().text(item.startNode)),
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
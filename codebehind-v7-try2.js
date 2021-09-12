/*
DICHIARAZIONE GRAFI graph1, graph2, graph3
DICHIARAZIONE variabile di appoggio graph per manipolare i grafi nei diversi metodi
DICHIARAZIONE variabile di appoggio simulation per avviare la simulazione dei metodi
*/

var visualizeNodes;
var visualizeChains;

var graph;
var simulation;
var graphs;
var graph1 = { 'nodes': 'a', 'links': 'b' };
var graph2 = { 'nodes': 'a', 'links': 'b' };
var graph3 = { 'nodes': 'a', 'links': 'b' };


/*
====================================
              METODO 1
====================================
*/
function metodo1() {
    mostraComandi(1);

    //inizializza d3 svg
    var w = window.innerWidth - 200;
    var h = window.innerHeight - 50;
    var svg = d3.select("svg").attr("width", w).attr("height", h);
    var width = svg.attr("width");
    var height = svg.attr("height");

    //effettua una copia di lavoro del grafo 
    var nodiDaVedere = [...graph.nodes];
    var linkDaVedere = [...graph.links];

    //crea lista contenente i nomi dei cluster senza ripetizioni (es [1,2,3,4...])
    var unique_cluster_name = [];
    nodiDaVedere.forEach(function (nodo) {
        if (!unique_cluster_name.includes(nodo.group))
            unique_cluster_name.push(nodo.group);
    })


    /*
    aggiungi un nodo invisibile a ogni cluster.
    aggiungi i nodi invisibili alla lista dei nodi su cui lavorare.
    collega tutti i nodi di un cluster al nodo invisibile relativo a quel cluster.
    */
    var lista_nodi_invisibili = [];
    unique_cluster_name.forEach(function (nome_cluster) {
        //lista di tutti i nodi del claster x 
        var lista_nodi_cluster = [];

        nodiDaVedere.push({ "name": "invisibile" + nome_cluster, "group": nome_cluster });
        lista_nodi_invisibili.push("invisibile" + nome_cluster)


        nodiDaVedere.forEach(function (nodo) {
            if (nodo.group == nome_cluster) {
                lista_nodi_cluster.push(nodo.name)
            }
        });


        lista_nodi_cluster.forEach(function (nodo_cluster) {
            linkDaVedere.push({ "source": "invisibile" + nome_cluster, "target": nodo_cluster, "value": 1 })
        });

    });


    //collega tra loro i nodi invisibili.
    for (i = 0; i < lista_nodi_invisibili.length - 1; i++) {
        for (j = 1; j < lista_nodi_invisibili.length; j++) {
            linkDaVedere.push({ "source": lista_nodi_invisibili[j], "target": lista_nodi_invisibili[i], "value": 0 })
        }
    };


    /*
    imposta la forza attrattiva/repulsiva tra i nodi e nodi fittizi.
    nodi dello stesso cluster sono attratti dal nodo fittizio del cluster stesso.
    nodi fittizi di diversi cluster, si respingono a vicenda.
    */
    let collisionNode = d3.forceCollide().radius(function (nodo) {
        if (nodo.name.includes("invisibile"))
            return 0;
        else
            return 20;
    })

    let distanceForceLink = d3.forceLink().id(function (link) {
        return link.name;
    })
        .distance(function (link) {
            //se i nodi sono dello stesso gruppo, l'invisibile attrae il visibile; gli altri non si attraggono/respingono.
            if (link.source.group == link.target.group) {
                if ((!link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                    return 0;
                }
                else {
                    if ((link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                        return -5;
                    }
                    else {
                        return 0;
                    }
                }
            }
            //se i nodi non sono dello stesso gruppo, gli invisibili si respingono; gli altri non si attraggono/respingono
            else {
                if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile")) {
                    return 600;
                }
                else {
                    return 0;
                }
            }
        })
        .strength(function (link) {
            //se i nodi sono dello stesso gruppo, l'invisibile attrae il visibile; gli altri non si attraggono/respingono.
            if (link.source.group == link.target.group) {
                if ((!link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                    return 0;
                }
                else {
                    if ((link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                        return 0.3;
                    }
                    else {
                        return 0;
                    }
                }
            }
            //se i nodi non sono dello stesso gruppo, gli invisibili si respingono; gli altri non si attraggono/respingono
            else {
                if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile")) {
                    return 0.2;
                }
                else {
                    return 0;
                }
            }
        })
        .links(linkDaVedere)



    //crea la simulazione
    simulation = d3
        .forceSimulation(nodiDaVedere)
        .force(
            "link",
            distanceForceLink
        )
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force('collision', collisionNode)
        .on("tick", ticked);



    //mostra link
    var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(linkDaVedere)
        .enter()
        .append("line")
        .attr("class", function (link) {
            if (link.source.name.includes("invisibile") || link.target.name.includes("invisibile")) {
                return 'invisibile'
            } else {
                return 'normale'
            }
        })
        .attr("stroke-width", function (link) {
            if (link.source.name.includes("invisibile") || link.target.name.includes("invisibile"))
                return 4;
            else
                return 3;
        })
        .attr("stroke-dasharray", function (link) {
            if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile"))
                return "20,10";
            else
                return "none";
        });

    //mostra nodi
    var colori_array = getArrayColori(unique_cluster_name.length);
    var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodiDaVedere)
        .enter()
        .append("circle")
        .attr("class", function (nodo) {
            if (nodo.name.includes("invisibile")) {
                return 'invisibile'
            } else {
                return 'normale'
            }
        })
        .attr("cursor", "pointer")
        .attr("r", function (nodo) { if (nodo.name.includes("invisibile")) return 10; else return 8 })
        .attr("fill", function (nodo) { if (nodo.name.includes("invisibile")) return 'red'; else return colori_array[nodo.group] })
        .attr("stroke", function (nodo) { if (nodo.name.includes("invisibile")) return 'none'; else return "black" })
        .call(
            //funzione associta al trascinamento del nodo 
            d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

    node.exit().remove();

    //viene richiamata la funzione ticked ogni volta che vengono attuate modifiche di qualsiasi tipo al grafo 
    function ticked() {
        //se il nodo è fuori dalla tela, inseriscilo in una posizione valida della tela
        node.attr("cx", function (nodo) { return nodo.x = Math.max(50, Math.min(width - 50, nodo.x)); })
            .attr("cy", function (nodo) { return nodo.y = Math.max(50, Math.min(height - 50, nodo.y)); });

        link.attr("x1", function (link) { return link.source.x; })
            .attr("y1", function (link) { return link.source.y; })
            .attr("x2", function (link) { return link.target.x; })
            .attr("y2", function (link) { return link.target.y; });
    }



    //evento associato al cambio della forza di collisione tra i nodi
    d3.select('#collision').on('click', function () {
        collisionNode.radius(this.value)
        simulation.alpha(0.5).restart();
    })

    //evento associato al cambio della distanza tra i nodi invisibili
    d3.select('#distance').on('click', function () {
        const valore = this.value;
        distanceForceLink.distance(function (link) {
            if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile")) {
                return valore;
            }
            else {
                if ((link.source.name.includes("invisibile") || link.target.name.includes("invisibile")) && link.source.group == link.target.group) {
                    return -10;
                } else {
                    return 0;
                }
            }
        })
        simulation.alpha(0.5).restart();
    })
}



/*
====================================
              METODO 2
====================================
*/
function metodo2(charge, coeffNodi) {
    mostraComandi(2);

    //save parameters
    const K = { 'charge': charge, 'coeffNodi': coeffNodi }


    function secondoDisegna() {

        var charge = K['charge'];
        var coeffNodi = K['coeffNodi'];

        //inizializza d3 svg
        var w = window.innerWidth - 200;
        var h = window.innerHeight - 50;
        var svg = d3.select("svg").attr("width", w).attr("height", h);
        var width = svg.attr("width");
        var height = svg.attr("height");


        //effettua una copia di lavoro del grafo 
        var nodiDaVedere = [...graph.nodes];
        var linkDaVedere = [...graph.links];

        console.log(graph.nodes)
        console.log(nodiDaVedere)


        //liste di supporto dei nodi e dei link 
        var nodes = [];
        var links = [];

        var chargeForce = d3.forceManyBody()

        // inizializzo la simulazione
        simulation = d3.forceSimulation()
            .force("link", d3.forceLink()
                .distance(200)
                .strength(.6)
                .id(d => d.name)
                .distance(function (d) {
                    if (d.source.name.includes("center") && d.target.name.includes("center ")) {
                        return -50;
                    }
                    else {
                        if ((d.source.name.includes("center") || d.target.name.includes("center")) && d.source.group == d.target.group) {
                            return 20;
                        } else {
                            if (d.source.group == d.target.group) {
                                return 0;
                            }
                            else {
                                return 0;
                            }
                        }
                    }
                }).strength(function (d) {
                    if (d.source.name.includes("center") && d.target.name.includes("center")) {
                        return 1;
                    }
                    else {
                        if ((d.source.name.includes("center") || d.target.name.includes("center")) && d.source.group == d.target.group) {
                            return 0;
                        }
                        else {
                            if (d.source.group == d.target.group) {
                                return 0
                            }
                            else {
                                return 0;
                            }
                        }
                    }
                }))
            .force("charge", chargeForce)
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .force('collision', d3.forceCollide().radius(function (d) {
                if (d.name.includes("center"))
                    return 200;
                else
                    return 40;
            })).on("tick", ticked);

        /* 
        #########################
        CREAZIONE NODI INVISIBILI
        ######################### 
        */

        showCenter = setTimeout(function () {
            // creo una lista dei cluster presenti nel nostro dataset
            var uniqueClusterName = [];
            nodiDaVedere.forEach(function (nodo) {
                if (!uniqueClusterName.includes(nodo.group))
                    uniqueClusterName.push(nodo.group);
            });

            // sapendo quanti cluster ho a disposizione posso creare la gamma
            // di colori da utilizzare per la rappresentazione
            var colori_array = getArrayColori(uniqueClusterName.length);

            // creo un nodo invisibile per ogni cluster
            // tale nodo sarà il nodo centrale per la creazione di ogni cluster.
            // A questo punto del codice la variabile "nodes" è una lista di nodi
            // che contiene solo i nodi invisibili;
            // ogni nodo ha un 'nome', appartiene a un 'group'
            // ed ha coordinate iniziali (x,y)=(width/2,height/2).
            var nodes = uniqueClusterName.map(function (d) {
                return createNode('center' + d, d, height, width);
            });

            console.log(nodes)

            // Visualizzazione dei nodi invisibili
            show('center');
        }, 0);

        /* 
        #########################
        CREAZIONE CATENELLE
        ######################### 
        */

        // aggiungo un ritardo temporale così da permettere che le azioni
        // precedenti abbiano il tempo di finire la loro esecuzione.
        showCatenelle = setTimeout(function () {

            // Visualizzazione dei nodi invisibili
            show('catenelle');
        }, 1000);

        /* 
        #########################
        VISUALIZZAZIONE DEL GRAFO
        ######################### 
        */

        // aggiungo un ritardo temporale così da permettere che le azioni
        // precedenti abbiano il tempo di finire la loro esecuzione.
        showCatenelle = setTimeout(function () {

            // Visualizzazione dei nodi invisibili
            show('nodes');
        }, 3000);

        /* 
        #########################
        FUNZIONI DI VISUALIZZAZIONE
        ######################### 
        */

        // la funzione show viene eseguita una prima volta per visualizzare i nodi invisibili "centrali".
        // name = ['center', 'catenelle', 'nodes']
        function show(name) {
            // nodi
            var nodeElements = svg.selectAll(".node").data(nodes, function (d) {
                return d.id
            });

            if (name == 'center' || name == 'catenelle') {
                // enter() dei nodi
                nodeElements.enter()
                    .append("circle")
                    .attr("class", d => "node " + d.id)
                    .attr("id", d => d.name)
                    .attr("r", 8)
                    .attr("fill", function (d) {
                        if (
                            d.name.includes("center")) return "black"; else return colori_array[d.group]
                    })
                    .attr("stroke", function (nodo) { if (nodo.name.includes("center")) return 'black'; else return "none" })
                    .call(
                        d3
                            .drag()
                            .on("start", dragstarted)
                            .on("drag", dragged)
                            .on("end", dragended)
                    );
            }
            else {
                if (name == 'nodes') {
                    nodeElements.enter()
                        .append("circle")
                        .attr("class", function (d) { return "node " + d.id; })
                        .attr("r", function (d) {
                            if (d.name.includes("invisibile")) {
                                return 10;
                            } else {
                                return 8
                            }
                        })
                        .attr("fill", function (d) { return colori_array[d.group] })
                        .attr("cursor", "pointer")
                        .call(
                            d3
                                .drag()
                                .on("start", dragstarted)
                                .on("drag", dragged)
                                .on("end", dragended)
                        );
                }
                else {
                    throw "Parameter 'name' is not defined."
                }
            }

            // exit() dei nodi
            nodeElements.exit().remove();

            // collegamenti
            var linkElements = svg.selectAll(".link").data(links);

            // enter() dei collegamenti
            linkElements.enter().insert("line", ".node").attr("class", "link");

            // exit() dei collegamenti
            linkElements.exit().remove();

            // riavvio della simulazione con aggiornamento dei nodes e dei links.
            simulation.nodes(nodes)
            simulation.force("link").links(links)
            simulation.restart();
        }

        // funzione che gestisce gli aggiornamenti della simulazione ad ogni tick
        function ticked() {

            var nodeElements = svg.selectAll(".node");
            var linkElements = svg.selectAll(".link");

            //se il nodo è fuori dalla tela, inseriscilo in una posizione valida della tela
            nodeElements.attr("cx", function (d) {
                if (d.name.includes("groupCluster")) {
                    return d.x
                }
                return d.x = Math.max(50, Math.min(width - 50, d.x));
            })
                .attr("cy", function (d) {
                    if (d.name.includes("groupCluster")) {
                        return d.y
                    }
                    return d.y = Math.max(50, Math.min(height - 50, d.y));
                });

            linkElements.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

        }
    }

    secondoDisegna();

    d3.select('#charge').on('click', function () {
        clearSetTimeoutFunction();
        d3.select("svg").remove();
        d3.select("#contenitore").append('svg')
        K['charge'] = this.value;
        secondoDisegna();
    })

    d3.select('#coeffNodi').on('click', function () {
        clearSetTimeoutFunction();
        d3.select("svg").remove();
        d3.select("#contenitore").append('svg')
        K['coeffNodi'] = this.value;
        secondoDisegna();
    })
}



/*
====================================
              METODO 3
====================================
*/
function metodo3(raggio) {
    mostraComandi(3);


    function terzoDisegna(raggio) {

        //effettua una copia di lavoro del grafo 
        var nodiDaVedere = [...graph.nodes];
        var linkDaVedere = [...graph.links];

        //inizializza d3 svg
        var w = window.innerWidth - 200;
        var h = window.innerHeight - 50;
        var svg = d3.select("svg").attr("width", w).attr("height", h);
        var width = svg.attr("width");
        var height = svg.attr("height");


        //crea lista contenente i nomi dei cluster senza ripetizioni (es [1,2,3,4...])
        var unique_cluster_name = [];
        nodiDaVedere.forEach(function (nodo) {
            if (!unique_cluster_name.includes(nodo.group))
                unique_cluster_name.push(nodo.group);
        })


        //groups è una lista di liste
        //ogni lista raggruppa nodi dello stesso cluster ( [[nodox cluster 1, nodoy cluster 1, .... ], [nodox cluster 2, nodoy cluster 2, ....], [...]] )
        var groups = Array.from(d3.group(nodiDaVedere, d => d.group), ([key, values]) => ({ key, values }))


        const invisibleNode = [];
        //crea una lista di nodi invisibili e li aggiunge in testa a nodiDaVedere
        unique_cluster_name.forEach(function (nome_cluster) {
            const nameInvisibleNode = "invisibile" + nome_cluster;
            invisibleNode.push(nameInvisibleNode)
            nodiDaVedere.unshift({ "name": nameInvisibleNode, "group": nome_cluster });
        });


        //collega tutti i nodi invisibili tra di loro
        invisibleNode.forEach(function (nodoj) {
            invisibleNode.forEach(function (nodoi) {
                if (nodoi != nodoj) {
                    linkDaVedere.push({ "source": nodoi, "target": nodoj, "value": 0 });
                }
            })
        })



        collideForce = d3.forceCollide().radius(function (nodo) {
            if (nodo.name.includes("invisibile"))
                return 0;
            else
                return 20;
        })

        simulation = d3
            .forceSimulation(nodiDaVedere)
            .force(
                "link",
                d3.forceLink()
                    .id(function (nodo) {
                        return nodo.name;
                    })
                    .distance(function (link) {
                        //se i nodi sono dello stesso gruppo, l'invisibile attrae il visibile; gli altri non si attraggono/respingono.
                        if (link.source.group == link.target.group) {
                            if ((!link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                                return 0;
                            }
                            else {
                                if ((link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                                    return -5;
                                }
                                else {
                                    return 0;
                                }
                            }
                        }
                        //se i nodi non sono dello stesso gruppo, gli invisibili si respingono; gli altri non si attraggono/respingono
                        else {
                            if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile")) {
                                return 600;
                            }
                            else {
                                return 0;
                            }
                        }
                    })
                    .strength(function (link) {
                        //se i nodi sono dello stesso gruppo, l'invisibile attrae il visibile; gli altri non si attraggono/respingono.
                        if (link.source.group == link.target.group) {
                            if ((!link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                                return 0;
                            }
                            else {
                                if ((link.source.name.includes("invisibile")) && (!link.target.name.includes("invisibile"))) {
                                    return 0.3;
                                }
                                else {
                                    return 0;
                                }
                            }
                        }
                        //se i nodi non sono dello stesso gruppo, gli invisibili si respingono; gli altri non si attraggono/respingono
                        else {
                            if (link.source.name.includes("invisibile") && link.target.name.includes("invisibile")) {
                                return 0.2;
                            }
                            else {
                                return 0;
                            }
                        }
                    })
                    .links(linkDaVedere)
            )
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force('collision', collideForce)
            .on("tick", ticked);


        //ritorna un valore proporzionale al numero di nodi del cluster 'group'
        function raggioGroup(group) {
            for (let i = 0; i < groups.length; i++) {
                if (groups[i].key == group) {
                    return (groups[i].values.length * raggio) + 50;
                }
            }
        }

        var link = svg
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(linkDaVedere)
            .enter()
            .append("line")
            .attr("stroke-width", function (link) {
                if (link.source.name.includes("invisibile") || link.target.name.includes("invisibile"))
                    return 0;
                else
                    return 3;
            });
        var colori_array = getArrayColori(unique_cluster_name.length);
        var node = svg
            .append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodiDaVedere)
            .enter()
            .append("circle")
            .attr("cursor", function (nodo) { if (nodo.name.includes("invisibile")) return "auto"; else return "pointer"; })
            .attr("r", function (nodo) {
                if (nodo.name.includes("invisibile")) {
                    return raggioGroup(nodo.group);
                } else {
                    return 8;
                }
            })
            .attr("fill", function (nodo) { if (nodo.name.includes("invisibile")) return "rgba(54, 208, 242, 0.2)"; else return colori_array[nodo.group] })
            .attr("stroke", "black")

            .call(
                d3
                    .drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended)
            );
        ;

        function ticked() {
            const invisibili = [];

            //riempi la lista invisibili con tutti i nodi invisibili
            //un nodo è caratterizzato da un group e da coordinate del centro
            node.attr("pippo", function (nodo) {
                if (nodo.name.includes("invisibile"))
                    invisibili.push({ group: nodo.group, x: nodo.x, y: nodo.y });
            });



            //verifica se il nodo è esterno al cerchio.
            //verifica prima la coordinata x e successivamente la coordinata y
            const offset = 40;
            node.attr("cx", function (nodo) {
                const coordinateCentro = getCentroGruppo(nodo.group, invisibili);
                if (distanzaCentro(nodo.x, nodo.y, coordinateCentro.x, coordinateCentro.y) > raggioGroup(nodo.group)) {
                    return nodo.x = coordinateCentro.x + (Math.random() * offset);
                } else {
                    return nodo.x;
                }
            })
                .attr("cy", function (nodo) {
                    const coordinateCentro = getCentroGruppo(nodo.group, invisibili);
                    if (distanzaCentro(nodo.x, nodo.y, coordinateCentro.x, coordinateCentro.y) > raggioGroup(nodo.group)) {
                        return nodo.y = coordinateCentro.y + (Math.random() * offset);
                    } else {
                        return nodo.y;
                    }
                }
                );


            //se il nodo è fuori dalla tela, inseriscilo in una posizione valida della tela
            node.attr("cx", function (nodo) {
                return nodo.x = Math.max(50, Math.min(width - 50, nodo.x));
            })
                .attr("cy", function (nodo) {
                    return nodo.y = Math.max(50, Math.min(height - 50, nodo.y));
                });



            link.attr("x1", function (link) { return link.source.x; })
                .attr("y1", function (link) { return link.source.y; })
                .attr("x2", function (link) { return link.target.x; })
                .attr("y2", function (link) { return link.target.y; });
        }
    }

    terzoDisegna(raggio)

    d3.select('#raggio').on('click', function () {
        d3.select("svg").remove();
        d3.select("#contenitore").append('svg')

        terzoDisegna(this.value);
    });
}


/*
====================================
       METODI DI UTILITY
====================================
*/

//produce un array di n colori random
function getArrayColori(n) {
    let arrayColori = [];
    for (let i = 0; i < n; i++) {
        arrayColori.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
    return arrayColori;
}

//funzione per avviare un nuovo metodo 
function selectMetodo(value) {
    d3.select("svg").remove();
    d3.select("#contenitore").append('svg')

    switch (value) {
        case "1":
            metodo1();
            break;
        case "2":
            metodo2(-100, 1.1);
            break;
        case "3":
            metodo3(5);
            break;
    }
}

//funzione chiamata quando si seleziona un nuovo grafo
function selectGraph(selectObject) {
    var method = document.getElementById("method").value;

    switch (selectObject.value) {
        case "1":
            graph = { ...graph1 };
            break;
        case "2":
            graph = { ...graph2 };
            break;
        case "3":
            graph = { ...graph3 };
            break;
    }

    selectMetodo(method);
}

//funzione chiamata quando si seleziona un nuovo metodo
function selectMethod(selectObject) {
    clearSetTimeoutFunction();
    selectMetodo(selectObject.value);
}

//funzione di supporto al metodo 1 per mostrare/nascondere i nodi fittizi
function hideOrShowInvisibleNode(checkbox) {
    var css = 'circle.invisibile { fill: none; }  line.invisibile {    stroke: none;  }',
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    if (checkbox.checked) {
        head.appendChild(style);
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
    }
    else {
        head.removeChild(head.lastChild);
    }
}

//funzione di supporto per calcolare la distanza tra due punti (x1,y1) e (x2,y2)
function distanzaCentro(x2, y2, x1, y1) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

//funzione di supporto all'inizio del drag 
function dragstarted(event, d) {
    if (!event.active)
        simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
}

//funzione di supporto durante il drag 
function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

//funzione di supporto alla fine del drag
function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

//funzione per mostrare i comandi del metodo : nel momento in cui viene selzionato un metodo vengon "nascosti" gli altri due 
function mostraComandi(metodo) {
    switch (metodo) {
        case 1:
            document.getElementById("comandi1").style.display = "block";
            document.getElementById("comandi2").style.display = "none";
            document.getElementById("comandi3").style.display = "none";
            break;
        case 2:
            document.getElementById("comandi1").style.display = "none";
            document.getElementById("comandi2").style.display = "block";
            document.getElementById("comandi3").style.display = "none";
            break;
        case 3:
            document.getElementById("comandi1").style.display = "none";
            document.getElementById("comandi2").style.display = "none";
            document.getElementById("comandi3").style.display = "block";
            break;
    }
}

//funzione di supporto per visualizzare a schermo un caricamento fittizio
function update() {
    var i = 0;
    var el = document.getElementById("loadingText");

    //viene impostato un certo timer e nel momento in cui finisce i tempo viene caricato il grafo
    var intervalId = setInterval(function () {
        i = i + 1;

        switch (i) {
            case 0:
                el.innerHTML = "loading.";
                break;
            case 1:
                el.innerHTML = "loading..";
                break;
            case 2:
                el.innerHTML = "loading...";
                break;
            case 3:
                el.innerHTML = "loading..";
                break;
            case 4:
                el.innerHTML = "loading.";
                break;
            case 5:
                document.getElementById("loading").style.display = "none";
                document.getElementById("simulazione").style.display = "block";
                metodo1();
                clearInterval(intervalId);
                break;
        }
    }, 350);
}

//funzione di supporto per recuperare l'elemento invisibili[i] tale per cui invisibili[i].group == groupId
//invisibili è una lista di nodi (invisibili).
function getCentroGruppo(groupId, invisibili) {
    for (let i = 0; i < invisibili.length; i++) {
        if (invisibili[i].group == groupId) {
            return invisibili[i]
        }
    }
}


//funzione di supporto per creare un oggetto nodo, che ha un 'nome' e appartiene a un 'group'
//il nodo ha le coordinate x=width/2 e y=height/2
function createNode(nome, group, height, width) {
    return { "name": nome, "x": width / 2, "y": height / 2, group }
}

//funzione di supporto per definire grandezza delle catenelle dei cluster.
//la grandezza delle catenelle dipende anche dal numero di nodi di un cluster (n) e un coefficiente coeffNodi
function decisiNumeroNodiInvisibili(n, coeffNodi) {
    return Math.floor(Math.log(n + 2.7) * 20 * coeffNodi)
}

//funzione di supporto
//groups è una lista di liste
//ogni lista raggruppa nodi dello stesso cluster ( [[nodox cluster 1, nodoy cluster 1, .... ], [nodox cluster 2, nodoy cluster 2, ....], [...]] )
//getIndexGroup ritorna la lista dei nodi che ha chiave 'd' 
function getIndexGroup(groups, d) {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].key == d) return groups[i];
    }
}

//funzione di supporto per defnire una path d3 a partire da una coordinata centrale cx,cy
//e un parametro myr che rappresenta il numero di punti per lato
function definePathcircle(cx, cy, myr) {
    return "M" + cx + "," + cy + " " +
        "m" + -myr + ", 0 " +
        "a" + myr + "," + myr + " 0 1,0 " + myr * 2 + ",0 " +
        "a" + myr + "," + myr + " 0 1,0 " + -myr * 2 + ",0Z";
}


//funzione di supporto per acquisire l'elemento di listaNodi del cluster 'group'
//listaNodi è una lista di elementi con i 3 campi 
//(x,y): coordinate del centro e group: cluster di appartenenza
function getNodeGroup(group, listaNodi) {
    for (var i = 0; i < listaNodi.length; i++) {
        if (listaNodi[i].group == group) {
            return listaNodi[i];
        }
    }
}


//funzione di supporto che ritorna un punto
//tale punto è posizionato intorno a un circle, successivo a un node
function circleCoord(circle, node, index, num_nodes) {
    var circumference = circle.node().getTotalLength();

    var pointAtLength = function (l) {
        return circle.node().getPointAtLength(l)
    };

    var sectionLength = (circumference) / num_nodes;
    var position = sectionLength * index + sectionLength / 2;

    return pointAtLength(circumference - position)
}


//funzione di supporto per pulire le funzioni setTimeout
function clearSetTimeoutFunction() {
    clearTimeout(visualizeNodes);
    clearTimeout(visualizeChains);
}

/*
====================================
            STARTUP
====================================
*/

window.onload = function () {
    update();


    // caricamento del json 

    var copyJson = [];

    console.log('bau')

    d3.json("/data.json").then(function (data) {
        console.log('miao')
        copyJson = JSON.parse(JSON.stringify(data));
        console.log(copyJson);

    });

    var intervalId = setInterval(function () {

        if (graph1 == null)
            graph1 = copyJson[0];

        if (graph2 == null)
            graph2 = copyJson[1];

        if (graph3 == null)
            graph3 = copyJson[2];


        if (graph1 != null && graph2 != null && graph3 != null) {

            //clearInterval: non richiama più quella funzione

            clearInterval(intervalId);
            graph1['nodes'] = copyJson[0].nodes;
            graph1['links'] = copyJson[0].links;

            graph2['nodes'] = copyJson[1].nodes;
            graph2['links'] = copyJson[1].links;

            graph3['nodes'] = copyJson[2].nodes;
            graph3['links'] = copyJson[2].links;

            graph = { ...graph1 };
        }

    }, 1000);
};
# cluster-graphs
Secondo progetto di Visualizzazione delle Informazioni

## Descrizione del progetto
Si suppone di avere in input un grafo clusterizzato flat (non c'è una gerarchia di clusters, ma ogni nodo del grafo appartiene ad un cluster). Questo progetto si propone di sperimentare diverse strategie per la rappresentazione dei clusters tramite un algoritmo force directed. Ci sono, infatti, almeno tre strategie che si potrebbero provare:

* Si potrebbe inserire un nodo fittizio per ogni cluster e che attira i nodi appartenenti al cluster stesso. I nodi fittizi non vengono visualizzati ma hanno lo scopo di tenere vicini i nodi appartenenti allo stesso cluster e di tenere lontani tra loro i cluster.
* Una seconda strategia consiste nel creare delle catenelle di nodi fittizi che accerchiano i nodi dello stesso cluster. Queste catenelle diventano, nel disegno finale, i bordi delle regioni che rappresentano i cluster. I nodi del grafo sono tenuti all'interno delle regioni rappresentanti i loro cluster dalle forze repulsive rispetto ai nodi delle catenelle.
* Il cluster potrebbe essere rappresentato da una forma geometrica fissa, per esempio un cerchio che abbia un raggio proporzionale alla dimensione del cluster. I nodi del cluster potrebbero essere vincolati a rimanere all'interno del cerchio rappresentante il cluster dall'algoritmo force directed implementato.

Lo scopo del progetto è quello di confrontare le varie soluzioni e, potenzialmente, di creare una libreria D3.js per il disegno di grafi clusterizzati.

var d3 = require('./d3.v4.min.js');
var Layout = require('./layout');
var l = new Layout();

var data = {
    name: "root",
    children: [
        { name:"node1" },
        { name:"node2" },
        { name:"node3",
           children: [
                { name: "node3-1" },
                { name: "node3-2" },
           ]
        },
        { name: "node4" }
    ]
};

var root = d3.hierarchy(data);
var descendants = root.descendants();

for (var i in descendants) {
    var d = descendants[i];
    d.width = (d.data.name.length * 8);
    d.height = 20;
}

l.tree(root);

console.log(root);
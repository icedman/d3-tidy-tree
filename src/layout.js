var Rect = require('./rect');
var Util = require('./util');
var flextree = require('d3-flextree-v4');

function Layout() {

    this.viewType = 'tree';
    this.direction = -1;
    this.compressTree = false;
    this.parentChildSeparation = 100;

    this._postProcess = function(node) {
        for(var i in node.children) {
            var n = node.children[i];
            var t = n.x;
            n.x = n.y;
            n.y = t;
            n.direction = this.direction;
            this._postProcess(n);
        };
    }

    this.tree = function(node) {
        var sep = this.parentChildSeparation;
        var flextree = lib.flextree()
            .nodeSize( function(n) {
                var s = (n.children && n.children.length > 0) ? sep : 0;
                return [ n.height, n.width + s];
            })

        if (this.compressTree) {
            flextree.
            separation(function(a,b) {
                return 1;
            });
        }

        flextree(node);
        this._postProcess(node);

        if (this.direction == -1) {
            Util.flipHorizontally(node);
        }
        
        node.viewType = 'tree';
    };

    this.mindmap = function(node) {

        var children = node.children;

        if (node.left == undefined) {
            var left = [];
            var right = [];
            for(var i in node.children) {
                if (i % 2) {
                    left.push(node.children[i]);
                } else {
                    right.push(node.children[i]);
                }
            }
            node.left = left;
            node.right = right;
        }

        this.direction = -1;
        node.children = node.left;
        this.tree(node);
        Util.moveTree(node, node.width, 0);

        var x = node.x;
        var y = node.y;

        this.direction = 1;
        node.children = node.right;
        this.tree(node);

        node.children = children;

        node.viewType = 'mindmap';
    };

    this.run = function(node) {
        switch(this.viewType) {
            case 'mindmap':
                this.mindmap(node);
                break;
            case 'tree':
            default:
                this.tree(node);
                break;
        }
    };
}

module.exports = Layout;
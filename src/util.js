var Rect = require('./rect');

function Util()
{
    this.computeBounds = function(nodes) {
        var r = new Rect();
        for (var i in nodes) {
            var d = nodes[i];
            r.addToBounds({x:d.x,y:d.y,width:d.width * 0.5,height:d.height});
        }
        return r;
    }

    this.moveTree = function(node, dx, dy) {
        node.x += dx;
        node.y += dy;
        
        for(var i in node.children) {
            var child = node.children[i];
            this.moveTree(child, dx, dy);
        }
    };

    this.flipHorizontally = function(node) {
        node.x = -node.x;
        for(var i in node.children) {
            this.flipHorizontally(node.children[i]);
        }
    };
}

module.exports = new Util();
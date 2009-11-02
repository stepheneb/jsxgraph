/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.

*/

/* Compatibility for <= 0.75.4 */
/*
JXG.getReference = function(board, object) {
    return JXG.GetReferenceFromParameter(board, object);
};
*/

JXG.IntergeoReader = new function() {
    this.board = null;
    /**
     * this.objects holds all objects from the XML file.
     * Every object hets an attribute "exists"
     */
    this.objects = {}; 

    this.readIntergeo = function(tree,board) {
        this.board = board;
        this.board.origin = {};
        this.board.origin.usrCoords = [1, 0, 0];
        this.board.origin.scrCoords = [1, 400, 300];
        this.board.unitX = 30;
        this.board.unitY = 30;
        this.board.stretchX = this.board.zoomX*this.board.unitX;
        this.board.stretchY = this.board.zoomY*this.board.unitY;

        this.readElements(tree.getElementsByTagName("elements"));
        this.board.fullUpdate();
        $('debug').innerHTML += 'start read constraints<br>';
        this.readConstraints(tree.getElementsByTagName("constraints"));
        $('debug').innerHTML += 'end read constraints<br>';
        this.board.fullUpdate();
    };

    this.readElements = function(tree) {
        var s;
        for (var s=0;s<tree[0].childNodes.length;s++) (function(s) {
            var node;
            node = tree[0].childNodes[s];
            if (node.nodeType>1) { return; } // not an element node
            if (node.nodeName=='point') {
                JXG.IntergeoReader.storePoint(node); //addPoint(node);
            } 
            else if (node.nodeName=='line') {
                JXG.IntergeoReader.storeLine(node);
            } 
            else if (node.nodeName=='line_segment') {
                JXG.IntergeoReader.storeLine(node);
            } 
            else if (node.nodeName=='circle') {
                JXG.IntergeoReader.storeCircle(node);
            } 
            else {
                document.getElementById('debug').innerHTML += 'Not implemented: '+node.nodeName + ' ' + node.getAttribute('id') + '<br>';
            }
        })(s);
    };

    /**
     * Points are created instantly via createElement
     */
    this.addPointOld = function(node) {
        var i = 0, 
            j = 0,
            l = 0,
            el,
            p = node.childNodes[i],
            c = [],
            attributes = {strokeColor:'red', fillColor:'red', withLabel:true},
            parents = [];
            
        while (p.nodeType>1) {  // skip non element nodes
            i++;
            p = node.childNodes[i];
        }

        attributes['name'] = node.getAttribute('id');
        
        if (p.nodeName == 'homogeneous_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    if (p.childNodes[j].nodeName=='double') {
                        c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                    } else if (p.childNodes[j].nodeName=='complex') {
                            for (l=0;l<p.childNodes[j].childNodes.length;l++) {
                                if (p.childNodes[j].childNodes[l].nodeName=='double') {
                                    c.push(p.childNodes[j].childNodes[l].firstChild.data);
                                }
                            }
                    } else {
                        document.getElementById('debug').innerHTML += 'Not implemented: '+ p.childNodes[j].nodeName + '<br>';  // <complex>
                        return;
                    }
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            if (c.length==3) { // Real
                parents = [c[2],c[0],c[1]];
            } else if (c.length==6 && Math.abs(c[1])<1e-10 && Math.abs(c[3])<1e-10 && Math.abs(c[5])<1e-10) {  // complex, but real
                parents = [c[4],c[0],c[2]];
            } else {
                document.getElementById('debug').innerHTML += 'type not supported, yet <br>';  // <complex>
                return;
            }
        } else if (p.nodeName == 'euclidean_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            parents = [c[0],c[1]];
        } else if (p.nodeName == 'polar_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            parents = [c[0]*Math.cos(c[1]),c[0]*Math.sin(c[1])];
        } else {
            document.getElementById('debug').innerHTML += "This coordinate type is not yet implemented: " +p.nodeName+'<br>';
            return; 
        }

        el = this.board.createElement('point', parents, attributes);
        this.objects[node.getAttribute('id')] = el;
    };

    /**
     * Points are created instantly via createElement
     */
    this.storePoint = function(node) {
        var i = 0, 
            j = 0,
            l = 0,
            p = node.childNodes[i],
            c = [],
            parents = [];
            
        while (p.nodeType>1) {  // skip non element nodes
            i++;
            p = node.childNodes[i];
        }

        if (p.nodeName == 'homogeneous_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    if (p.childNodes[j].nodeName=='double') {
                        c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                    } else if (p.childNodes[j].nodeName=='complex') {
                            for (l=0;l<p.childNodes[j].childNodes.length;l++) {
                                if (p.childNodes[j].childNodes[l].nodeName=='double') {
                                    c.push(p.childNodes[j].childNodes[l].firstChild.data);
                                }
                            }
                    } else {
                        document.getElementById('debug').innerHTML += 'Not implemented: '+ p.childNodes[j].nodeName + '<br>';  // <complex>
                        return;
                    }
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            if (c.length==3) { // Real
                parents = [c[2],c[0],c[1]];
            } else if (c.length==6 && Math.abs(c[1])<1e-10 && Math.abs(c[3])<1e-10 && Math.abs(c[5])<1e-10) {  // complex, but real
                parents = [c[4],c[0],c[2]];
            } else {
                document.getElementById('debug').innerHTML += 'type not supported, yet <br>';  // <complex>
                return;
            }
        } else if (p.nodeName == 'euclidean_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            parents = [c[0],c[1]];
        } else if (p.nodeName == 'polar_coordinates') {
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    c.push(p.childNodes[j].firstChild.data);  // content of <double>...</double>
                }
            }
            for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
            parents = [c[0]*Math.cos(c[1]),c[0]*Math.sin(c[1])];
        } else {
            document.getElementById('debug').innerHTML += "This coordinate type is not yet implemented: " +p.nodeName+'<br>';
            return; 
        }
        
        this.objects[node.getAttribute('id')] = {'id':node.getAttribute('id'), 'coords':null};
        this.objects[node.getAttribute('id')].coords = parents;
        this.objects[node.getAttribute('id')].id = node.getAttribute('id');
        this.objects[node.getAttribute('id')].exists = false;
        //el = this.board.createElement('point', parents, attributes);
        //this.objects[node.getAttribute('id')] = el;
    };

    /**
     * Line data is stored in an array
     * for further access during the reading of constraints.
     * There, id and name are needed.
     **/
    this.storeLine = function(node) {
        var i, p, c, j;
        
        this.objects[node.getAttribute('id')] = {'id':node.getAttribute('id'), 'coords':null};
        i = 0;
        p = node.childNodes[i];
        while (p.nodeType>1) {  // skip non element nodes
            i++;
            p = node.childNodes[i];
        }
        if (p.nodeName == 'homogeneous_coordinates') {
            c = [];
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    if (p.childNodes[j].nodeName=='double') {
                        c.push(parseFloat(p.childNodes[j].firstChild.data));  // content of <double>...</double>
                    } else {
                        //$('debug').innerHTML += 'Not: '+ p.childNodes[j].nodeName + '<br>';  // <complex>
                    }
                }
            }
            this.objects[node.getAttribute('id')].coords = c;
            this.objects[node.getAttribute('id')].id = node.getAttribute('id');
            this.objects[node.getAttribute('id')].exists = false;
       }
        //this.addLine(node.getAttribute('id'));
    };
    
    /** 
     * Direct construction of a line 
     * in read elements
     **/
    this.addLine = function(id) {    
        var j,
            c = this.objects[id].coords,
            el;
            
        for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
        el = this.board.createElement('line',[c[2],c[0],c[1]],{name:id, strokeColor:'black', withLabel:true});
        this.objects[id] = el;
    };

    /**
     * Circle data is stored in an array
     * for further access during the reading of constraints.
     * There, id and name are needed.
     * Concretely, the circle   (x-1)^2 + (y-3)^2 = 4   has matrix
     * (  1  0 -1 )
     * (  0  1 -3 )
     * ( -1 -3  6 )
     *
     * In general
     * Ax^2+Bxy+Cy^2+Dx+Ey+F = 0
     * is stored as
     * (  A   B/2  D/2 )
     * (  B/2  C   E/2 )
     * (  D/2 E/2  F )
     *
     *  Mx = D/A
     *  My = E/C
     *  r = A*Mx^2+B*My^2-F
     **/
    this.storeCircle = function(node) {
        var i, j, p, c;
        
        this.objects[node.getAttribute('id')] = {'id':node.getAttribute('id'), 'coords':null};
        i = 0;
        p = node.childNodes[i];
        while (p.nodeType>1) {  // skip non element nodes
            i++;
            p = node.childNodes[i];
        }
        if (p.nodeName == 'matrix') {
            c = [];
            for (j=0;j<p.childNodes.length;j++) {
                if (p.childNodes[j].nodeType==1) {
                    if (p.childNodes[j].nodeName=='double') {
                        c.push(parseFloat(p.childNodes[j].firstChild.data));  // content of <double>...</double>
                    } else {
                        //$('debug').innerHTML += 'Not: '+ p.childNodes[j].nodeName + '<br>';  // <complex>
                    }
                }
            }
            this.objects[node.getAttribute('id')].coords = c;
            this.objects[node.getAttribute('id')].id = node.getAttribute('id');
            this.objects[node.getAttribute('id')].exists = false;
        }
    };

    this.readConstraints = function(tree) {
        var s, param;
        
        // Set the default colors of dependent elements
        this.board.options.point.strokeColor = 'blue';
        this.board.options.point.fillColor = 'blue';
        
        for (s=0;s<tree[0].childNodes.length;s++) (function(s) {
            var node;
            node = tree[0].childNodes[s];
            if (node.nodeType>1) { return; } // not an element node
            if (node.nodeName=='line_through_two_points') {
                JXG.IntergeoReader.addLineThroughTwoPoints(node);
            } 
            else if (node.nodeName=='line_through_point') {
                JXG.IntergeoReader.addLineThroughPoint(node);
            } 
            else if (node.nodeName=='line_parallel_to_line_through_point') {
                JXG.IntergeoReader.addLineParallelToLineThroughPoint(node);
            } 
            else if (node.nodeName=='line_perpendicular_to_line_through_point') {
                JXG.IntergeoReader.addLinePerpendicularToLineThroughPoint(node);
            } 
            else if (node.nodeName=='line_segment_by_points') {
                JXG.IntergeoReader.addLineSegmentByTwoPoints(node);
            } 
            else if (node.nodeName=='endpoints_of_line_segment') {
                JXG.IntergeoReader.addEndpointsOfLineSegment(node);
            } 
            else if (node.nodeName=='free_point') {
                // do nothing
            } 
            else if (node.nodeName=='free_line') {
                JXG.IntergeoReader.addFreeLine(node);
            } 
            else if (node.nodeName=='point_on_line') {
                JXG.IntergeoReader.addPointOnLine(node);
            } 
            else if (node.nodeName=='point_on_line_segment') {
                JXG.IntergeoReader.addPointOnLine(node);
            }
            else if (node.nodeName=='point_on_circle') {
                JXG.IntergeoReader.addPointOnCircle(node);
            } 
            else if (node.nodeName=='angular_bisector_of_three_points') {
                JXG.IntergeoReader.addAngularBisectorOfThreePoints(node);
            } 
            else if (node.nodeName=='angular_bisectors_of_two_lines') {
                JXG.IntergeoReader.addAngularBisectorsOfTwoLines(node);
            } 
            else if (node.nodeName=='midpoint_of_two_points') {
                JXG.IntergeoReader.addMidpointOfTwoPoints(node);
            } 
            else if (node.nodeName=='midpoint') {
                JXG.IntergeoReader.addMidpointOfTwoPoints(node);
            } 
            else if (node.nodeName=='midpoint_of_line_segment') {
                JXG.IntergeoReader.addMidpointOfLineSegment(node);
            } 
            else if (node.nodeName=='point_intersection_of_two_lines') {
                JXG.IntergeoReader.addPointIntersectionOfTwoLines(node);
            } 
            else if (node.nodeName=='locus_defined_by_point') {
                JXG.IntergeoReader.addLocusDefinedByPoint(node);
            } 
            else if (node.nodeName=='locus_defined_by_point_on_line') {
                JXG.IntergeoReader.addLocusDefinedByPointOnLine(node);
            } 
            else if (node.nodeName=='locus_defined_by_point_on_line_segment') {
                JXG.IntergeoReader.addLocusDefinedByPointOnLine(node);
            }
            else if (node.nodeName=='locus_defined_by_line_through_point') {
                JXG.IntergeoReader.addLocusDefinedByLineThroughPoint(node);
            }
            else if (node.nodeName=='locus_defined_by_point_on_circle') {
                JXG.IntergeoReader.addLocusDefinedByPointOnCircle(node);
            } 
            else if (node.nodeName=='circle_by_three_points') {
                JXG.IntergeoReader.addCircleByThreePoints(node);
            } 
            else if (node.nodeName=='circle_by_center_and_point') {
                JXG.IntergeoReader.addCircleByCenterAndPoint(node);
            } 
            else if (node.nodeName=='center_of_circle') {
                JXG.IntergeoReader.addCenterOfCircle(node);
            } 
            else if (node.nodeName=='intersection_points_of_two_circles') {
                JXG.IntergeoReader.addIntersectionPointsOfTwoCircles(node);
            } 
            else if (node.nodeName=='intersection_points_of_circle_and_line') {
                JXG.IntergeoReader.addIntersectionPointsOfCircleAndLine(node);
            } 
            else if (node.nodeName=='other_intersection_point_of_two_circles') {
                JXG.IntergeoReader.addOtherIntersectionPointOfTwoCircles(node);
            } 
            else if (node.nodeName=='other_intersection_point_of_circle_and_line') {
                JXG.IntergeoReader.addOtherIntersectionPointOfCircleAndLine(node);
            } 
            else if (node.nodeName=='circle_tangent_lines_by_point') {
                JXG.IntergeoReader.addCircleTangentLinesByPoint(node);
            } 
            else {
                param = JXG.IntergeoReader.readParams(node);
                $('debug').innerHTML += 'readConstraints: not implemented: ' + node.nodeName + ': ' + param[0]+'<br>';
            }
        })(s);
    };

    this.setAttributes = function(o) {
        o.setProperty({strokecolor:this.board.options.point.strokeColor,fillColor:this.board.options.point.fillColor});
    }
    
    this.readParams = function(node) {
        var param = [], j;
        for (j=0;j<node.childNodes.length;j++) {
            if (node.childNodes[j].nodeType==1) {
                param.push(node.childNodes[j].firstChild.data);
            }
        }
        return param;
    };

    this.addPoint = function(p) {
        if (!p.exists) {
            p.exists = true;
            p = this.board.createElement('point',p.coords,{name:p.id});
            this.setAttributes(p);
        }
        return p;
    };

    this.addLineThroughTwoPoints = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el1, el2, el;
            
        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el = this.board.createElement('line', [el1.id,el2.id], {name:param[0],withLabel:true});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };

    this.addLineThroughPoint = function(node) {        
        var param = JXG.IntergeoReader.readParams(node),
            j,
            c = this.objects[param[0]].coords,
            p = this.addPoint(this.objects[param[1]]),
            el;
        
        for (j=0;j<c.length;j++) { c[j] = parseFloat(c[j]); }
        el = this.board.createElement('line',[
                    function() { return c[2]-c[0]*p.X()-c[1]*p.Y()-c[2]*p.Z(); }, c[0], c[1]
                ],{name:param[0], strokeColor:'black', withLabel:true});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };

    this.addLineParallelToLineThroughPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node), 
            el1, el2, el;

        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el = this.board.createElement('parallel',[el1.id,el2.id], {name:param[0],withLabel:true});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };

    this.addLinePerpendicularToLineThroughPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el1, el2, el;
        
        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el = this.board.createElement('perpendicular',[el.id,el.id],
                                {name:[param[0],param[0]+'foot'],id:[param[0],param[0]+'foot'],withLabel:true});
                                
        el[0].setProperty("straightFirst:true","straightLast:true"); // line
        el[1].setProperty("visible:false");                          // point
        this.objects[param[0]] = el[0];
        this.objects[param[0]].exists = true;
    };

    this.addLineSegmentByTwoPoints = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el1, el2, el;

        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el = this.board.createElement('line',[el1.id,el2.id], 
                        {name:param[0],
                            straightFirst:false, straightLast:false,
                            strokeColor:'black',
                            withLabel:true});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };

    this.addPointIntersectionOfTwoLines = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            l1 = this.objects[param[1]],
            l2 = this.objects[param[2]];
        
        this.objects[param[0]] = this.board.createElement('intersection',[l1,l2,0]);
        this.setAttributes(this.objects[param[0]]);
        this.objects[param[0]].exists = true;
    };

    this.addFreeLine = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            a = this.objects[param[0]].coords[0],
            b = this.objects[param[0]].coords[1],
            c = this.objects[param[0]].coords[2];
            el = this.board.createElement('line',[c,a,b],{name:param[0],id:param[0],withLabel:true});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };

    this.addPointOnLine = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            l = JXG.getReference(this.board,param[1]),
            el;
        el = this.board.createElement('glider',[0,0,l],{name:param[0],id:param[0],withLabel:true});
        //this.setAttributes(p);
        this.objects[param[0]].exists = true;
    };

    this.addPointOnCircle = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            c = JXG.getReference(this.board,param[1]),
            el;
        el = this.board.createElement('glider',[0,0,c],{name:param[0],id:param[0],withLabel:true});
        //this.setAttributes(p);
        this.objects[param[0]].exists = true;
    };

    this.addEndpointsOfLineSegment = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            line = this.objects[param[2]],
            p = this.addPoint(this.objects[param[0]]),
            q = this.addPoint(this.objects[param[1]]);

        p.addConstraint([
                    function(){return line.point1.Z();},
                    function(){return line.point1.X();},
                    function(){return line.point1.Y();}
                    ]);
        q.addConstraint([
                    function(){return line.point2.Z();},
                    function(){return line.point2.X();},
                    function(){return line.point2.Y();}
                    ]);
        this.setAttributes(p);
        this.setAttributes(q);
    };
    
    this.addAngularBisectorOfThreePoints = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el1, el2, el3, el;
            
        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el3 = this.addPoint(this.objects[param[3]]);
        el = this.board.createElement('bisector',[el1.id,el2.id,el3.id,
                                {name:[param[0]+'_1',param[0]+'_2'], id:[param[0]+'_1',param[0]+'_2'], withLabel:true});
        el.setProperty({straightFirst:false,straightLast:true,strokeColor:'#000000'});
        this.objects[param[0]] = el;
        this.objects[param[0]].exists = true;
    };
    
    this.addMidpointOfTwoPoints = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el1, el2, el3;

        el1 = this.addPoint(this.objects[param[1]]);
        el2 = this.addPoint(this.objects[param[2]]);
        el = this.board.createElement('midpoint',[el1.id,el2.id],{name:param[0]});
        this.setAttributes(el);
        this.objects[param[0]].exists = true;
    };

    this.addMidpointOfLineSegment = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            l = JXG.getReference(this.board,param[1]);
        el = this.board.createElement('midpoint',[l.point1,l.point2],{name:param[0]});
        this.setAttributes(el);
        this.objects[param[0]].exists = true;
    };

// ----------------------------------------------------------------------------------------------------
    /**
     * The angular bisectors of two line [c1,a1,b1] and [c2,a2,b2] are determined by the equation:
     * (a1*x+b1*y+c1*z)/sqrt(a1^2+b1^2) = +/- (a2*x+b2*y+c2*z)/sqrt(a2^2+b2^2)
     */
    this.addAngularBisectorsOfTwoLines = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            l1 = this.objects[param[2]],
            l2 = this.objects[param[3]];
        this.board.createElement('bisectorlines',
            [l1,l2],
            {name:[param[0],param[1]], id:[param[0],param[1]],
            straightFirst:true, straightLast:true, strokeColor:'#ff0000', withLabel:true});
    };
    
    this.addLocusDefinedByPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node), 
            el = JXG.getReference(this.board,param[1]);
        el.setProperty({trace:true});
        this.objects[param[1]] = el;
        this.setAttributes(el);
    };
    
    this.addLocusDefinedByPointOnLine = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el = JXG.getReference(this.board,param[1]);
        el.setProperty({trace:true});
        this.objects[param[1]] = el;
        this.setAttributes(el);
    };

    this.addLocusDefinedByLineThroughPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el = JXG.getReference(this.board,param[1]);
        el.setProperty({trace:true});
        this.objects[param[1]] = el;
        this.setAttributes(el);
    };
    
    this.addLocusDefinedByPointOnCircle = function(node) {
        var param = JXG.IntergeoReader.readParams(node), 
            el = JXG.getReference(this.board,param[1]);
        el.setProperty({trace:true});
        this.objects[param[1]] = el;
        this.setAttributes(el);
    };
    
    this.addCircleByThreePoints = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            p = [], i, ar;
        for (i=0;i<3;i++) {
          p[i] = JXG.getReference(this.board,param[i+1]);
        }
        ar = this.board.createElement('circumcircle',p, {name:[param[0]+'c',param[0]], id:[param[0]+'c',param[0]],withLabel:true});
        ar[0].setProperty({visible:false}); // center should be invisible
        ar[1].setProperty({withLabel:true}); // label of circle does not work yet
    };

    this.addCircleByCenterAndPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node);
        this.board.createElement('circle',
            [this.objects[param[1]],this.objects[param[2]]],
            {name:param[0],id:param[0],withLabel:true});
    };

    this.addIntersectionPointsOfTwoCircles = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            c1 = JXG.getReference(this.board,param[2]),
            c2 = JXG.getReference(this.board,param[3]),
            p1 = this.objects[param[0]],
            p2 = this.objects[param[1]];
        p1.addConstraint([this.board.intersection(c1,c2,0)]);
        p2.addConstraint([this.board.intersection(c1,c2,1)]);
        this.setAttributes(p1);
        this.setAttributes(p2);
    };
    
    this.addIntersectionPointsOfCircleAndLine = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            c1 = JXG.getReference(this.board,param[2]),
            c2 = JXG.getReference(this.board,param[3]),
            p1 = this.objects[param[0]],
            p2 = this.objects[param[1]];
        
        p1.addConstraint([this.board.intersection(c1,c2,0)]);
        p2.addConstraint([this.board.intersection(c1,c2,1)]);
        this.setAttributes(p1);
        this.setAttributes(p2);
    };
    
    this.addOtherIntersectionPointOfTwoCircles = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            c1 = JXG.getReference(this.board,param[2]),
            c2 = JXG.getReference(this.board,param[3]),
            p1  = this.objects[param[1]],
            p2  = this.objects[param[0]]; // output

        p2.addConstraint([this.board.otherIntersection(c1,c2,p1)]);
        this.setAttributes(p2);
    };
    
    this.addOtherIntersectionPointOfCircleAndLine = function(node) {
        this.addOtherIntersectionPointOfTwoCircles(node);
    };

    this.addCircleTangentLinesByPoint = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            c = JXG.getReference(this.board,param[2]),
            p = JXG.getReference(this.board,param[3]),
            //t1 = this.objects[param[0]],
            //t2 = this.objects[param[1]];
            m, polar, i1, i2, t1, t2;
        
        polar = this.board.createElement('line', [
                    function(){ return JXG.Math.matVecMult(c.quadraticform,p.coords.usrCoords)[0]; },
                    function(){ return JXG.Math.matVecMult(c.quadraticform,p.coords.usrCoords)[1]; },
                    function(){ return JXG.Math.matVecMult(c.quadraticform,p.coords.usrCoords)[2]; }
                ] , {visible:false});     

        i1 = this.board.createElement('intersection', [c,polar,0],{visible:false});
        i2 = this.board.createElement('intersection', [c,polar,1],{visible:false});
        //t1 = this.board.createElement('line', [p,i1]);
        //t2 = this.board.createElement('line', [p,i2]);
        t1 = this.board.createElement('tangent', [i1,c]);
        t2 = this.board.createElement('tangent', [i2,c]);
        this.objects[param[0]] = t1;
        this.objects[param[1]] = t2;
    };

    this.addCenterOfCircle = function(node) {
        var param = JXG.IntergeoReader.readParams(node),
            el = JXG.getReference(this.board,param[0]),
            c = JXG.getReference(this.board,param[1]);
        el.addConstraint([function(){return c.midpoint.X();},function(){return c.midpoint.Y();}]);
    };

    
    /**
     * Extract the xml-code as String from the zipped Intergeo archive.
     * @return {string} xml code
     */
    this.prepareString = function(fileStr){
        var bA = [], i;
        
        if (fileStr.indexOf('<')!=0) {
            //binary = false;
            for (i=0;i<fileStr.length;i++)
                bA[i]=JXG.Util.asciiCharCodeAt(fileStr,i);
                   
            fileStr = (new JXG.Util.Unzip(bA)).unzipFile("construction/intergeo.xml");  // Unzip 
                                                                                        // Extract "construction/intergeo.xml" from
                                                                                        // the zip-archive in bA.
        }
        return fileStr;
    };
};



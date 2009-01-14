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

/**
 * Slider (Schieberegler)
 * input: 3 arrays:
 * [x0,y0],[x1,y1],[min,start,max]
 * The slider is line from [x0,y0] to [x1,y1].
 * The position [x0,y0]  corresponds to the value "min",
 * [x1,y1] corresponds to the value max.
 * Initally, the slider is at position [x0,y0] + ([x1,y1]-[x0,y0])*start/(max-min)
 * The return value is an invisible point, whos X() or Y() value
 * returns the position between max and min,
 **/
JXG.createSlider = function(board, parentArr, atts) {
    var pos0 = parentArr[0];
    var pos1 = parentArr[1];
    var smin = parentArr[2][0];
    var start = parentArr[2][1];
    var smax = parentArr[2][2];
    var p1 = board.createElement('point', pos0, {visible:false, fixed:true,name:''}); 
    var p2 = board.createElement('point', pos1,{visible:false,fixed:true,name:''}); 
    var l1 = board.createElement('line', [p1,p2], {straightFirst:false,straightLast:false,strokewidth:1,name:''});
    var ticks  = 10;
    l1.ticksDelta = p2.Dist(p1)/ticks;
    l1.enableTicks();
    p1.needRegularUpdate = false;
    p2.needRegularUpdate = false;
    l1.needRegularUpdate = false;
    var startx = pos0[0]+(pos1[0]-pos0[0])*(start-smin)/(smax-smin);
    var starty = pos0[1]+(pos1[1]-pos0[1])*(start-smin)/(smax-smin);
    var p3 = board.createElement('point', [startx,starty], {slideObject:l1,style:6,strokeColor:'#0080c0',fillColor:'#0080c0',name:''});
    var l2 = board.createElement('line', [p1,p3], {straightFirst:false,straightLast:false,strokewidth:3,strokeColor:'#0080c0',name:''}); 
    var p4 = board.createElement('point', [
            function() {return p3.Dist(p1)/p2.Dist(p1)*(smax - smin)+smin;}, 
            function() {return p3.Dist(p1)/p2.Dist(p1)*(smax - smin)+smin;}, 
            ], 
            {visible:false,name:''});
    var t = board.createElement('text', [(pos1[0]-pos0[0])*.05+pos1[0], (pos1[1]-pos0[1])*.05+pos1[1], function(){return board.round(p4.X(),2);}],{name:''}); 
    /*
    var p3 = board.createElement('point', [sx + start, sy], {slideObject:l1,style:6,strokeColor:'#0080c0',fillColor:'#0080c0',name:''});
    var p4 = board.createElement('point', [function() {return ((p3.X() - sx)/sw * (smax - smin)+smin);}, function() {return (sy  + 1);}], {visible:false,name:''});
    var l2 = board.createElement('line', [p1,p3], {straightFirst:false,straightLast:false,strokewidth:3,strokeColor:'#0080c0',name:''}); 
    var t = board.createElement('text', [(sx+sw)*1.05, sy, function(){return board.round(p4.X(),2);}],{name:''}); 
        */
    return p4;
};    

JXG.JSXGraph.registerElement('slider', JXG.createSlider);
/*
    Copyright 2008, 
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
 * @fileoverview The class Angle is defined in this file.
 * @author graphjs
 */
 
/**
 * Creates a new instance of Angle.
 * @class This class manages drawing and editing angles.
 * @param {JXG.Board} board The board the angle is associated with.
 * @param {JXG.Point} p1 First point A defining the angle ABC.
 * @param {JXG.Point} p2 First point B defining the angle ABC.
 * @param {JXG.Point} p3 First point C defining the angle ABC.
 * @param {float} radius Radius of the angle.
 * @param {String} text A text drawn beside the angle.
 * @param {String} id Unique identifier for this object. If null or an empty string is given,
 * an unique id will be generated by Board
 * @param {String} name Not necessarily unique name, displayed on the board. If null or an
 * empty string is given, an unique name will be generated.
 * @constructor
 * @extends JXG.GeometryElement
 */
JXG.Angle = function (board, p1, p2, p3, radius, text, id, name) {
    /* Call the constructor of GeometryElement */
    this.constructor();
    
    /**
     * Type of GeometryElement, value is OBJECT_TYPE_ANGLE.
     * @final
     * @type int
     */    
    this.type = JXG.OBJECT_TYPE_ANGLE;
    
    /**
     * Class of the element, value is OBJECT_CLASS_AREA.
     * @final
     * @type int
     */
    this.elementClass = JXG.OBJECT_CLASS_AREA;
    
    this.init(board, id, name);
    
    /**
     * First point A defining the angle ABC.
     * @type JXG.Point
     */
    this.point1 = JXG.GetReferenceFromParameter(this.board, p1);

    /**
     * Second point B defining the angle ABC.
     * @type JXG.Point
     */    
    this.point2 = JXG.GetReferenceFromParameter(this.board, p2);
    
    /**
     * Third point C defining the angle ABC.
     * @type JXG.Point
     */
    this.point3 = JXG.GetReferenceFromParameter(this.board, p3);    

    /**
    * Radius of the Angle
    * @type Float
    */
    this.radius = this.board.options.angle.radius;
    if(radius != undefined && radius != null) {
        this.radius = radius;
    }

    this.visProp['fillColor'] = this.board.options.angle.fillColor;
    this.visProp['highlightFillColor'] = this.board.options.angle.highlightFillColor;
    this.visProp['fillOpacity'] = this.board.options.angle.fillOpacity;
    this.visProp['highlightFillOpacity'] = this.board.options.angle.highlightFillOpacity;
    this.visProp['strokeColor'] = this.board.options.angle.strokeColor;    
    
    /** 
    * Text (ie name) of the Angle
    * @type String
    */
    this.text = text;

    this.id = this.board.addAngle(this);
    
    /* Add sector as child to defining points */
    this.point1.addChild(this);
    this.point2.addChild(this);
    this.point3.addChild(this);    
};

JXG.Angle.prototype = new JXG.GeometryElement;

/**
 * Checks whether (x,y) is near the angle.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} Always false, because the angles interior shall not be highlighted
 */
JXG.Angle.prototype.hasPoint = function (x, y) { 
    return false; 
};

/**
 * Uses the boards renderer to update the angle and all of its children.
 */
 JXG.Angle.prototype.updateRenderer = function () {
    if (this.needsUpdate) {
        this.board.renderer.updateAngle(this);
        this.needsUpdate = false;
    }
};

/**
 * Creates a new angle.
 * @param {JXG.Board} board The board the angle is put on.
 * @param {Array} parents Array of three points defining the angle.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. @see JXG.GeometryElement#setProperty
 * @type JXG.Angle
 * @return Reference to the created angle object.
 */
JXG.createAngle = function(board, parents, attributes) {
    var el;
    // Alles 3 Punkte?
    if ( (JXG.IsPoint(parents[0])) && (JXG.IsPoint(parents[1])) && (JXG.IsPoint(parents[2]))) {
        el = new JXG.Angle(board, parents[0], parents[1], parents[2], attributes['id'], attributes['name']);
    } // Ansonsten eine fette Exception um die Ohren hauen
    else
        throw ("Can't create angle with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "' and '" + (typeof parents[2]) + "'.");

    return el;
};

JXG.JSXGraph.registerElement('angle', JXG.createAngle);
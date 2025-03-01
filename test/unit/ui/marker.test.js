import {test} from '../../util/test.js';
import window from '../../../src/util/window.js';
import {createMap as globalCreateMap} from '../../util/index.js';
import Marker from '../../../src/ui/marker.js';
import Popup from '../../../src/ui/popup.js';
import LngLat from '../../../src/geo/lng_lat.js';
import Point from '@mapbox/point-geometry';
import simulate from '../../util/simulate_interaction.js';

function createMap(t, options = {}) {
    const container = window.document.createElement('div');
    Object.defineProperty(container, 'getBoundingClientRect', {value:
        () => {
            return {
                height: 512,
                width: 512
            };
        }
    });
    return globalCreateMap(t, {container, ...options});
}

test('Marker uses a default marker element with an appropriate offset', (t) => {
    const marker = new Marker();
    t.ok(marker.getElement());
    t.ok(marker.getOffset().equals(new Point(0, -14)));
    t.end();
});

test('Marker uses a default marker element with custom color', (t) => {
    const marker = new Marker({color: '#123456'});
    t.ok(marker.getElement().innerHTML.includes('#123456'));
    t.end();
});

test('Marker uses a default marker element with custom scale', (t) => {
    const map = createMap(t);
    const defaultMarker = new Marker()
        .setLngLat([0, 0])
        .addTo(map);
    // scale smaller than default
    const smallerMarker = new Marker({scale: 0.8})
        .setLngLat([0, 0])
        .addTo(map);
    // scale larger than default
    const largerMarker = new Marker({scale: 2})
        .setLngLat([0, 0])
        .addTo(map);

    // initial dimensions of svg element
    t.ok(defaultMarker.getElement().firstChild.getAttribute('height').includes('41'));
    t.ok(defaultMarker.getElement().firstChild.getAttribute('width').includes('27'));

    // (41 * 0.8) = 32.8, (27 * 0.8) = 21.6
    t.ok(smallerMarker.getElement().firstChild.getAttribute('height').includes(`32.8`));
    t.ok(smallerMarker.getElement().firstChild.getAttribute('width').includes(`21.6`));

    // (41 * 2) = 82, (27 * 2) = 54
    t.ok(largerMarker.getElement().firstChild.getAttribute('height').includes('82'));
    t.ok(largerMarker.getElement().firstChild.getAttribute('width').includes('54'));

    t.end();
});

test('Marker uses a default marker with custom offset', (t) => {
    const marker = new Marker({offset: [1, 2]});
    t.ok(marker.getElement());
    t.ok(marker.getOffset().equals(new Point(1, 2)));
    t.end();
});

test('Marker uses the provided element', (t) => {
    const element = window.document.createElement('div');
    const marker = new Marker({element});
    t.equal(marker.getElement(), element);
    t.end();
});

test('Marker#addTo adds the marker element to the canvas container', (t) => {
    const map = createMap(t);
    new Marker()
        .setLngLat([-77.01866, 38.888])
        .addTo(map);

    t.equal(map.getCanvasContainer().querySelectorAll('.mapboxgl-marker').length, 1);

    map.remove();
    t.end();
});

test('Marker provides LngLat accessors', (t) => {
    t.equal(new Marker().getLngLat(), undefined);

    t.ok(new Marker().setLngLat([1, 2]).getLngLat() instanceof LngLat);
    t.deepEqual(new Marker().setLngLat([1, 2]).getLngLat(), new LngLat(1, 2));

    t.ok(new Marker().setLngLat(new LngLat(1, 2)).getLngLat() instanceof LngLat);
    t.deepEqual(new Marker().setLngLat(new LngLat(1, 2)).getLngLat(), new LngLat(1, 2));

    t.end();
});

test('Marker provides offset accessors', (t) => {
    t.ok(new Marker().setOffset([1, 2]).getOffset() instanceof Point);
    t.deepEqual(new Marker().setOffset([1, 2]).getOffset(), new Point(1, 2));

    t.ok(new Marker().setOffset(new Point(1, 2)).getOffset() instanceof Point);
    t.deepEqual(new Marker().setOffset(new Point(1, 2)).getOffset(), new Point(1, 2));

    t.end();
});

test('Marker#setPopup binds a popup', (t) => {
    const popup = new Popup();
    const marker = new Marker()
        .setPopup(popup);
    t.equal(marker.getPopup(), popup);
    t.end();
});

test('Marker#setPopup unbinds a popup', (t) => {
    const marker = new Marker()
        .setPopup(new Popup())
        .setPopup();
    t.ok(!marker.getPopup());
    t.end();
});

test('Marker#togglePopup opens a popup that was closed', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .addTo(map)
        .setPopup(new Popup())
        .togglePopup();

    t.ok(marker.getPopup().isOpen());

    map.remove();
    t.end();
});

test('Marker#togglePopup closes a popup that was open', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .addTo(map)
        .setPopup(new Popup())
        .togglePopup()
        .togglePopup();

    t.ok(!marker.getPopup().isOpen());

    map.remove();
    t.end();
});

test('Enter key on Marker opens a popup that was closed', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .addTo(map)
        .setPopup(new Popup());

    // popup not initially open
    t.notOk(marker.getPopup().isOpen());

    simulate.keypress(marker.getElement(), {code: 'Enter'});

    // popup open after Enter keypress
    t.ok(marker.getPopup().isOpen());

    map.remove();
    t.end();
});

test('Space key on Marker opens a popup that was closed', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .addTo(map)
        .setPopup(new Popup());

    // popup not initially open
    t.notOk(marker.getPopup().isOpen());

    simulate.keypress(marker.getElement(), {code: 'Space'});

    // popup open after Enter keypress
    t.ok(marker.getPopup().isOpen());

    map.remove();
    t.end();
});

test('Marker#setPopup sets a tabindex', (t) => {
    const popup = new Popup();
    const marker = new Marker()
        .setPopup(popup);
    t.equal(marker.getElement().getAttribute('tabindex'), "0");
    t.end();
});

test('Marker#setPopup removes tabindex when unset', (t) => {
    const popup = new Popup();
    const marker = new Marker()
        .setPopup(popup)
        .setPopup();
    t.notOk(marker.getElement().getAttribute('tabindex'));
    t.end();
});

test('Marker#setPopup does not replace existing tabindex', (t) => {
    const element = window.document.createElement('div');
    element.setAttribute('tabindex', '5');
    const popup = new Popup();
    const marker = new Marker({element})
        .setPopup(popup);
    t.equal(marker.getElement().getAttribute('tabindex'), "5");
    t.end();
});

test('Marker anchor defaults to center', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .addTo(map);
    map._domRenderTaskQueue.run();

    t.ok(marker.getElement().classList.contains('mapboxgl-marker-anchor-center'));
    t.match(marker.getElement().style.transform, /translate\(-50%,-50%\)/);

    map.remove();
    t.end();
});

test('Marker anchors as specified by the anchor option', (t) => {
    const map = createMap(t);
    const marker = new Marker({anchor: 'top'})
        .setLngLat([0, 0])
        .addTo(map);
    map._domRenderTaskQueue.run();

    t.ok(marker.getElement().classList.contains('mapboxgl-marker-anchor-top'));
    t.match(marker.getElement().style.transform, /translate\(-50%,0\)/);

    map.remove();
    t.end();
});

test('Marker accepts backward-compatible constructor parameters', (t) => {
    const element = window.document.createElement('div');

    const m1 = new Marker(element);
    t.equal(m1.getElement(), element);

    const m2 = new Marker(element, {offset: [1, 2]});
    t.equal(m2.getElement(), element);
    t.ok(m2.getOffset().equals(new Point(1, 2)));
    t.end();
});

test('Popup offsets around default Marker', (t) => {
    const map = createMap(t);

    const marker = new Marker()
        .setLngLat([0, 0])
        .setPopup(new Popup().setText('Test'))
        .addTo(map);
    map._domRenderTaskQueue.run();

    t.ok(marker.getPopup().options.offset.bottom[1] < 0, 'popup is vertically offset somewhere above the tip');
    t.ok(marker.getPopup().options.offset.top[1] === 0, 'popup is vertically offset at the tip');
    t.ok(marker.getPopup().options.offset.left[0] > 0, 'popup is horizontally offset somewhere to the right of the tip');
    t.ok(marker.getPopup().options.offset.right[0] < 0, 'popup is horizontally offset somewhere to the left of the tip');

    t.ok(marker.getPopup().options.offset['bottom-left'][0] > 0, 'popup is horizontally offset somewhere to the top right of the tip');
    t.ok(marker.getPopup().options.offset['bottom-left'][1] < 0, 'popup is vertically offset somewhere to the top right of the tip');
    t.ok(marker.getPopup().options.offset['bottom-right'][0] < 0, 'popup is horizontally offset somewhere to the top left of the tip');
    t.ok(marker.getPopup().options.offset['bottom-right'][1] < 0, 'popup is vertically offset somewhere to the top left of the tip');

    t.deepEqual(marker.getPopup().options.offset['top-left'], [0, 0], 'popup offset at the tip when below to the right');
    t.deepEqual(marker.getPopup().options.offset['top-right'], [0, 0], 'popup offset at the tip when below to the left');

    t.end();
});

test('Popup anchors around default Marker', (t) => {
    const map = createMap(t);

    const marker = new Marker()
        .setLngLat([0, 0])
        .setPopup(new Popup().setText('Test'))
        .addTo(map);

    // open the popup
    marker.togglePopup();

    const mapHeight = map.getContainer().getBoundingClientRect().height;
    const markerTop = -marker.getPopup().options.offset.bottom[1]; // vertical distance from tip of marker to the top in pixels
    const markerRight = -marker.getPopup().options.offset.right[0]; // horizontal distance from the tip of the marker to the right in pixels

    // give the popup some height
    Object.defineProperty(marker.getPopup()._container, 'offsetWidth', {value: 100});
    Object.defineProperty(marker.getPopup()._container, 'offsetHeight', {value: 100});

    // marker should default to above since it has enough space
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-bottom'), 'popup anchors above marker');

    // move marker to the top forcing the popup to below
    marker.setLngLat(map.unproject([mapHeight / 2, markerTop]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-top'), 'popup anchors below marker');

    // move marker to the right forcing the popup to the left
    marker.setLngLat(map.unproject([mapHeight - markerRight, mapHeight / 2]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-right'), 'popup anchors left of marker');

    // move marker to the left forcing the popup to the right
    marker.setLngLat(map.unproject([markerRight, mapHeight / 2]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-left'), 'popup anchors right of marker');

    // move marker to the top left forcing the popup to the bottom right
    marker.setLngLat(map.unproject([markerRight, markerTop]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-top-left'), 'popup anchors bottom right of marker');

    // move marker to the top right forcing the popup to the bottom left
    marker.setLngLat(map.unproject([mapHeight - markerRight, markerTop]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-top-right'), 'popup anchors bottom left of marker');

    // move marker to the bottom left forcing the popup to the top right
    marker.setLngLat(map.unproject([markerRight, mapHeight]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-bottom-left'), 'popup anchors top right of marker');

    // move marker to the bottom right forcing the popup to the top left
    marker.setLngLat(map.unproject([mapHeight - markerRight, mapHeight]));
    map._domRenderTaskQueue.run();
    t.ok(marker.getPopup()._container.classList.contains('mapboxgl-popup-anchor-bottom-right'), 'popup anchors top left of marker');

    t.end();
});

test('Marker drag functionality can be added with drag option', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.isDraggable(), true);

    map.remove();
    t.end();
});

test('Marker#setDraggable adds drag functionality', (t) => {
    const map = createMap(t);
    const marker = new Marker()
        .setLngLat([0, 0])
        .setDraggable(true)
        .addTo(map);

    t.equal(marker.isDraggable(), true);

    map.remove();
    t.end();
});

test('Marker#setDraggable turns off drag functionality', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.isDraggable(), true);

    marker.setDraggable(false);

    t.equal(marker.isDraggable(), false);

    map.remove();
    t.end();
});

test('Marker with draggable:true fires dragstart, drag, and dragend events at appropriate times in response to mouse-triggered drag with map-inherited clickTolerance', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.mousedown(el, {clientX: 0, clientY: 0});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    simulate.mousemove(el, {clientX: 2.9, clientY: 0});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0, "drag not called yet, movement below marker's map-inherited click tolerance");
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    // above map's click tolerance
    simulate.mousemove(el, {clientX: 3.1, clientY: 0});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 1, 'drag fired once click tolerance exceeded');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.mousemove(el, {clientX: 0, clientY: 0});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2, 'drag fired when moving back within clickTolerance of mousedown');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.mouseup(el);
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2);
    t.equal(dragend.callCount, 1);
    t.equal(el.style.pointerEvents, 'auto');

    map.remove();
    t.end();
});

test('Marker with draggable:true fires dragstart, drag, and dragend events at appropriate times in response to mouse-triggered drag with marker-specific clickTolerance', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true, clickTolerance: 4})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.mousedown(el, {clientX: 0, clientY: 0});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    simulate.mousemove(el, {clientX: 3.9, clientY: 0});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0, "drag not called yet, movement below marker's map-inherited click tolerance");
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    // above map's click tolerance
    simulate.mousemove(el, {clientX: 4.1, clientY: 0});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 1, 'drag fired once click tolerance exceeded');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.mousemove(el, {clientX: 0, clientY: 0});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2, 'drag fired when moving back within clickTolerance of mousedown');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.mouseup(el);
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2);
    t.equal(dragend.callCount, 1);
    t.equal(el.style.pointerEvents, 'auto');

    map.remove();
    t.end();
});

test('Marker with draggable:false does not fire dragstart, drag, and dragend events in response to a mouse-triggered drag', (t) => {
    const map = createMap(t);
    const marker = new Marker({})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.mousedown(el, {clientX: 0, clientY: 0});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    simulate.mousemove(el, {clientX: 3, clientY: 1});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    simulate.mouseup(el);
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    map.remove();
    t.end();
});

test('Marker with draggable:true fires dragstart, drag, and dragend events at appropriate times in response to a touch-triggered drag with map-inherited clickTolerance', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.touchstart(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    simulate.touchmove(el, {touches: [{clientX: 2.9, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0, "drag not called yet, movement below marker's map-inherited click tolerance");
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    // above map's click tolerance
    simulate.touchmove(el, {touches: [{clientX: 3.1, clientY: 0}]});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 1, 'drag fired once click tolerance exceeded');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.touchmove(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2, 'drag fired when moving back within clickTolerance of touchstart');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.touchend(el);
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2);
    t.equal(dragend.callCount, 1);
    t.equal(el.style.pointerEvents, 'auto');

    map.remove();
    t.end();
});

test('Marker with draggable:true fires dragstart, drag, and dragend events at appropriate times in response to a touch-triggered drag with marker-specific clickTolerance', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true, clickTolerance: 4})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.touchstart(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    simulate.touchmove(el, {touches: [{clientX: 3.9, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0, "drag not called yet, movement below marker's map-inherited click tolerance");
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, '');

    // above map's click tolerance
    simulate.touchmove(el, {touches: [{clientX: 4.1, clientY: 0}]});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 1, 'drag fired once click tolerance exceeded');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.touchmove(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2, 'drag fired when moving back within clickTolerance of touchstart');
    t.equal(dragend.callCount, 0);
    t.equal(el.style.pointerEvents, 'none', 'cancels pointer events while dragging');

    simulate.touchend(el);
    t.equal(dragstart.callCount, 1);
    t.equal(drag.callCount, 2);
    t.equal(dragend.callCount, 1);
    t.equal(el.style.pointerEvents, 'auto');

    map.remove();
    t.end();
});

test('Marker with draggable:false does not fire dragstart, drag, and dragend events in response to a touch-triggered drag', (t) => {
    const map = createMap(t);
    const marker = new Marker({})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();

    const dragstart = t.spy();
    const drag      = t.spy();
    const dragend   = t.spy();

    marker.on('dragstart', dragstart);
    marker.on('drag',      drag);
    marker.on('dragend',   dragend);

    simulate.touchstart(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    simulate.touchmove(el, {touches: [{clientX: 0, clientY: 0}]});
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    simulate.touchend(el);
    t.equal(dragstart.callCount, 0);
    t.equal(drag.callCount, 0);
    t.equal(dragend.callCount, 0);

    map.remove();
    t.end();
});

test('Marker with draggable:true moves to new position in response to a mouse-triggered drag', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();
    const startPos = map.project(marker.getLngLat());
    simulate.mousedown(el);
    simulate.mousemove(el, {clientX: 10, clientY: 10});
    simulate.mouseup(el);

    const endPos = map.project(marker.getLngLat());
    t.equal(Math.round(endPos.x), startPos.x + 10);
    t.equal(Math.round(endPos.y), startPos.y + 10);

    map.remove();
    t.end();
});

test('Marker with draggable:false does not move to new position in response to a mouse-triggered drag', (t) => {
    const map = createMap(t);
    const marker = new Marker({})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();
    const startPos = map.project(marker.getLngLat());

    simulate.mousedown(el);
    simulate.mousemove(el);
    simulate.mouseup(el);

    const endPos = map.project(marker.getLngLat());

    t.equal(startPos.x, endPos.x);
    t.equal(startPos.y, endPos.y);

    map.remove();
    t.end();
});

test('Marker with draggable:true does not error if removed on mousedown', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map);
    const el = marker.getElement();
    simulate.mousedown(el);
    simulate.mousemove(el, {clientX: 10, clientY: 10});

    marker.remove();
    t.ok(map.fire('mouseup'));
    t.end();
});

test('Marker can set rotationAlignment and pitchAlignment', (t) => {
    const map = createMap(t);
    const marker = new Marker({rotationAlignment: 'map', pitchAlignment: 'map'})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.getRotationAlignment(), 'map');
    t.equal(marker.getPitchAlignment(), 'map');

    map.remove();
    t.end();
});

test('Marker can set and update rotation', (t) => {
    const map = createMap(t);
    const marker = new Marker({rotation: 45})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.getRotation(), 45);

    marker.setRotation(90);
    t.equal(marker.getRotation(), 90);

    map.remove();
    t.end();
});

test('Marker transforms rotation with the map', (t) => {
    const map = createMap(t);
    const marker = new Marker({rotationAlignment: 'map'})
        .setLngLat([0, 0])
        .addTo(map);
    map._domRenderTaskQueue.run();

    const rotationRegex = /rotateZ\(-?([0-9]+)deg\)/;
    const initialRotation = marker.getElement().style.transform.match(rotationRegex)[1];

    map.setBearing(map.getBearing() + 180);
    map._domRenderTaskQueue.run();

    const finalRotation = marker.getElement().style.transform.match(rotationRegex)[1];
    t.notEqual(initialRotation, finalRotation);

    map.remove();
    t.end();
});

test('Marker transforms pitch with the map', (t) => {
    const map = createMap(t);
    const marker = new Marker({pitchAlignment: 'map'})
        .setLngLat([0, 0])
        .addTo(map);

    map.setPitch(0);
    map._domRenderTaskQueue.run();

    const rotationRegex = /rotateX\(-?([0-9]+)deg\)/;
    const initialPitch = marker.getElement().style.transform.match(rotationRegex)[1];

    map.setPitch(45);
    map._domRenderTaskQueue.run();

    const finalPitch = marker.getElement().style.transform.match(rotationRegex)[1];
    t.notEqual(initialPitch, finalPitch);

    map.remove();
    t.end();
});

test('Marker pitchAlignment when set to auto defaults to rotationAlignment', (t) => {
    const map = createMap(t);
    const marker = new Marker({rotationAlignment: 'map', pitchAlignment: 'auto'})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.getRotationAlignment(), marker.getPitchAlignment());

    map.remove();
    t.end();
});

test('Marker pitchAlignment when set to auto defaults to rotationAlignment (setter/getter)', (t) => {
    const map = createMap(t);
    const marker = new Marker({pitchAlignment: 'map'})
        .setLngLat([0, 0])
        .addTo(map);

    t.equal(marker.getPitchAlignment(), 'map');
    marker.setRotationAlignment('viewport');
    marker.setPitchAlignment('auto');
    t.equal(marker.getRotationAlignment(), marker.getPitchAlignment());

    map.remove();
    t.end();
});

test('Drag above horizon clamps', (t) => {
    const map = createMap(t);
    map.setPitch(85);
    const marker = new Marker({draggable: true})
        .setLngLat(map.unproject([map.transform.width / 2, map.transform.horizonLineFromTop() + 20]))
        .addTo(map);
    const el = marker.getElement();
    const startPos = map.project(marker.getLngLat());
    const atHorizon = map.project(map.unproject([map.transform.width / 2, map.transform.horizonLineFromTop()]));
    t.true(atHorizon.y < startPos.y + 5);

    simulate.mousedown(el);
    simulate.mousemove(el, {clientX: 0, clientY: -40});
    simulate.mouseup(el);

    const endPos = map.project(marker.getLngLat());
    t.true(Math.abs(endPos.x - startPos.x) < 0.00000000001);
    t.equal(endPos.y, atHorizon.y);

    map.remove();
    t.end();
});

test('Drag below / behind camera', (t) => {
    const map = createMap(t);
    map.setPitch(85);
    const marker = new Marker({draggable: true})
        .setLngLat(map.unproject([map.transform.width / 2, map.transform.height - 20]))
        .addTo(map);
    const el = marker.getElement();
    const startPos = map.project(marker.getLngLat());

    simulate.mousedown(el);
    simulate.mousemove(el, {clientX: 0, clientY: 40});
    simulate.mouseup(el);

    const endPos = map.project(marker.getLngLat());
    t.true(Math.abs(endPos.x - startPos.x) < 0.00000000001);
    t.equal(Math.round(endPos.y), Math.round(startPos.y) + 40);

    map.remove();
    t.end();
});

test('Marker and fog', (t) => {
    const map = createMap(t);
    const marker = new Marker({draggable: true})
        .setLngLat([0, 0])
        .addTo(map)
        .setPopup(new Popup().setHTML(`a popup content`))
        .togglePopup();

    map.on('load', () => {
        map.setFog({
            "range": [0.5, 10.5]
        });

        t.ok(map.getFog());
        map.once('render', () => {
            map.setZoom(10);
            map.setCenter([0, 0]);

            t.test('not occluded', (t) => {
                marker.setLngLat([0, 0]);

                setTimeout(() => {
                    t.deepEqual(marker.getElement().style.opacity, 1.0);
                    t.end();
                }, 100);
            });

            t.test('occluded high', (t) => {
                map.setBearing(90);
                map.setPitch(70);
                marker.setLngLat([1.0, 0]);

                setTimeout(() => {
                    t.deepEqual(marker.getElement().style.opacity, 0.5900199155427887);
                    t.end();
                }, 100);
            });

            t.test('occluded mid', (t) => {
                map.setBearing(90);
                map.setPitch(70);
                marker.setLngLat([1.2, 0]);

                setTimeout(() => {
                    t.deepEqual(marker.getElement().style.opacity, 0.4580009697138284);
                    t.end();
                }, 100);
            });

            t.test('occluded low', (t) => {
                map.setBearing(90);
                map.setPitch(70);
                marker.setLngLat([2.5, 0]);

                setTimeout(() => {
                    t.deepEqual(marker.getElement().style.opacity, 0.053455443950435555);
                    t.end();
                }, 100);
            });

            t.test('occluded', (t) => {
                map.setBearing(90);
                map.setPitch(70);
                marker.setLngLat([4, 0]);

                setTimeout(() => {
                    t.deepEqual(marker.getElement().style.opacity, 0.0);
                    t.end();
                }, 100);
            });

            t.end();
        });
    });
});

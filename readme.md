# b-castle

Simple Box2d network game.

Two players controls cannons. Aim: destroy opponent.

This is simple game uses Javascript Box2D library for client side, nginx as proxy and Tornado Framework as websocket server. Currently using Javascript ES6, nginx 1.10.3, Tornado 4.5.2, python 3.5.3.
<h3>FEATURES</h3>
<ul>
    <li>Two players.</li>
    <li>Can be played on the same computer or different.</li>
    <li>Random destuctable terrain.</li>
    <li>Wind force changes every turn.</li>
</ul>
<h3>HOW TO USE</h3>
<ol type="1">
    <li>Configure nginx using cgi/tornado config.</li>
    <li>Start server: run 'python3 server.py' from cgi/</li>
    <li>In browser enter server's IP (or localhost)</li>
    <li>Second player can connect to server on the same computer in other browser tab or window or another browser. Also second player can connect from another computer.</li>
</ol>
By default websocket port: 8888. To change: change at cgi/server.py, cgi/tornado and www/connector.js

<h3>Screenshots:</h3><br>
<img src='https://github.com/iozheg/b-castle/blob/master/bc1.PNG'></img>
<img src='https://github.com/iozheg/b-castle/blob/master/bc2.PNG'></img>
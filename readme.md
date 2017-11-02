b-castle

Simple Box2d game

Two players controls cannons. Aim: destroy opponent.

This is simple game uses Javascript Box2D library for client side, nginx as proxy and Tornado Framework as websocket server. Currently using Javascript ES5, nginx 1.10.3, Tornado 4.5.2, python 3.5.3.
HOW TO USE

    Configure nginx using cgi/tornado config.
    Run 'python3 server.py' from cgi/
    From local machine: localhost, from another should work by IP (client defines host by it self).

By default websocket port: 8888. To change: change at cgi/server.py, cgi/tornado and www/connectorClass.js
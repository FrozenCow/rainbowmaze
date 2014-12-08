define(['platform', 'game', 'vector', 'staticcollidable', 'linesegment', 'editor', 'required', 'state', 'level', 'mouse', 'collision', 'keyboard', 'quake', 'resources', 'objectmanager','graphics'], function(platform, Game, Vector, StaticCollidable, LineSegment, editor, required, state, level, mouse, collision, keyboard, quake, resources, ObjectManager,Graphics) {
    var t = new Vector(0, 0);
    var t2 = new Vector(0, 0);
    var rs = {
        'images': [],
        'audio': ['jump01','jump02','jump03','jump04','checkpoint','finish','finish01','finish02','finish03']
    };
    var g, game;
    platform.once('load', function() {
        var canvas = document.getElementById('main');
        game = g = new Game(startGame, canvas, [required(['chrome']), mouse, keyboard, resources(rs), state, level, collision, quake]);
        g.resources.status.on('changed', function() {
            g.graphics.context.clearRect(0, 0, game.width, game.height);
            g.graphics.context.fillStyle = 'black';
            g.graphics.context.font = 'arial';
            g.graphics.fillCenteredText('Preloading ' + g.resources.status.ready + '/' + g.resources.status.total + '...', 400, 300);
        });
    });

    function startGame(err) {
        if (err) {
            console.error(err);
        }
        var images = g.resources.images;
        var audio = g.resources.audio;
        g.objects.lists.particle = g.objects.createIndexList('particle');
        g.objects.lists.spring = g.objects.createIndexList('spring');
        g.objects.lists.start = g.objects.createIndexList('start');
        g.objects.lists.finish = g.objects.createIndexList('finish');
        g.objects.lists.enemy = g.objects.createIndexList('enemy');
        g.objects.lists.usable = g.objects.createIndexList('usable');
        g.objects.lists.collectable = g.objects.createIndexList('collectable');
        g.objects.lists.shadow = g.objects.createIndexList('shadow');
        g.objects.lists.background = g.objects.createIndexList('background');
        g.objects.lists.foreground = g.objects.createIndexList('foreground');
        g.objects.lists.planet = g.objects.createIndexList('isplanet');
        g.objects.lists.grounded = g.objects.createIndexList('grounded');

        var background = document.getElementById('background');
        var backgroundContext = background.getContext('2d');

        var trail = document.getElementById('trail');
        var trailContext = trail.getContext('2d');

        var finishSounds = [audio.finish01,audio.finish02,audio.finish03];
        var jumpSounds = [audio.jump01,audio.jump02,audio.jump03,audio.jump04];

        // Gravity.
        // g.gravity = (function() {
        //  var me = {
        //      enabled: true,
        //      enable: enable,
        //      disable: disable,
        //      toggle: toggle
        //  };
        //  function enable() { me.enabled = true; }
        //  function disable() { me.enabled = false; }
        //  function toggle() { if (me.enabled) disable(); else enable(); }
        //  function update(dt,next) {
        //      g.objects.lists.particle.each(function(p) {
        //          if (me.enabled) {
        //              p.velocity.y += 200*dt;
        //          }
        //      });
        //      next(dt);
        //  }
        //  g.chains.update.push(update);
        //  return me;
        // })();
        // Auto-refresh
        // (function() {
        //  var timeout = setTimeout(function() {
        //      document.location.reload(true);
        //  }, 3000);
        //  g.once('keydown',function() {
        //      disable();
        //  });
        //  g.once('mousemove',function() {
        //      disable();
        //  });
        //  g.chains.draw.unshift(draw);
        //  function draw(g,next) {
        //      // console.log(game.chains.draw.slice(0));
        //      g.fillStyle('#ff0000');
        //      g.fillCircle(game.width,0,30);
        //      g.fillStyle('black');
        //      next(g);
        //  }
        //  function disable() {
        //      clearTimeout(timeout);
        //      g.chains.draw.remove(draw);
        //  }
        // })();
        // Camera
        // (function() {
        //     game.camera = new Vector(0, 0);
        //     game.camera.zoom = 1;
        //     game.camera.PTM = 32;
        //     game.camera.screenToWorld = function(screenV, out) {
        //         var ptm = getPixelsPerMeter();
        //         out.x = screenV.x / ptm + game.camera.x;
        //         out.y = -(screenV.y / ptm - game.camera.y);
        //     };
        //     game.camera.worldToScreen = function(worldV, out) {
        //         var ptm = getPixelsPerMeter();
        //         out.x = (worldV.x - game.camera.x) * ptm;
        //         out.y = (worldV.y - game.camera.y) * ptm * -1;
        //     };
        //     game.camera.getPixelsPerMeter = getPixelsPerMeter;

        //     function getPixelsPerMeter() {
        //         return game.camera.PTM / game.camera.zoom;
        //     }
        //     game.camera.reset = function() {
        //         var ptm = getPixelsPerMeter();
        //         var targetx = player.position.x - (game.width * 0.5) / ptm;
        //         var targety = player.position.y + (game.height * 0.5) / ptm;
        //         targetx += player.velocity.x * 10;
        //         targety += player.velocity.y * 10;
        //         game.camera.x = targetx;
        //         game.camera.y = targety;
        //     };
        //     var pattern;

        //     function drawCamera(g, next) {
        //         var ptm = getPixelsPerMeter();
        //         // if (!pattern) {
        //         //   pattern = g.context.createPattern(images.background,'repeat');
        //         // }
        //         // Follow player
        //         var targetx = player.position.x - (game.width * 0.5) / ptm;
        //         var targety = player.position.y + (game.height * 0.5) / ptm;
        //         // Look forward
        //         // targetx += player.velocity.x * 10;
        //         // targety += player.velocity.y * 10;
        //         // Smooth
        //         // game.camera.x = 0.8 * game.camera.x + 0.2 * targetx;
        //         // game.camera.y = 0.8 * game.camera.y + 0.2 * targety;
        //         // No smoothing
        //         game.camera.x = targetx;
        //         game.camera.y = targety;
        //         // g.save();
        //         // g.context.translate(-x*ptm,y*ptm);
        //         // g.fillStyle(pattern);
        //         // g.fillRectangle(x*ptm,-y*ptm,game.width,game.height);
        //         // g.restore();
        //         g.save();
        //         g.context.scale(ptm, -ptm);
        //         g.context.lineWidth /= ptm;
        //         g.context.translate(-game.camera.x, -game.camera.y);
        //         next(g);
        //         g.restore();
        //     }
        //     g.chains.draw.camera = drawCamera;
        //     g.chains.draw.insertBefore(drawCamera, g.chains.draw.objects);
        // })();

        // Draw background
        // (function() {
        //     var topLeft = new Vector(0,0);
        //     var bottomRight = new Vector(0,0);
        //     game.chains.draw.insertAfter(function(g,next) {
        //         var pixelSize = 1;
        //         var worldSize = pixelSize * game.camera.PTM;
        //         t.set(0,0);
        //         game.camera.screenToWorld(t,topLeft);
        //         t.set(game.width,game.height);
        //         game.camera.screenToWorld(t,bottomRight);
        //         topLeft.x = Math.floor(topLeft.x / worldSize) * worldSize;
        //         topLeft.y = Math.floor(topLeft.y / worldSize) * worldSize;
        //         bottomRight.x = Math.floor(bottomRight.x / worldSize + 1) * worldSize;
        //         bottomRight.y = Math.floor(bottomRight.y / worldSize - 1) * worldSize;
        //         for(var x = topLeft.x; x <= bottomRight.x; x += worldSize) {
        //         for(var y = topLeft.y; y >= bottomRight.y; y -= worldSize) {
        //             g.drawImage(images.background,x,y,worldSize,worldSize);
        //         }}
        //         next(g);

        //     },game.chains.draw.camera);
        // })

        // Collision
        var handleCollision = (function() {
            var t = new Vector(0, 0)
            var t2 = new Vector(0, 0);

            return function handleCollision(chunks) {
                chunks.forEach(function(chunk) {
                    chunk.objects.lists.collide.each(function(o) {
                        if (!o.velocity) {
                            return;
                        }
                        o.surface = null;
                        var iterations = 5;
                        while (iterations-- > 0) {
                            var collisions = [];

                            function handleCollisionLineSegments(lineSegments) {
                                for (var i = 0; i < lineSegments.length; i++) {
                                    var lineSegment = lineSegments[i];
                                    t.setV(lineSegment.normal);
                                    t.normalRight();
                                    var l = lineSegment.start.distanceToV(lineSegment.end);
                                    t2.setV(o.position);
                                    t2.substractV(lineSegment.start);
                                    var offY = lineSegment.normal.dotV(t2) - o.collisionRadius;
                                    var offX = t.dotV(t2);
                                    if (offY < -o.collisionRadius * 2) {
                                        continue;
                                    } else if (offY < 0) {
                                        if (offX > 0 && offX < l) {
                                            offY *= -1;
                                            collisions.push({
                                                x: lineSegment.start.x + t.x * offX,
                                                y: lineSegment.start.y + t.y * offX,
                                                normalx: lineSegment.normal.x,
                                                normaly: lineSegment.normal.y,
                                                offset: offY
                                            });
                                        } else if (offX < 0 && offX > -o.collisionRadius) {
                                            var d = o.position.distanceToV(lineSegment.start);
                                            if (d < o.collisionRadius) {
                                                t.setV(o.position);
                                                t.substractV(lineSegment.start);
                                                t.normalize();
                                                collisions.push({
                                                    x: lineSegment.start.x,
                                                    y: lineSegment.start.y,
                                                    normalx: t.x,
                                                    normaly: t.y,
                                                    offset: o.collisionRadius - d
                                                });
                                            }
                                        } else if (offX > l && offX < l + o.collisionRadius) {
                                            var d = o.position.distanceToV(lineSegment.end);
                                            if (d < o.collisionRadius) {
                                                t.setV(o.position);
                                                t.substractV(lineSegment.end);
                                                t.normalize();
                                                collisions.push({
                                                    x: lineSegment.end.x,
                                                    y: lineSegment.end.y,
                                                    normalx: t.x,
                                                    normaly: t.y,
                                                    offset: o.collisionRadius - d
                                                });
                                            }
                                        }
                                    } else {
                                        continue;
                                    }
                                }
                            }
                            chunks.forEach(function(chunk) {
                                chunk.objects.lists.collidable.each(function(collidable) {
                                    handleCollisionLineSegments(collidable.collisionlines);
                                });
                            });
                            if (collisions.length > 0) {
                                // console.log(collisions.map(function(c) { return c.offset; }));
                                collisions.sort(function(a, b) {
                                    return b.offset - a.offset;
                                });
                                var c = collisions[0];
                                o.position.add(c.normalx * c.offset, c.normaly * c.offset);
                                var vc = o.velocity.dot(c.normalx, c.normaly);
                                o.velocity.substract(c.normalx * vc, c.normaly * vc);
                                o.surface = c;
                                if (o.collided) {
                                    o.collided(c);
                                }
                            } else {
                                break;
                            }
                        }
                        if (iterations === 0) {
                            console.error('Collision broken');
                        }
                    });
                });
            }
        }());
        // Tracing
        (function() {
            var t = new Vector(0, 0);

            function IsOnSegment(xi, yi, xj, yj, xk, yk) {
                return (xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) && (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj);
            }

            function ComputeDirection(xi, yi, xj, yj, xk, yk) {
                var a = (xk - xi) * (yj - yi);
                var b = (xj - xi) * (yk - yi);
                return a < b ? -1 : a > b ? 1 : 0;
            }
            // From: http://ptspts.blogspot.nl/2010/06/how-to-determine-if-two-line-segments.html
            function DoLineSegmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
                var d1 = ComputeDirection(x3, y3, x4, y4, x1, y1);
                var d2 = ComputeDirection(x3, y3, x4, y4, x2, y2);
                var d3 = ComputeDirection(x1, y1, x2, y2, x3, y3);
                var d4 = ComputeDirection(x1, y1, x2, y2, x4, y4);
                return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) || (d1 == 0 && IsOnSegment(x3, y3, x4, y4, x1, y1)) || (d2 == 0 && IsOnSegment(x3, y3, x4, y4, x2, y2)) || (d3 == 0 && IsOnSegment(x1, y1, x2, y2, x3, y3)) || (d4 == 0 && IsOnSegment(x1, y1, x2, y2, x4, y4));
            }
            // From: http://www.ahristov.com/tutorial/geometry-games/intersection-lines.html
            function intersection(x1, y1, x2, y2, x3, y3, x4, y4, result) {
                var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                if (d == 0) return false;
                var xi = ((x3 - x4) * (x1 * y2 - y1 * x2) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d;
                var yi = ((y3 - y4) * (x1 * y2 - y1 * x2) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d;
                result.set(xi, yi);
                return true;
            }
            g.cantrace = function(fromx, fromy, tox, toy) {
                var result = true;
                game.objects.lists.collidable.each(function(collidable, BREAK) {
                    for (var i = 0; i < collidable.collisionlines.length; i++) {
                        var cl = collidable.collisionlines[i];
                        var fd = cl.normal.dot(fromx - tox, fromy - toy);
                        // Is collision in right direction (toward fromxy)
                        if (fd < 0) {
                            continue;
                        }
                        // Are line-segments intersecting?
                        if (!DoLineSegmentsIntersect(fromx, fromy, tox, toy, cl.start.x, cl.start.y, cl.end.x, cl.end.y)) {
                            continue;
                        }
                        result = false;
                        return BREAK;
                    }
                });
                return result;
            };
            g.trace = function(fromx, fromy, tox, toy) {
                var c = null;
                game.objects.lists.collidable.each(function(collidable) {
                    for (var i = 0; i < collidable.collisionlines.length; i++) {
                        var fd = cl.normal.dot(fromx - tox, fromy - toy);
                        // Is collision in right direction (toward fromxy)
                        if (fd < 0) {
                            return;
                        }
                        // Are line-segments intersecting?
                        if (!DoLineSegmentsIntersect(fromx, fromy, tox, toy, cl.start.x, cl.start.y, cl.end.x, cl.end.y)) {
                            return;
                        }
                        // Get intersection
                        if (!intersection(fromx, fromy, tox, toy, cl.start.x, cl.start.y, cl.end.x, cl.end.y, t)) {
                            return;
                        }
                        // Determine the closest intersecting collisionline
                        var distance = t.distanceTo(fromx, fromy);
                        if (!c || c.distance > distance) {
                            c = {
                                collidable: collidable,
                                cl: cl,
                                distance: distance,
                                x: t.x,
                                y: t.y
                            };
                        }
                    }
                });
                return c;
            }
        })();
        // Foreground and background
        (function() {
            var game = g;
            game.chains.draw.push(function(g, next) {
                game.objects.lists.background.each(function(o) {
                    o.drawBackground(g);
                });
                game.objects.lists.shadow.each(function(o) {
                    o.drawShadow(g);
                });
                game.objects.lists.foreground.each(function(o) {
                    o.drawForeground(g);
                });
                // game.objects.lists.drawItem.each(function(o) {
                //  o.drawItem(g);
                // });
                next(g);
            });
        })();
        // Touching
        function handleTouch(chunk) {
            chunk.objects.lists.touchable.each(function(ta) {
                chunk.objects.lists.touchable.each(function(tb) {
                    if (ta === tb) { return; }
                    var areTouching = ta.position.distanceToV(tb.position) <= ta.touchRadius + tb.touchRadius;
                    console.log(areTouching);
                    if (ta.touching) {
                        var tbWasTouchingTa = ta.touching.indexOf(tb) !== -1;
                        if (areTouching && !tbWasTouchingTa) {
                            ta.touching.push(tb);
                            if (ta.touch) { ta.touch(tb); }
                        } else if (!areTouching && tbWasTouchingTa) {
                            ta.touching.remove(tb);
                            if (ta.untouch) { ta.untouch(tb); }
                        }
                    }
                    if (tb.touching) {
                        var taWasTouchingTb = tb.touching.indexOf(ta) !== -1;
                        if (areTouching && !taWasTouchingTb) {
                            tb.touching.push(ta);
                            if (tb.touch) { tb.touch(ta); }
                        } else if (!areTouching && taWasTouchingTb) {
                            tb.touching.remove(ta);
                            if (tb.untouch) { tb.untouch(ta); }
                        }
                    }
                });
            });
        }

        function getAngle(v) {
            return Math.atan2(v.y,v.x);
        }
        function getAngleFrom(from,v) {
            return Math.atan2(v.y-from.y,v.x-from.x);
        }
        function getVectorFromAngle(angle,v) {
            v.set(
                Math.cos(angle),
                Math.sin(angle)
            );
        }
        function getVectorFromAngleRadius(angle,radius,v) {
            getVectorFromAngle(angle,v);
            v.multiply(radius);
        }
        function getPositionFromAngleRadius(angle,radius,position,v) {
            getVectorFromAngleRadius(angle,radius,v);
            v.addV(position);
        }

        //#gameobjects
        function circleFiller(r) {
            return function(g) {
                g.fillCircle(this.position.x, this.position.y, r);
            };
        }

        function slide(a, b) {
            return (a ? 0 : 1) - (b ? 0 : 1);
        }
        // var zoomLevel = 0.1;
        // var zoomLevelTarget = 0.1;
        // g.on('mousewheel', function(delta) {
        //     delta = (delta > 0 ? 1 : -1);
        //     zoomLevelTarget = Math.max(0, zoomLevelTarget + delta);
        // });
        // g.chains.update.push(function(dt, next) {
        //     var zooming = (g.keys.z ? 1 : 0) - (g.keys.a ? 1 : 0);
        //     zoomLevelTarget = Math.max(0,zoomLevelTarget + zooming * 0.2);
        //     zoomLevel = zoomLevelTarget * 0.1 + zoomLevel * 0.9;
        //     g.camera.zoom = Math.pow(zoomLevel + 10, 2) / 100;
        //     next(dt);
        // });

        // Player
        function Player() {
            this.position = new Vector(0, 0);
            this.velocity = new Vector(0, 0);
            this.touchRadius = this.collisionRadius = 1;
            this.sticktime = 0;
            this.touching = [];
            this.checkpoints = [];
            this.t = 0;
            this.bump = new Vector(0,0);
            this.bumpTime = 0;
        }
        (function(p) {
            p.updatable = true;
            p.drawable = true;
            p.collide = true;
            p.touchable = true;
            p.update = function(dt) {
                var me = this;

                // if (this.surface) {
                //     this.t -= dt;
                //     if (this.t < 0) {
                //         this.chunk.objects.add(new Pebble(this.surface.x,this.surface.y));
                //         this.t = 0.1;
                //     }
                // }

                var playerChunk = this.chunk;
                var playerPosition = this.position;
                getChunks(playerChunk.x-4,playerChunk.y-4,9,9).forEach(function(chunk) {
                    var chunkx = (chunk.x+0.5)*Chunk.width;
                    var chunky = (chunk.y+0.5)*Chunk.height;
                    var dx = (chunkx - playerPosition.x);
                    var dy = (chunky - playerPosition.y);
                    var l = Math.sqrt(dx*dx + dy*dy);
                    var v = Math.max(0,Math.min(128, 128 - l)) / 128;
                    chunk.visibility += dt*v;
                });

                if (this.surface) {
                    this.sticktime = 0.05;
                    this.sticksurface = this.surface;
                } else if (this.sticktime <= 0) {
                    this.sticktime = 0;
                    this.sticksurface = null;
                } else {
                    this.sticktime -= dt;
                }

                // this.velocity.x *= 0.99;
                var onground = this.sticksurface && this.sticksurface.normaly < 0;
                var friction = onground ? 0.5 : 0.98;
                var control = onground ? 0.3 : 0.02;
                this.velocity.x = this.velocity.x * friction
                                + slide(g.keys.left||g.keys.a||g.keys.q,g.keys.right||g.keys.d) * control;
                this.velocity.y += 0.02;

                var speed = Math.min(0.8,this.velocity.length());
                this.velocity.normalize();
                this.velocity.multiply(speed);

                this.position.add(
                    this.velocity.x,
                    this.velocity.y
                );
            };
            p.draw = function(g) {
                var me = this;
                // g.fillStyle(this.velocity.length() >= 0.8 ? 'red' : 'blue');
                g.fillStyle('hsl('+Math.floor(((game.time*50)%360))+', 76%, 53%)')
                g.context.save();
                g.context.shadowColor = 'white';
                g.context.shadowBlur = 5 + (Math.cos(game.time*5)+1)*0.5 * 10;
                g.context.translate(this.position.x,this.position.y);
                g.fillCircle(0,0,1);
                g.context.restore();
            };
            p.touch = function(other) {
                var me = this;

            };
            p.jump = function() {
                var me = this;
                if (this.sticksurface && this.sticksurface.normaly <= 0) {
                    pick(jumpSounds).play();
                    this.velocity.y += this.sticksurface.normaly * 0.4 - 0.3;
                    this.velocity.x += this.sticksurface.normalx * 0.7;
                }
            };
        })(Player.prototype);

        function Pebble(x,y) {
            this.position = new Vector(x, y-0.5);
            this.touchRadius = 0.5;
            this.touching = [];
            console.log('pebble');
        }
        (function(p) {
            p.touchable = true;
            p.drawable = true;
            p.draw = function(g) {
                var me = this;
                var time = game.time - this.active;
                var wiggle = (Math.sin(game.time + this.position.x*5) + 1) * 0.5;
                var angle = wiggle * 1 - 0.5;
                g.fillStyle('blue');
                g.fillCircle(
                    this.position.x+Math.sin(angle)*this.touchRadius,
                    this.position.y-Math.cos(angle)*this.touchRadius+0.5,
                    this.touchRadius);
            };
        })(Pebble.prototype);

        function Checkpoint(chunk,x,y) {
            this.chunk = chunk;
            this.position = new Vector(x, y-0.5);
            this.touchRadius = 0.5;
            this.touching = [];
            this.active = null;
        }
        (function(p) {
            p.touchable = true;
            p.drawable = true;
            p.touch = function(other) {
                console.log('touch',other);
                if (this.active) { return; }
                if (other !== player) { return; }
                audio.checkpoint.play();
                player.checkpoints.push(this);
                this.active = game.time;
            };
            p.draw = function(g) {
                var me = this;
                var time = game.time - this.active;
                var radius = this.active
                    ? (1 + (Math.easeOutQuad((Math.min(1,time/2))) * 3)) * this.touchRadius
                    : this.touchRadius;
                var wiggle = (Math.sin(game.time*2 + this.position.x*5) + 1) * 0.5;
                var angle = wiggle * 0.5 - 0.25;
                g.fillStyle('#32cd32');
                g.context.shadowBlur = 30;
                g.context.shadowColor = '#32cd32';
                g.fillCircle(
                    this.position.x+Math.sin(angle)*radius,
                    this.position.y-Math.cos(angle)*radius+0.5,
                    radius);
                g.context.shadowBlur = 0;
            };
        })(Checkpoint.prototype);

        function StaticText(x,y,text,font) {
            this.position = new Vector(x,y);
            this.font = font || 'bold 2px Courier New';
            this.text = text;
        }
        StaticText.prototype['drawable'] = true;
        StaticText.prototype.draw = function(g) {
            g.context.fillStyle = 'white';
            g.context.font = this.font;
            g.fillCenteredText(this.text,this.position.x,this.position.y);
        };

        function Chunk(x,y,sides) {
            this.objects = new ObjectManager();
            this.objects.lists.update = this.objects.createIndexList('updatable');
            this.objects.lists.draw = this.objects.createIndexList('drawable');
            this.objects.lists.collidable = this.objects.createIndexList('collidable');
            this.objects.lists.collide = this.objects.createIndexList('collide');
            this.objects.lists.touchable = this.objects.createIndexList('touchable');

            this.x = x;
            this.y = y;
            this.left = x*Chunk.width;
            this.top = y*Chunk.height;
            this.right = this.left+Chunk.width;
            this.bottom = this.top+Chunk.height;
            this.sides = sides;
            this.visibility = 0.1;
            createSides(this);
        }
        Chunk.width = 32;
        Chunk.height = 18;
        (function(p) {
            p.inside = function(x,y) {
                return x >= this.left && x < this.right
                    && y >= this.bottom && y < this.top;
            };
            p.draw = function(g) {
                g.context.globalAlpha = this.visibility;
                this.objects.lists.draw.each(function(o) {
                    o.draw(g);
                });
                g.context.globalAlpha = 1;
                // if (this.sides.jump) {
                //     g.strokeStyle('red');
                //     g.strokeRectangle(this.left,this.top,Chunk.width,Chunk.height);
                // }
            };
            p.update = function(dt) {
                this.objects.lists.update.each(function(o) {
                    o.update(dt);
                });
                handleTouch(this);
                this.objects.handlePending();
            };
        })(Chunk.prototype);

        function Rectangle(x,y,w,h) {
            return new StaticCollidable([
                new Vector(x,y),
                new Vector(x+w,y),
                new Vector(x+w,y+h),
                new Vector(x,y+h)
            ]);
        }
        function Trapezoid(x,y,wt,h,wb) {
            return new StaticCollidable([
                new Vector(x,y),
                new Vector(x+wt,y),
                new Vector(x+wb,y+h),
                new Vector(x-(wb-wt),y+h)
            ]);
        }

        var largeHoleSize = 7;
        var smallHoleSize = 4;

        function createSides(chunk) {
            var sides = chunk.sides;
            switch(sides.top) {
                case SideType.OPEN: break;
                case SideType.CLOSED:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top,
                        Chunk.width, 1));
                    break;
                case SideType.SINGLEHOLE:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top,
                        Chunk.width*0.5-largeHoleSize*0.5, 1));
                    chunk.objects.add(Rectangle(
                        chunk.left+Chunk.width*0.5+largeHoleSize*0.5, chunk.top,
                        Chunk.width*0.5-largeHoleSize*0.5, 1));
                    break;
            }
            
            switch(sides.bottom) {
                case SideType.OPEN: break;
                case SideType.CLOSED:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top+Chunk.height-1,
                        Chunk.width, 1));
                    break;
                case SideType.SINGLEHOLE:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top+Chunk.height-1,
                        Chunk.width*0.5-largeHoleSize*0.5, 1));
                    chunk.objects.add(Rectangle(
                        chunk.left+Chunk.width*0.5+largeHoleSize*0.5, chunk.top+Chunk.height-1,
                        Chunk.width*0.5-largeHoleSize*0.5, 1));
                    break;
            }

            switch(sides.left) {
                case SideType.OPEN: break;
                case SideType.CLOSED:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top,
                        1, Chunk.height));
                    break;
                case SideType.SINGLEHOLE:
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top,
                        1, Chunk.height*0.5-largeHoleSize*0.5));
                    chunk.objects.add(Rectangle(
                        chunk.left, chunk.top+Chunk.height*0.5+largeHoleSize*0.5,
                        1, Chunk.height*0.5-largeHoleSize*0.5));
                    break;
            }

            switch(sides.right) {
                case SideType.OPEN: break;
                case SideType.CLOSED:
                    chunk.objects.add(Rectangle(
                        chunk.left+Chunk.width-1, chunk.top,
                        1, Chunk.height));
                    break;
                case SideType.SINGLEHOLE:
                    chunk.objects.add(Rectangle(
                        chunk.left+Chunk.width-1, chunk.top,
                        1, Chunk.height*0.5-largeHoleSize*0.5));
                    chunk.objects.add(Rectangle(
                        chunk.left+Chunk.width-1, chunk.top+Chunk.height*0.5+largeHoleSize*0.5,
                        1, Chunk.height*0.5-largeHoleSize*0.5));
                    break;
            }
        }

        var SideType = {
            OPEN: 1,
            CLOSED: 2,
            SINGLEHOLE: 4
        };
        var sideTypes = Object.values(SideType);
        var nonClosedSideTypes = sideTypes.filter(function(side) { return side !== SideType.CLOSED; });
        var checkpointChunkType = null;
        var chunksTypes = [
            { // Empty
                weight: 10,
                top: sideTypes,
                bottom: sideTypes,
                left: sideTypes,
                right: sideTypes,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    return chunk;
                }
            },
            { // -_-
                weight: 1,
                top: [SideType.CLOSED,SideType.OPEN],
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                jump: true,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(1/4), y*Chunk.height+Chunk.height*(3/4),
                        Chunk.width*(2/4), Chunk.height*(1/4)
                    ));
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(0/4), y*Chunk.height+Chunk.height*(1/4),
                        Chunk.width*(1/4), Chunk.height*(1/4)
                    ));
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(3/4), y*Chunk.height+Chunk.height*(1/4),
                        Chunk.width*(1/4), Chunk.height*(1/4)
                    ));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)],
                        // [x*Chunk.width+Chunk.width*(1/8),y*Chunk.height+Chunk.height*(1/3)],
                        // [x*Chunk.width+Chunk.width*(7/8),y*Chunk.height+Chunk.height*(1/3)]
                    ];
                    return chunk;
                }
            },
            { // _-_
                weight: 1,
                top: sideTypes,
                bottom: sideTypes,
                left: sideTypes,
                right: sideTypes,
                jump: true,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(1/4), y*Chunk.height+Chunk.height*(1/4),
                        Chunk.width*(2/4), Chunk.height*(1/4)
                    ));
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(1/8), y*Chunk.height+Chunk.height*(3/4),
                        Chunk.width*(1/4), Chunk.height*(1/4)
                    ));
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(5/8), y*Chunk.height+Chunk.height*(3/4),
                        Chunk.width*(1/4), Chunk.height*(1/4)
                    ));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(1/3)],
                        // [x*Chunk.width+Chunk.width*(1/8),y*Chunk.height+Chunk.height*(2/3)],
                        // [x*Chunk.width+Chunk.width*(7/8),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // stairs
                weight: 1,
                top: sideTypes,
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                jump: true,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    var h = 4;
                    var w = 4;
                    for(var i=1;i<4;i++) {
                        var ii = 4-i;
                        chunk.objects.add(Rectangle(
                            x*Chunk.width+Chunk.width*0.5-w*i, y*Chunk.height+Chunk.height-h*(ii)-1,
                            w*i*2, h
                        ));
                    }
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(1/3)],
                        // [x*Chunk.width+Chunk.width*(1/8),y*Chunk.height+Chunk.height*(2/3)],
                        // [x*Chunk.width+Chunk.width*(7/8),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // platform
                weight: 1,
                top: sideTypes,
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                jump: true,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    var h = Chunk.height*(1/6);
                    var w = Chunk.width*(1/8);
                    for(var i=1;i<3;i++) {
                        chunk.objects.add(Rectangle(
                            x*Chunk.width+Chunk.width*0.5-w*i, y*Chunk.height+Chunk.height-h*(i+1)-1,
                            w*i*2, h
                        ));
                    }
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(1/3)],
                        // [x*Chunk.width+Chunk.width*(1/8),y*Chunk.height+Chunk.height*(2/3)],
                        // [x*Chunk.width+Chunk.width*(7/8),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            checkpointChunkType = { // checkpoint table
                weight: 1,
                top: sideTypes,
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    chunk.objects.add(Rectangle(
                        x*Chunk.width+Chunk.width*(3/8), y*Chunk.height+Chunk.height*(2/3),
                        Chunk.width*(2/8), Chunk.height*(1/3)
                    ));
                    chunk.objects.add(new Checkpoint(
                        chunk,
                        x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)
                    ));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // bump
                weight: 1,
                top: sideTypes,
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    chunk.objects.add(Trapezoid(
                        x*Chunk.width+Chunk.width*(1/4), y*Chunk.height+Chunk.height*(2/3),
                        Chunk.width*(2/4), Chunk.height*(1/3), Chunk.width*(3/4)
                    ));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // bump up right
                weight: 10,
                top: [SideType.OPEN],
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: [SideType.CLOSED],
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    var vx1 = x*Chunk.width + Chunk.width * (1/4);
                    var vx2 = x*Chunk.width + Chunk.width * (3/4);
                    var vx3 = x*Chunk.width + Chunk.width * (4/4);
                    var vy1 = y*Chunk.height + Chunk.height * (2/4);
                    var vy2 = y*Chunk.height + Chunk.height * (4/4);
                    chunk.objects.add(new StaticCollidable([
                        new Vector(vx1,vy2),
                        new Vector(vx2,vy1),
                        new Vector(vx3,vy1),
                        new Vector(vx3,vy2),
                    ]));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // bump up left
                weight: 10,
                top: [SideType.OPEN],
                bottom: [SideType.CLOSED],
                left: [SideType.CLOSED],
                right: sideTypes,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    var vx1 = x*Chunk.width + Chunk.width * (3/4);
                    var vx2 = x*Chunk.width + Chunk.width * (1/4);
                    var vx3 = x*Chunk.width + Chunk.width * (0/4);
                    var vy1 = y*Chunk.height + Chunk.height * (2/4);
                    var vy2 = y*Chunk.height + Chunk.height * (4/4);
                    chunk.objects.add(new StaticCollidable([
                        new Vector(vx1,vy2),
                        new Vector(vx3,vy2),
                        new Vector(vx3,vy1),
                        new Vector(vx2,vy1),
                    ]));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            },
            { // stairs updown
                weight: 1,
                top: sideTypes,
                bottom: [SideType.CLOSED],
                left: sideTypes,
                right: sideTypes,
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    chunk.objects.add(Rectangle(

                    ));
                    chunk.placeholders = [
                        // [x*Chunk.width+Chunk.width*(2/4),y*Chunk.height+Chunk.height*(2/3)]
                    ];
                    return chunk;
                }
            }
        ];

        function createTextChunkType(text) {
            var lines = text.split('\n');
            return {
                create: function(x,y,sides) {
                    var chunk = new Chunk(x,y,sides);
                    for(var i=0;i<lines.length;i++) {
                        chunk.objects.add(new StaticText(
                            x*Chunk.width+Chunk.width*(1/2),
                            y*Chunk.height+Chunk.height*(4/8)+1+i*2,
                            lines[i] || ''
                        ));
                    }
                    return chunk;
                }
            };
        }

        var startChunkTypes = [
            createTextChunkType('Use\nWASD keys\nto move >>'),
            createTextChunkType('Use\nSPACE\nto jump'),
            {   create: function(x,y,sides) {
                    var chunk = checkpointChunkType.create(x,y,sides);
                    chunk.objects.add(new StaticText(
                        x*Chunk.width+Chunk.width*(1/2),
                        y*Chunk.height+Chunk.height*(3/8),
                        'This is'
                    ));
                    chunk.objects.add(new StaticText(
                        x*Chunk.width+Chunk.width*(1/2),
                        y*Chunk.height+Chunk.height*(4/8),
                        'a checkpoint'
                    ));
                    return chunk;
                }
            },
            createTextChunkType('Use\nR to go to\nthe closest\n\n\n\ncheckpoint'),
            createTextChunkType('Use\nthe mouse\nto drag\n\n\n\nthis magnifier'),
            createTextChunkType('Scroll\nto zoom\nmagnifier'),
            createTextChunkType('Drag + Scroll\nto resize\nmagnifier'),
            createTextChunkType('Drag on map\nto view areas'),
            createTextChunkType('Drag + R\nto go to\ncheckpoint in view'),
            createTextChunkType(''),
            createTextChunkType('Try to get to the star\nin the bottom right.'),
            createTextChunkType('Have fun'),

        ];
        var endChunkType = {
            create: function(x,y,sides) {
                var chunk = new Chunk(x,y,sides);
                chunk.end = true;
                chunk.objects.add(new Finish(
                    Chunk.width*x+Chunk.width*0.5,
                    Chunk.height*y+Chunk.height*0.5
                ));
                return chunk;
            }
        };

        function Finish(x,y) {
            this.position = new Vector(x,y);
            this.touchRadius = 4;
            this.touching = [];
        }
        function star(ctx, x, y, r, p, m)
        {
            ctx.save();
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(0,0-r);
            for (var i = 0; i < p; i++)
            {
                ctx.rotate(Math.PI / p);
                ctx.lineTo(0, 0 - (r*m));
                ctx.rotate(Math.PI / p);
                ctx.lineTo(0, 0 - r);
            }
            ctx.fill();
            ctx.restore();
        }
        (function(p) {
            p.drawable = true;
            p.touchable = true;
            p.draw = function(g) {
                g.fillStyle('yellow');
                star(g.context,this.position.x,this.position.y,8,5,0.5);
                if (!this.finish) {
                    return;
                }
                var time = game.time - this.finish;
                var s = Math.min(5,time)/5;
                g.context.globalAlpha = s;
                g.fillStyle('white');
                g.context.font = 'bold 2px Courier New';
                g.context.shadowBlur = 10;
                g.context.shadowColor = 'black';
                g.fillCenteredText('Thanks for playing!',this.position.x,this.position.y+5);
                g.context.shadowBlur = 0;
                g.context.globalAlpha = 1;
            };
            p.touch = function(o) {
                if (o === player) {
                    this.finish = game.time;
                    startFinish(getChunk(chunks.width-1,chunks.height-1));
                    audio.finish.play();
                }
            };
        })(Finish.prototype);

        function startFinish(chunk) {
            var key = { count: 0 };
            finish(chunk,key);
            var sound = 0;
            var interval = setInterval(function() {
                if (key.count === 0) {
                    clearInterval(interval);
                    return;
                }
                finishSounds[(sound++) % finishSounds.length].play();
            },100);
        }

        function reveal(chunk,color) {
            chunk.objects.lists.collidable.each(function(o) {
                o.color = 'hsl('+color+', 76%, 53%)';
            });
            chunk.visibility += 0.2;
            chunk.draw(new Graphics(backgroundContext));

            if (chunk.visibility > 1) {
                return;
            }
            setTimeout(function() {
                reveal(chunk,color);
            },100)
        }

        function finish(chunk,key,color) {
            color = color == null ? ((game.time*360) % 360) : color;
            if (!chunk || chunk.finish === key) {
                return;
            }
            console.log('finish',key);
            chunk.finish = key;
            reveal(chunk,color);

            key.count++;
            setTimeout(function() {
                var nextColor = (color+5) % 360;
                if (chunk.sides.top !== SideType.CLOSED) {
                    finish(getChunk(chunk.x,chunk.y-1),key,nextColor);
                }
                if (chunk.sides.bottom !== SideType.CLOSED) {
                    finish(getChunk(chunk.x,chunk.y+1),key,nextColor);
                }
                if (chunk.sides.left !== SideType.CLOSED) {
                    finish(getChunk(chunk.x-1,chunk.y),key,nextColor);
                }
                if (chunk.sides.right !== SideType.CLOSED) {
                    finish(getChunk(chunk.x+1,chunk.y),key,nextColor);
                }
                key.count--;
            },100);
        }

        var chunks = [];

        function generateMaze(w,h) {
            var cells = [];
            for(var y=0;y<h;y++)
            for(var x=0;x<w;x++) {
                cells.push({
                    x: x,
                    y: y,
                    bottom: false,
                    right: false,
                    marked: false,
                    jump: false
                });
            }

            getCell(0,0).marked = true;


            function getCell(x,y) {
                if (x < 0 || y < 0 || x >= w || y >= h) { return; }
                return cells[x+y*w];
            }

            function pickNeighbor(cell) {
                return pickWeighted([
                    [11,[getCell(cell.x-1,cell.y),'left']],
                    [11,[getCell(cell.x+1,cell.y),'right']],
                    [1,[getCell(cell.x,cell.y-1),'top']],
                    [4,[getCell(cell.x,cell.y+1),'bottom']]
                ].filter(function(pair) {
                    return pair[1][0];
                }).filter(function(pair) {
                    return !pair[1][0].marked;
                }));
            }

            function stepMaze(cell) {
                cell.marked = true;
                var neighborTuple = pickNeighbor(cell);
                while(neighborTuple) {
                    var neighbor = neighborTuple[0];
                    ({
                        left: function() { neighbor.right = true; },
                        right: function() { cell.right = true; },
                        top: function() { neighbor.bottom = true; cell.jump = true; },
                        bottom: function() { cell.bottom = true; }
                    }[neighborTuple[1]])();
                    stepMaze(neighbor);
                    neighborTuple = pickNeighbor(cell);
                }
            }

            for(var x=0;x<startChunkTypes.length;x++) {
                cells[x].right = true;
                cells[x].marked = true;
            }

            stepMaze(getCell(startChunkTypes.length,0));
            return cells;
        }

        function pick(arr) {
            return arr[Math.floor(Math.random()*arr.length)];
        }

        function pickWeighted(arr) {
            if (arr.length === 0) { return null; }
            var totalWeight = arr.reduce(function(total,pair) {
                return total + pair[0];
            },0);
            var randomWeight = totalWeight * Math.random();
            var last = null;
            for(var i=0;i<arr.length;i++) {
                var pair = arr[i];
                if (pair[0] > 0) {
                    randomWeight -= pair[0];
                    if (randomWeight < 0) {
                        return pair[1];
                    }
                    last = pair;
                }
            }
            return last[1];
        }

        function weight(weight,v) {
            return [weight,v];
        }

        function initializeChunks() {
            var x,y;
            chunks.width = game.width / Chunk.width;
            chunks.height = game.height / Chunk.height;


            var maze = generateMaze(chunks.width,chunks.height);
            for(y=0;y<chunks.height;y++)
            for(x=0;x<chunks.width;x++) {
                var mazeCell = maze[x+y*chunks.width];

                var sides = {};
                sides.top = y === 0
                    ? SideType.CLOSED
                    : getChunk(x,y-1).sides.bottom;
                sides.left = x === 0
                    ? SideType.CLOSED
                    : getChunk(x-1,y).sides.right;
                sides.right = x === chunks.width-1
                    ? SideType.CLOSED
                    : mazeCell.right
                    ? pickWeighted([
                        weight(0,SideType.CLOSED),
                        weight(0,SideType.SINGLEHOLE),
                        weight(1,SideType.OPEN)
                        ])
                    : pickWeighted([
                        weight(1,SideType.CLOSED),
                        weight(0,SideType.SINGLEHOLE),
                        weight(0,SideType.OPEN)
                        ]);
                sides.bottom = y === chunks.height-1
                    ? SideType.CLOSED
                    : mazeCell.bottom
                    ? pickWeighted([
                        weight(0,SideType.CLOSED),
                        weight(0,SideType.SINGLEHOLE),
                        weight(1,SideType.OPEN)
                        ])
                    : pickWeighted([
                        weight(12,SideType.CLOSED),
                        weight(1,SideType.SINGLEHOLE),
                        weight(0,SideType.OPEN)
                        ]);
                sides.jump = mazeCell.jump;

                var chunkType;
                if (x < startChunkTypes.length && y === 0) {
                    sides.right = SideType.OPEN;
                    sides.bottom = SideType.CLOSED;
                    chunkType = startChunkTypes[x];
                } else if (x === chunks.width-1 && y === chunks.height-1) {
                    chunkType = endChunkType;
                } else {
                    var possibleChunkTypes = chunksTypes.filter(function(type) {
                        return type.top.contains(sides.top)
                            && type.left.contains(sides.left)
                            && type.right.contains(sides.right)
                            && type.bottom.contains(sides.bottom)
                            && (sides.jump ? type.jump : true);
                    }).map(function(chunkType) {
                        return [chunkType.weight,chunkType];
                    });
                    chunkType = pickWeighted(possibleChunkTypes);
                }
                var chunk = chunkType.create(x,y,sides);
                chunks.push(chunk);
                // game.objects.add(chunk);
            }

            game.objects.handlePending();

            // Place items
            (function() {
                var placeholders = [];
                chunks.forEach(function(chunk) {
                    if (!chunk.placeholders) { return; }
                    chunk.placeholders.forEach(function(placeholder) {
                        placeholders.push({
                            chunk: chunk,
                            x: placeholder[0],
                            y: placeholder[1],
                            item: null
                        });
                    });
                });

                // for(var i=0;i<50;i++) {
                //     var placeholder = pick(placeholders);
                //     var item = new Checkpoint(placeholder.x,placeholder.y);
                //     item.chunk = placeholder.chunk;
                //     placeholder.chunk.objects.add(item);
                    
                // }
                // placeholders.forEach(function(placeholder) {
                // });
            })();

            player = new Player();
            player.position.set(Chunk.width/2,Chunk.height/2);
            getChunk(0,0).objects.add(player);
            player.chunk = getChunk(0,0);

            chunks.forEach(function(chunk) {
                chunk.objects.handlePending();
            });
        }
        function getChunk(x,y) {
            if (x >= 0 && y >= 0 &&
                x < chunks.width && y < chunks.height) {
                return chunks[x+y*chunks.width];
            }
        }
        function getChunkAt(x,y) {
            return getChunk(
                Math.floor(x/Chunk.width),
                Math.floor(y/Chunk.height)
            );
        }
        function getChunkAtPlayer() {
            return getChunkAt(
                player.position.x,
                player.position.y
            );
        }
        function getChunks(x,y,w,h) {
            var r = [];
            for(var yi=0;yi<h;yi++)
            for(var xi=0;xi<w;xi++) {
                r.push(getChunk(x+xi,y+yi));
            }
            return r.compact();
        }

        var magnifier = {
            x: Math.floor(game.width / 2),
            y: Math.floor(game.height / 2),
            r: 256,
            targetx: 0,
            targety: 0,
            zoomx: 32,
            zoomy: 32,
            targetzoom: 32,

            dragging: false,
            dragoffsetx: 0,
            dragoffsety: 0
        };

        g.on('mousewheel',function(delta) {
            if (!delta) { return; }
            delta /= Math.abs(delta);
            if (magnifier.dragging) {
                magnifier.r = Math.min(512,Math.max(32,magnifier.r+delta*32));
            } else {
                magnifier.targetzoom = magnifier.targetzoom = Math.min(32, Math.max(8, magnifier.targetzoom - delta));
            }

        });

        g.on('mousedown',function(button) {
            if (button === 0 && Vector.distance(g.mouse.x,g.mouse.y,magnifier.x,magnifier.y) <= magnifier.r) {
                magnifier.dragging = true;
                magnifier.dragoffsetx = magnifier.x - g.mouse.x;
                magnifier.dragoffsety = magnifier.y - g.mouse.y;
            }
        });
        g.on('mouseup',function(button) {
            if (button === 0) {
                magnifier.dragging = false;
            }
        });

        g.chains.draw.unshift(function(g,next) {
            g.context.save();
            // g.context.scale(chunks.width,chunks.height);
            next(g);

            if (magnifier.dragging) {
                magnifier.x = 0.8 * magnifier.x + 0.2 * (game.mouse.x + magnifier.dragoffsetx);
                magnifier.y = 0.8 * magnifier.y + 0.2 * (game.mouse.y + magnifier.dragoffsety);
            }

            if (!magnifier.dragging && game.mouse.buttons[0]) {
                magnifier.targetx = 0.8 * magnifier.targetx + 0.2 * game.mouse.x;
                magnifier.targety = 0.8 * magnifier.targety + 0.2 * game.mouse.y;
            } else {
                magnifier.targetx = 0.8 * magnifier.targetx + 0.2 * (player.position.x + player.velocity.x*5);
                magnifier.targety = 0.8 * magnifier.targety + 0.2 * (player.position.y + player.velocity.y*5);
            }

            magnifier.zoomx = magnifier.zoomy = 0.6 * magnifier.zoomx + 0.4 * magnifier.targetzoom;

            g.context.save();

            g.context.beginPath();
            var t = new Vector();
            t.set(magnifier.targetx,magnifier.targety);
            t.substract(magnifier.x,magnifier.y);
            t.normalize();
            t.normalRight();

            g.context.save();
            g.context.shadowColor = '#555';
            g.context.shadowBlur = 50;
            g.context.shadowOffsetX = 5;
            g.context.shadowOffsetY = 5;
            g.context.globalAlpha = 0.8;
            g.fillCircle(magnifier.x, magnifier.y, magnifier.r);
            g.context.restore();

            g.context.beginPath();
            // g.context.moveTo(magnifier.x+t.x*magnifier.r, magnifier.y+t.y*magnifier.r);
            g.context.arc(magnifier.x, magnifier.y, magnifier.r, t.angle(), t.angle()+Math.PI, false);
            g.context.arc(magnifier.targetx, magnifier.targety, magnifier.r/magnifier.zoomx, t.angle()+Math.PI, t.angle()+2*Math.PI, false);
            g.context.closePath();
            g.context.fillStyle = '#ffffff';
            g.context.globalAlpha = 0.3;
            g.context.fill();

            g.context.beginPath();

            // g.context.moveTo(magnifier.targetx+t.x*magnifier.r/magnifier.zoomx, magnifier.targety+t.y*magnifier.r/magnifier.zoomy);
            g.context.arc(magnifier.targetx, magnifier.targety, magnifier.r/magnifier.zoomx, 0, 2*Math.PI, false);
            g.context.globalAlpha = 0.5+((Math.cos(game.time*10)+1)*0.5)*0.3;
            g.context.strokeStyle = 'white';
            g.context.stroke();

            g.context.globalAlpha = 0.2;
            g.context.fill();

            g.context.globalAlpha = 1;

            g.context.restore();

            g.context.beginPath();
            g.context.arc(magnifier.x, magnifier.y, magnifier.r, 0, 2 * Math.PI, false);
            g.context.clip();

            // Clear background of magnifier
            g.context.fillStyle = 'black';
            g.context.fillRect(magnifier.x-magnifier.r,magnifier.y-magnifier.r,magnifier.r*2,magnifier.r*2);

            g.context.save();

            // Draw contents of magnifier.
            g.context.translate(magnifier.x,magnifier.y);
            g.context.scale(magnifier.zoomx,magnifier.zoomy);
            g.context.translate(-magnifier.targetx,-magnifier.targety);

            var targetChunk = getChunkAt(magnifier.targetx,magnifier.targety);

            if (targetChunk) {
                // var  Math.floor((magnifier.r*magnifier.zoomx) / Chunk.width);
                var backgroundG = new Graphics(backgroundContext);
                // backgroundG.fillStyle('black');
                backgroundG.context.clearRect((targetChunk.x-3)*Chunk.width,(targetChunk.y-3)*Chunk.height,7*Chunk.width,7*Chunk.height);
                getChunks(targetChunk.x-3,targetChunk.y-3,7,7).forEach(function(chunk) {
                    chunk.draw(g);
                    chunk.draw(backgroundG);
                });
            }


            player.draw(new Graphics(trailContext));

            g.context.restore();

            g.context.restore();
        });
        initializeChunks();
        (function() { // Prerender chunks
            var g = new Graphics(backgroundContext);
            chunks.forEach(function(chunk) {
                chunk.draw(g);
            });
        })();
        g.chains.update.insertAfter(function(dt,next) {
            var chunkAtPlayer = getChunkAtPlayer();
            if (player.chunk !== chunkAtPlayer) {
                var oldChunk = player.chunk;
                var newChunk = chunkAtPlayer;
                oldChunk.objects.remove(player);
                player.chunk = newChunk;
                newChunk.objects.add(player);

                oldChunk.objects.handlePending();
                newChunk.objects.handlePending();
            }

            var playerChunk = getChunkAtPlayer();
            playerChunk.update(dt);
            handleCollision(getChunks(playerChunk.x-1,playerChunk.y-1,3,3));
            if (playerChunk !== player.chunk) {
                player.chunk.objects.remove(player);
                playerChunk.objects.add(player);
                player.chunk = playerChunk;
                player.chunk.objects.handlePending();
                playerChunk.objects.handlePending();
            }
            next(dt);
        },g.chains.update.objects);

        //#states
        function gameplayState() {
            var me = {
                enabled: false,
                enable: enable,
                disable: disable
            };
            function enable() {
                g.chains.update.push(update);
                // g.chains.draw.insertBefore(draw, g.chains.draw.camera);
                g.on('mousedown', mousedown);
                g.on('keydown',keydown);
            }

            function disable() {
                g.chains.update.remove(update);
                // g.chains.draw.remove(draw);
                g.removeListener('mousedown', mousedown);
                g.removeListener('keydown',keydown);
            }

            function keydown(key) {
                if (key === 'x' || key === 'w' || key === 'space' || key === 'z') {
                    player.jump();
                } else if (key === 'r') {
                    var closest = player.checkpoints.reduce(function(closest,checkpoint) {
                        return checkpoint.position.distanceTo(magnifier.targetx,magnifier.targety) < closest.position.distanceTo(magnifier.targetx,magnifier.targety)
                            ? checkpoint
                            : closest;
                    });

                    player.chunk.objects.remove(player);
                    player.chunk.objects.handlePending();

                    player.chunk = closest.chunk;
                    player.position.setV(closest.position);
                    player.chunk.objects.add(player);
                    player.chunk.objects.handlePending();
                } else if (key === 'm') {
                    player.position.x = magnifier.targetx;
                    player.position.y = magnifier.targety;
                    player.chunk.objects.remove(player);
                    player.chunk.objects.handlePending();
                    var targetchunk = getChunkAt(magnifier.targetx,magnifier.targety);
                    console.log(player.chunk,magnifier.chunk);
                    targetchunk.objects.add(player);
                    targetchunk.objects.handlePending();
                    player.chunk = targetchunk;
                }
            }

            function update(dt, next) {
                // Post update
                next(dt);
            }

            function draw(g, next) {
                // Draw HUD
                next(g);
            }

            function mousedown(button) {}
            return me;
        }

        function editState() {
            var me = {
                enabled: false,
                enable: enable,
                disable: disable
            };

            function enable() {
            }

            function disable() {
            }
        }
        var player;

        function flatten(arr) {
            var r = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].length !== undefined) {
                    r = r.concat(flatten(arr[i]));
                } else {
                    r.push(arr[i]);
                }
            }
            return r;
        }


        g.changeState(gameplayState());
        game.objects.handlePending();
        g.start();
    }
});
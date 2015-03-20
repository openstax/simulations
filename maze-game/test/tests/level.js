
describe('Level', function(){

    var Level;
    var testLevel
    var charsToTileValues;

    before(function(done) {
        require([
            'models/level', 
        ], function(level) {
            Level = level;

            charsToTileValues = {
                ' ': Level.TILE_FLOOR,
                'W': Level.TILE_WALL,
                'S': Level.TILE_START,
                'F': Level.TILE_FINISH
            };

            testLevel = Level.fromStringArray([
                ' W                              ',
                '  W                           S ',
                '                                ',
                '                                ',
                '                                ',
                '                                ',
                '                                ',
                '                W               ',
                '                                ',
                '                                ',
                '                                ',
                '                                ',
                ' F                              ',
                '                                '
            ], charsToTileValues);

            done();
        });
    });

    it('#fromStringArray should parse string arrays', function(){
        chai.expect(testLevel.data[0][0]).to.equal(Level.TILE_FLOOR);
        chai.expect(testLevel.data[0][1]).to.equal(Level.TILE_WALL);
        chai.expect(testLevel.data[1][2]).to.equal(Level.TILE_WALL);
        chai.expect(testLevel.data[2][1]).to.equal(Level.TILE_FLOOR);
    });

    it('#tileAt should get correct value', function(){
        chai.expect(testLevel.tileAt(-16, -7)).to.equal(Level.TILE_FLOOR);
        chai.expect(testLevel.tileAt(-15, -7)).to.equal(Level.TILE_WALL);
        chai.expect(testLevel.tileAt(-14, -6)).to.equal(Level.TILE_WALL);
        chai.expect(testLevel.tileAt(-15, -5)).to.equal(Level.TILE_FLOOR);

        chai.expect(testLevel.tileAt(-0.5, -0.5)).to.equal(Level.TILE_FLOOR);
        chai.expect(testLevel.tileAt( 0.5, -0.5)).to.equal(Level.TILE_FLOOR);
        chai.expect(testLevel.tileAt( 0.5,  0.5)).to.equal(Level.TILE_WALL);
        chai.expect(testLevel.tileAt(-0.5,  0.5)).to.equal(Level.TILE_FLOOR);
    });

    it('#collidesWithTileTypeAt should detect collisions within a certain radius of a point', function(){
        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_WALL, -15.5, -6.5, 0.4)).to.be.false;
        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_WALL, -14.5, -6.5, 0.4)).to.be.true;
        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_WALL, -13.5, -5.5, 0.4)).to.be.true;
        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_WALL, -14.5, -4.5, 0.4)).to.be.false;

        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_FINISH, -13, 5.5, 1.2)).to.be.true;
        chai.expect(testLevel.collidesWithTileTypeAt(Level.TILE_FINISH, -13, 5.5, 0.6)).to.be.false;
    });

});
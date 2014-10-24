
describe('DataSeries', function(){

	var DataSeries;

	before(function(done) {
		require(['models/data-series'], function(dataSeries) {
			DataSeries = dataSeries;
			done();
		});
	});

	it('should return point range', function(){
		var series = new DataSeries();
		series.add(20, 0);
		series.add(15, 1);
		series.add(10, 2);
		series.add(15, 3);
		series.add(20, 4);

		chai.expect(series.getPointsInRange(0, 4)).to.deep.equal([
			{ value: 20, time: 0 },
			{ value: 15, time: 1 },
			{ value: 10, time: 2 },
			{ value: 15, time: 3 },
			{ value: 20, time: 4 }
		]);

		chai.expect(series.getPointsInRange(1, 3)).to.deep.equal([
			{ value: 15, time: 1 },
			{ value: 10, time: 2 },
			{ value: 15, time: 3 }
		]);
	});

	it('should return last point', function(){
		var series = new DataSeries();
		series.add(5, 0);
		series.add(10, 1);
		series.add(15, 2);
		series.add(20, 3);

		chai.expect(series.getLastPoint()).to.deep.equal({ value: 20, time: 3 });
	});

	it('should return midpoint', function(){
		var series = new DataSeries();
		series.add(5, 0);
		series.add(10, 1);
		series.add(15, 2);

		chai.expect(series.getMidPoint()).to.deep.equal({ value: 10, time: 1 });

		series.add(20, 3);

		chai.expect(series.getMidPoint()).to.deep.equal({ value: 15, time: 2 });
	});

	it('should limit size correctly', function(){
		var series = new DataSeries.LimitedSize({
			maxSize: 3
		});

		series.add(5, 0);
		series.add(10, 1);
		series.add(15, 2);

		chai.expect(series.getLastPoint()).to.deep.equal({ value: 15, time: 2 });
		chai.expect(series.size()).to.equal(3);

		series.add(20, 3);

		chai.expect(series.getLastPoint()).to.deep.equal({ value: 20, time: 3 });
		chai.expect(series.size()).to.equal(3);
	});

	it('should limit time correctly', function(){
		var series = new DataSeries.LimitedSize({
			maxTime: 4
		});

		series.add(5, 0);
		series.add(10, 1);
		series.add(15, 2);
		chai.expect(series.size()).to.equal(3);

		series.add(5, 0);
		series.add(10, 1);
		series.add(15, 2);
		chai.expect(series.size()).to.equal(3);

		series.add(25, 4);
		series.add(64, 5);
		series.add(11, 6);
		chai.expect(series.size()).to.equal(5);
	});

});
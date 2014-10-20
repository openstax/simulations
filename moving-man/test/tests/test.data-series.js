
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

	// it('should return last point', function(){
	// 	var series = DataSeries();
		
	// });

	// it('should return midpoint', function(){
	// 	var series = DataSeries();
		
	// });

	// it('should limit size correctly', function(){
	// 	var series = DataSeries.LimitedSize({
	// 		maxSize: 4
	// 	});

		
	// });

	// it('should limit time correctly', function(){
	// 	var series = DataSeries.LimitedSize({
	// 		maxSize: 4
	// 	});

		
	// });

});
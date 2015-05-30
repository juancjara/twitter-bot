var utils = require('../helpers/utils');

var theater = {
  iterable: true,
  getList: function() {
    var cinemas = [
      {
        id: 0,
        realName: 'AMC Empire 25',
        similars: ['amc', 'empire', '25'],
        type: 'cinema'
      },
      {
        id: 1,
        realName: 'Alamo Drafthouse Littleton',
        similars: ['alamo', 'drafthouse', 'littleton'],
        type: 'cinema'
      }
    ];
    return cinemas;
  },
  format: function(params) {
    var cinema = {
      id: params.id,
      realName: params.name,
      similars: utils.createSimilars(params.name),
      type: 'cinema'
    }
    return cinema;
  },
  findOne: function(clue) {
    return 'Theater B';
  }
}

module.exports = theater;